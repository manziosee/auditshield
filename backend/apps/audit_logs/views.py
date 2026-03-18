import csv
import io
import json

from django.http import HttpResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import AuditLog
from .serializers import AuditLogSerializer


@extend_schema(
    tags=["audit-logs"],
    summary="List audit log entries",
    description=(
        "Returns the **immutable** audit trail of all mutating API calls "
        "(POST, PUT, PATCH, DELETE).\n\n"
        "**Scope**: Company users see only their company's logs. "
        "Super admins see all logs across companies.\n\n"
        "Each entry captures: HTTP method, path, status code, IP address, "
        "user agent, duration (ms), and a scrubbed request body "
        "(passwords and tokens are redacted automatically).\n\n"
        "Logs cannot be modified or deleted — they are the compliance evidence trail."
    ),
    parameters=[
        OpenApiParameter("page", OpenApiTypes.INT, description="Page number"),
        OpenApiParameter("page_size", OpenApiTypes.INT, description="Results per page (default 25)"),
        OpenApiParameter("search", OpenApiTypes.STR, description="Search in user email or path"),
        OpenApiParameter("method", OpenApiTypes.STR, description="Filter by HTTP method: GET, POST, PUT, PATCH, DELETE"),
        OpenApiParameter("status_range", OpenApiTypes.STR, description="Filter by status range: 2xx, 3xx, 4xx, 5xx"),
    ],
    responses={200: OpenApiResponse(description="Paginated audit log entries")},
)
class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ["user__email", "path"]

    def get_queryset(self):
        user = self.request.user
        qs = AuditLog.objects.select_related("user").order_by("-created_at")

        if user.role != "super_admin":
            qs = qs.filter(company=user.company)

        # Method filter
        method = self.request.query_params.get("method")
        if method:
            qs = qs.filter(method=method.upper())

        # Status range filter
        status_range = self.request.query_params.get("status_range")
        if status_range == "2xx":
            qs = qs.filter(status_code__gte=200, status_code__lt=300)
        elif status_range == "3xx":
            qs = qs.filter(status_code__gte=300, status_code__lt=400)
        elif status_range == "4xx":
            qs = qs.filter(status_code__gte=400, status_code__lt=500)
        elif status_range == "5xx":
            qs = qs.filter(status_code__gte=500)

        return qs


def _build_audit_qs(request):
    """Shared queryset builder used by both list and export views."""
    user = request.user
    qs = AuditLog.objects.select_related("user").order_by("-created_at")

    if user.role != "super_admin":
        qs = qs.filter(company=user.company)

    method = request.query_params.get("method")
    if method:
        qs = qs.filter(method=method.upper())

    status_range = request.query_params.get("status_range")
    if status_range == "2xx":
        qs = qs.filter(status_code__gte=200, status_code__lt=300)
    elif status_range == "3xx":
        qs = qs.filter(status_code__gte=300, status_code__lt=400)
    elif status_range == "4xx":
        qs = qs.filter(status_code__gte=400, status_code__lt=500)
    elif status_range == "5xx":
        qs = qs.filter(status_code__gte=500)

    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    return qs


@extend_schema(
    tags=["audit-logs"],
    summary="Export audit log entries",
    description=(
        "Downloads the audit trail as CSV (default) or JSON.\n\n"
        "Max 10,000 rows. Columns: timestamp, user_email, method, path, status_code, "
        "ip_address, duration_ms.\n\n"
        "**Query params**: `format` (csv|json), `date_from` (YYYY-MM-DD), `date_to`, "
        "`method`, `status_range` (2xx|3xx|4xx|5xx)"
    ),
    parameters=[
        OpenApiParameter("format", OpenApiTypes.STR, description="csv (default) or json"),
        OpenApiParameter("date_from", OpenApiTypes.DATE, description="Start date (YYYY-MM-DD)"),
        OpenApiParameter("date_to", OpenApiTypes.DATE, description="End date (YYYY-MM-DD)"),
        OpenApiParameter("method", OpenApiTypes.STR, description="HTTP method filter"),
        OpenApiParameter("status_range", OpenApiTypes.STR, description="2xx | 3xx | 4xx | 5xx"),
    ],
    responses={200: OpenApiResponse(description="CSV or JSON file download")},
)
class AuditLogExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get("format", "csv").lower()
        qs = _build_audit_qs(request)[:10000]

        COLUMNS = ["created_at", "user__email", "method", "path", "status_code", "ip_address", "duration_ms"]
        rows = list(qs.values(*COLUMNS))

        if fmt == "json":
            for row in rows:
                if row.get("created_at"):
                    row["created_at"] = row["created_at"].isoformat()
            content = json.dumps(rows, default=str)
            response = HttpResponse(content, content_type="application/json")
            response["Content-Disposition"] = 'attachment; filename="audit-log-export.json"'
            return response

        # CSV (default)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["timestamp", "user_email", "method", "path", "status_code", "ip_address", "duration_ms"])
        for row in rows:
            writer.writerow([
                row.get("created_at", ""),
                row.get("user__email", ""),
                row.get("method", ""),
                row.get("path", ""),
                row.get("status_code", ""),
                row.get("ip_address", ""),
                row.get("duration_ms", ""),
            ])

        response = HttpResponse(output.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="audit-log-export.csv"'
        return response
