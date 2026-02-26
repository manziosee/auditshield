from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ComplianceCategory, ComplianceRecord, ComplianceRequirement
from .serializers import ComplianceCategorySerializer, ComplianceRecordSerializer, RequirementSerializer
from .utils import get_company_compliance_score


@extend_schema(
    tags=["compliance"],
    summary="Compliance dashboard summary",
    description=(
        "Returns aggregate compliance statistics for the company:\n\n"
        "- **score**: Overall compliance score (0–100)\n"
        "- **compliant**: Fulfilled requirements\n"
        "- **pending**: Requirements not yet acted on\n"
        "- **overdue**: Past-due requirements\n"
        "- **total**: Total requirements tracked"
    ),
    responses={200: OpenApiResponse(description="Dashboard statistics")},
)
class ComplianceDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_company_compliance_score(request.user.company)
        return Response(data)


@extend_schema_view(
    get=extend_schema(
        tags=["compliance"],
        summary="List compliance records",
        description=(
            "Returns all compliance records for the company.\n\n"
            "**Filter**: `status` — compliant | pending | overdue | exempt | not_applicable"
        ),
        parameters=[
            OpenApiParameter("status", OpenApiTypes.STR, description="Filter by compliance status"),
        ],
    ),
    post=extend_schema(
        tags=["compliance"],
        summary="Create a compliance record",
        description="Manually create a compliance record for a requirement and period.",
    ),
)
class ComplianceRecordListView(generics.ListCreateAPIView):
    serializer_class = ComplianceRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "requirement__category"]
    search_fields = ["requirement__title", "notes"]
    ordering_fields = ["due_date", "created_at", "status"]
    ordering = ["due_date"]

    def get_queryset(self):
        return (
            ComplianceRecord.objects
            .filter(company=self.request.user.company)
            .select_related("requirement", "requirement__category", "completed_by")
        )

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


@extend_schema_view(
    get=extend_schema(tags=["compliance"], summary="Get compliance record"),
    put=extend_schema(
        tags=["compliance"],
        summary="Update compliance record",
        description="Mark as compliant, add evidence documents, or update notes.",
    ),
    patch=extend_schema(tags=["compliance"], summary="Partially update compliance record"),
    delete=extend_schema(tags=["compliance"], summary="Delete compliance record"),
)
class ComplianceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ComplianceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ComplianceRecord.objects.filter(company=self.request.user.company)


@extend_schema(
    tags=["compliance"],
    summary="List compliance requirements",
    description=(
        "Returns the global library of RRA/RSSB/Labor Law requirements. "
        "Grouped by category (e.g. RRA Tax, RSSB, Labor Law). "
        "Use these to understand what records your company must track."
    ),
    responses={200: OpenApiResponse(description="Requirements with category details")},
)
class RequirementListView(generics.ListAPIView):
    queryset = ComplianceRequirement.objects.select_related("category").all()
    serializer_class = RequirementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "frequency", "is_mandatory"]


@extend_schema(
    tags=["compliance"],
    summary="List compliance categories",
    description="Returns the global list of compliance categories (RRA Tax, RSSB, Labor Law, etc.).",
    responses={200: OpenApiResponse(description="Category list")},
)
class ComplianceCategoryListView(generics.ListAPIView):
    queryset = ComplianceCategory.objects.order_by("order").all()
    serializer_class = ComplianceCategorySerializer
    permission_classes = [IsAuthenticated]
