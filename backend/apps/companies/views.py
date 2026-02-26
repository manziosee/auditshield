from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

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

        # Create company
        company = Company.objects.create(
            name=d["company_name"],
            company_type=d["company_type"],
            tin_number=d.get("tin_number", ""),
            rssb_number=d.get("rssb_number", ""),
            email=d["company_email"],
            phone=d["company_phone"],
            district=d.get("district", ""),
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
