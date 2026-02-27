from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["notifications"],
        summary="List my notifications",
        description=(
            "Returns all notifications for the authenticated user, newest first.\n\n"
            "Notification types: `document_expiry`, `compliance_due`, "
            "`contract_renewal`, `system`, `reminder`\n\n"
            "**Filters**: `notification_type`, `is_read`"
        ),
    ),
    retrieve=extend_schema(
        tags=["notifications"],
        summary="Get a notification",
    ),
    partial_update=extend_schema(
        tags=["notifications"],
        summary="Mark notification as read",
        description="Set `is_read: true` to dismiss a notification.",
    ),
    destroy=extend_schema(
        tags=["notifications"],
        summary="Delete notification",
    ),
)
class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["notification_type", "is_read"]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @extend_schema(
        tags=["notifications"],
        summary="Mark all notifications as read",
        description="Bulk-marks all unread notifications for the current user as read.",
        responses={
            200: OpenApiResponse(description="All notifications marked as read"),
        },
    )
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})

    @extend_schema(
        tags=["notifications"],
        summary="Get unread notification count",
        description="Returns the count of unread notifications for the badge indicator.",
        responses={
            200: OpenApiResponse(description="Unread count"),
        },
    )
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count})
