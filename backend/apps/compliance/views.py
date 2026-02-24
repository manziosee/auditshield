from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import ComplianceRecord, ComplianceRequirement
from .utils import get_company_compliance_score
from .serializers import ComplianceRecordSerializer, RequirementSerializer


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

    def get_queryset(self):
        return ComplianceRecord.objects.filter(company=self.request.user.company).select_related("requirement")

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
