from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

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
