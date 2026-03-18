from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import WebhookEndpoint
from .serializers import WebhookEndpointSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["webhooks"],
        summary="List webhook endpoints",
        description="Returns all webhook endpoints configured for the authenticated company.",
    ),
    create=extend_schema(
        tags=["webhooks"],
        summary="Create webhook endpoint",
        description=(
            "Registers a new webhook endpoint for this company. "
            "Events will be signed with HMAC-SHA256 using the provided secret "
            "and delivered in the X-AuditShield-Signature header."
        ),
    ),
    retrieve=extend_schema(
        tags=["webhooks"],
        summary="Get webhook endpoint",
    ),
    update=extend_schema(
        tags=["webhooks"],
        summary="Update webhook endpoint",
    ),
    partial_update=extend_schema(
        tags=["webhooks"],
        summary="Partially update webhook endpoint",
    ),
    destroy=extend_schema(
        tags=["webhooks"],
        summary="Delete webhook endpoint",
        description="Removes the webhook endpoint. No further events will be delivered.",
    ),
)
class WebhookEndpointViewSet(viewsets.ModelViewSet):
    serializer_class = WebhookEndpointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WebhookEndpoint.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
