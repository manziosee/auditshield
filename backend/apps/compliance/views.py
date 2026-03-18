from datetime import timedelta

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
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
        qs = (
            ComplianceRecord.objects
            .filter(company=self.request.user.company)
            .select_related(
                "requirement",
                "requirement__category",
                "requirement__category__authority",
                "completed_by",
            )
        )
        # Filter by authority type via query param (e.g. ?authority=Tax+Authority)
        authority_filter = self.request.query_params.get("authority")
        if authority_filter:
            type_map = {
                "Tax Authority": "tax",
                "Social Security Agency": "social_security",
                "Labour Department": "labor",
                "Business Registry": "corporate",
            }
            auth_type = type_map.get(authority_filter)
            if auth_type:
                qs = qs.filter(requirement__category__authority__authority_type=auth_type)
        return qs

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
        return ComplianceRecord.objects.filter(
            company=self.request.user.company
        ).select_related(
            "requirement",
            "requirement__category",
            "requirement__category__authority",
            "completed_by",
        )


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


# ─── Health Pulse ─────────────────────────────────────────────────────────────

def _linear_regression_predict(x_vals, y_vals, x_pred):
    """Simple linear regression returning predicted y for x_pred."""
    n = len(x_vals)
    if n < 2:
        return y_vals[-1] if y_vals else 0
    sum_x = sum(x_vals)
    sum_y = sum(y_vals)
    sum_xy = sum(x * y for x, y in zip(x_vals, y_vals))
    sum_xx = sum(x * x for x in x_vals)
    denom = n * sum_xx - sum_x ** 2
    if denom == 0:
        return y_vals[-1]
    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n
    return slope * x_pred + intercept


@extend_schema(
    tags=["compliance"],
    summary="Compliance health pulse",
    description=(
        "Returns a rolling 6-month compliance score history plus trend analysis.\n\n"
        "- **history**: Month-by-month score (YYYY-MM)\n"
        "- **trend**: improving / declining / stable\n"
        "- **predicted_30d**: Linear-regression forecast for next 30 days\n"
        "- **risk_level**: critical (<50) / at_risk (50–69) / moderate (70–84) / low (85+)\n"
        "- **days_to_threshold**: If declining, estimated days until score hits 70"
    ),
    responses={200: OpenApiResponse(description="Health pulse data")},
)
class ComplianceHealthPulseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = request.user.company
        today = timezone.now().date()

        history = []
        for months_ago in range(5, -1, -1):
            # Compute the first and last day of that calendar month
            first_of_current = today.replace(day=1)
            target = (first_of_current - timedelta(days=1)).replace(day=1)
            for _ in range(months_ago):
                target = (target - timedelta(days=1)).replace(day=1)
            last_of_target = (
                (target.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            )
            label = target.strftime("%Y-%m")

            records = ComplianceRecord.objects.filter(
                company=company,
                period_end__year=target.year,
                period_end__month=target.month,
            )
            total = records.count()
            compliant = records.filter(status=ComplianceRecord.ComplianceStatus.COMPLIANT).count()
            score = int((compliant / total) * 100) if total > 0 else 0
            history.append({"month": label, "score": score})

        current_score = history[-1]["score"] if history else 0

        # Linear regression on last 3 months
        recent = history[-3:]
        x_vals = list(range(len(recent)))
        y_vals = [h["score"] for h in recent]
        predicted_raw = _linear_regression_predict(x_vals, y_vals, len(recent))
        predicted_30d = max(0, min(100, int(round(predicted_raw))))

        # Trend
        if len(y_vals) >= 2:
            delta = y_vals[-1] - y_vals[0]
            if delta > 3:
                trend = "improving"
            elif delta < -3:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Risk level
        if current_score < 50:
            risk_level = "critical"
        elif current_score < 70:
            risk_level = "at_risk"
        elif current_score < 85:
            risk_level = "moderate"
        else:
            risk_level = "low"

        # Days to threshold (70%) if declining
        days_to_threshold = None
        if trend == "declining" and current_score > 70:
            # slope in score-points per month; convert to days
            slope_per_month = _linear_regression_predict(
                list(range(len(recent))), y_vals, len(recent)
            ) - current_score
            if slope_per_month < 0:
                months_needed = (current_score - 70) / abs(slope_per_month)
                days_to_threshold = max(1, int(round(months_needed * 30)))

        return Response({
            "history": history,
            "current_score": current_score,
            "trend": trend,
            "predicted_30d": predicted_30d,
            "risk_level": risk_level,
            "days_to_threshold": days_to_threshold,
        })


# ─── Gap Analysis ─────────────────────────────────────────────────────────────

@extend_schema(
    tags=["compliance"],
    summary="Compliance gap analysis",
    description=(
        "Returns compliance requirements that exist globally but have NO record for "
        "this company. Filtered by industry_applicability — only gaps relevant to "
        "the company's industry are included.\n\n"
        "**priority**: critical (mandatory + overdue deadline) / high (mandatory) / medium (optional)"
    ),
    responses={200: OpenApiResponse(description="Gap analysis result")},
)
class ComplianceGapAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = request.user.company
        today = timezone.now().date()

        # Requirements already tracked by this company
        tracked_req_ids = ComplianceRecord.objects.filter(
            company=company
        ).values_list("requirement_id", flat=True).distinct()

        # All requirements not tracked
        all_reqs = ComplianceRequirement.objects.select_related(
            "category", "category__authority"
        ).exclude(id__in=tracked_req_ids)

        # Filter by industry applicability
        company_industry = (company.industry or "").lower()
        gaps = []
        for req in all_reqs:
            applicability = req.industry_applicability or []
            if applicability and company_industry not in [a.lower() for a in applicability]:
                continue

            # Priority logic
            if req.is_mandatory and req.deadline_day and req.deadline_day < today.day:
                priority = "critical"
            elif req.is_mandatory:
                priority = "high"
            else:
                priority = "medium"

            authority = req.category.authority if req.category and req.category.authority else None
            gaps.append({
                "requirement_id": str(req.id),
                "title": req.title,
                "authority": authority.name if authority else "",
                "authority_type": authority.authority_type if authority else "",
                "frequency": req.frequency,
                "is_mandatory": req.is_mandatory,
                "penalty_description": req.penalty_description,
                "category": req.category.name if req.category else "",
                "priority": priority,
            })

        total_reqs = ComplianceRequirement.objects.count()
        tracked_count = len(tracked_req_ids)
        coverage_percent = int((tracked_count / total_reqs) * 100) if total_reqs > 0 else 0

        return Response({
            "total_gaps": len(gaps),
            "gaps": gaps,
            "coverage_percent": coverage_percent,
        })


# ─── Bulk Update ──────────────────────────────────────────────────────────────

@extend_schema(
    tags=["compliance"],
    summary="Bulk update compliance records",
    description=(
        "Updates status (and optionally notes) for multiple compliance records "
        "belonging to the authenticated company.\n\n"
        "Body: `{\"ids\": [\"uuid1\", \"uuid2\"], \"status\": \"compliant\", \"notes\": \"...\"}`"
    ),
    request={"application/json": {"type": "object", "properties": {
        "ids": {"type": "array", "items": {"type": "string", "format": "uuid"}},
        "status": {"type": "string"},
        "notes": {"type": "string"},
    }, "required": ["ids", "status"]}},
    responses={200: OpenApiResponse(description="Number of updated records")},
)
class ComplianceRecordBulkUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ids = request.data.get("ids", [])
        new_status = request.data.get("status", "")
        notes = request.data.get("notes", None)

        if not ids or not new_status:
            return Response(
                {"detail": "Both 'ids' and 'status' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_statuses = [s[0] for s in ComplianceRecord.ComplianceStatus.choices]
        if new_status not in valid_statuses:
            return Response(
                {"detail": f"Invalid status '{new_status}'. Valid: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = ComplianceRecord.objects.filter(
            company=request.user.company,
            id__in=ids,
        )

        update_fields = {"status": new_status}
        if notes is not None:
            update_fields["notes"] = notes
        if new_status == ComplianceRecord.ComplianceStatus.COMPLIANT:
            update_fields["completed_date"] = timezone.now().date()

        updated = qs.update(**update_fields)

        return Response({"updated": updated})
