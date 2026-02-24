from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import Report
from .serializers import ReportSerializer
from .tasks import generate_report


@extend_schema_view(
    list=extend_schema(
        tags=["reports"],
        summary="List generated reports",
        description=(
            "Returns all PDF reports for this company, newest first. "
            "Check `is_ready` before downloading — generation is async via Celery."
        ),
    ),
    create=extend_schema(
        tags=["reports"],
        summary="Request a new report",
        description=(
            "Queues an async PDF report generation.\n\n"
            "**Report types**: `audit_readiness`, `employee_summary`, `compliance_status`, "
            "`payroll_summary`, `document_inventory`, `rra_filing`, `rssb_filing`\n\n"
            "Poll the report's `id` until `is_ready: true`, then call `/download/`."
        ),
        responses={
            201: OpenApiResponse(description="Report queued. Poll until is_ready=true."),
        },
    ),
    retrieve=extend_schema(
        tags=["reports"],
        summary="Get report status",
        description="Returns report metadata including the `is_ready` generation flag.",
    ),
    destroy=extend_schema(
        tags=["reports"],
        summary="Delete report",
        description="Permanently deletes the report record and PDF file.",
    ),
)
class ReportViewSet(ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return Report.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        report = serializer.save(
            company=self.request.user.company,
            generated_by=self.request.user,
        )
        # Trigger async PDF generation
        generate_report.delay(str(report.id))

    @extend_schema(
        tags=["reports"],
        summary="Download report PDF",
        description=(
            "Downloads the generated PDF report. "
            "Returns **202 Accepted** if generation is still in progress."
        ),
        responses={
            200: OpenApiResponse(description="PDF file stream"),
            202: OpenApiResponse(description="Generation still in progress — retry shortly"),
            404: OpenApiResponse(description="Report not found"),
        },
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        report = self.get_object()
        if not report.is_ready or not report.file:
            return Response({"detail": "Report is still being generated."}, status=status.HTTP_202_ACCEPTED)

        response = HttpResponse(report.file.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{report.title}.pdf"'
        return response
