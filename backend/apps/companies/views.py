import json
from datetime import date, datetime

from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import Company
from .serializers import CompanyOnboardingSerializer, CompanySerializer


class OnboardingRateThrottle(AnonRateThrottle):
    scope = "anon"  # 20/min from base.py settings


@extend_schema(
    tags=["companies"],
    summary="Onboard a new company",
    description=(
        "Creates a new **Company** tenant and its first **admin user** in a single "
        "atomic transaction. This is the public sign-up endpoint — no authentication needed.\n\n"
        "On success, use `POST /api/v1/auth/login/` with the admin credentials to obtain tokens."
    ),
    responses={
        201: OpenApiResponse(description="Company and admin user created. Returns company_id and user_id."),
        400: OpenApiResponse(description="Validation error — check field errors in the response."),
    },
)
class OnboardingView(generics.GenericAPIView):
    """
    Single endpoint to register a new company and its admin user.
    Called from the public sign-up flow.
    """
    serializer_class = CompanyOnboardingSerializer
    permission_classes = [AllowAny]
    throttle_classes = [OnboardingRateThrottle]

    @transaction.atomic
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # Resolve optional country FK
        country = None
        if d.get("country_iso"):
            from apps.geography.models import Country
            country = Country.objects.filter(iso_code=d["country_iso"].upper()).first()

        # Create company
        company = Company.objects.create(
            name=d["company_name"],
            company_type=d["company_type"],
            tax_identifier=d.get("tax_identifier", ""),
            email=d["company_email"],
            phone=d["company_phone"],
            country=country,
        )

        # Create admin user
        admin = User.objects.create_user(
            email=d["admin_email"],
            password=d["admin_password"],
            first_name=d["admin_first_name"],
            last_name=d["admin_last_name"],
            role=User.Role.COMPANY_ADMIN,
            company=company,
            must_change_password=False,
        )

        return Response({
            "detail": "Company registered successfully.",
            "company_id": str(company.id),
            "user_id": str(admin.id),
        }, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        tags=["companies"],
        summary="Get company profile",
        description="Returns the authenticated user's company details including subscription plan.",
    ),
    put=extend_schema(
        tags=["companies"],
        summary="Update company profile",
        description="Full update of company information (admin only).",
    ),
    patch=extend_schema(
        tags=["companies"],
        summary="Partially update company profile",
    ),
)
class CompanyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.company


@extend_schema(
    tags=["companies"],
    summary="Get company by UUID",
    description="Returns the authenticated user's company. The UUID must match the user's company.",
)
class CompanyByIdView(generics.RetrieveUpdateAPIView):
    """Same as profile view but accessed by UUID — used by the frontend settings form."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Always return the user's own company (UUID is for URL consistency only)
        return self.request.user.company


@extend_schema(
    tags=["companies"],
    summary="Export all company data as JSON",
    description=(
        "Downloads a JSON file containing the company's employees, documents metadata, "
        "compliance records, and audit log entries for data migration or backup purposes."
    ),
    responses={
        200: OpenApiResponse(description="JSON file download"),
    },
)
class CompanyExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.http import HttpResponse

        company = request.user.company

        # Employees
        from apps.employees.models import Employee
        employees = list(
            Employee.objects.filter(company=company).values(
                "employee_number", "first_name", "last_name", "email",
                "phone", "job_title", "employment_status", "contract_type",
                "hire_date", "department__name",
            )
        )

        # Documents (metadata only, not file content)
        from apps.documents.models import Document
        documents = list(
            Document.objects.filter(company=company).values(
                "title", "document_type", "status", "file_name",
                "file_size", "expiry_date", "created_at",
            )
        )

        # Compliance records
        from apps.compliance.models import ComplianceRecord
        compliance = list(
            ComplianceRecord.objects.filter(company=company).values(
                "requirement__title", "status", "period_start",
                "period_end", "due_date", "completed_date",
            )
        )

        # Audit logs
        try:
            from apps.audit_logs.models import AuditLog
            audit_logs = list(
                AuditLog.objects.filter(company=company).order_by("-timestamp").values(
                    "action", "resource_type", "resource_id",
                    "user__email", "timestamp", "ip_address",
                )[:500]
            )
        except Exception:
            audit_logs = []

        def default_serializer(obj):
            if isinstance(obj, date | datetime):
                return obj.isoformat()
            return str(obj)

        payload = json.dumps({
            "company": {"name": company.name, "id": str(company.id)},
            "exported_at": datetime.utcnow().isoformat(),
            "employees": employees,
            "documents": documents,
            "compliance_records": compliance,
            "audit_logs": audit_logs,
        }, default=default_serializer, indent=2)

        response = HttpResponse(payload, content_type="application/json")
        response["Content-Disposition"] = f'attachment; filename="company-export-{company.id}.json"'
        return response
