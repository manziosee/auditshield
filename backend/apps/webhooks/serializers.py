from rest_framework import serializers

from .models import WebhookEndpoint


class WebhookEndpointSerializer(serializers.ModelSerializer):
    """Serializer for WebhookEndpoint CRUD. Secret is write-only."""

    secret = serializers.CharField(
        write_only=True,
        help_text="HMAC secret for payload signing. Not returned after creation.",
    )

    class Meta:
        model = WebhookEndpoint
        fields = [
            "id",
            "url",
            "secret",
            "events",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
