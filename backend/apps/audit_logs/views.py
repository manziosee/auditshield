from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

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
    ],
    responses={200: OpenApiResponse(description="Paginated audit log entries")},
)
class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AuditLog.objects.select_related("user").order_by("-created_at")
        if user.role != "super_admin":
            qs = qs.filter(company=user.company)
        return qs
