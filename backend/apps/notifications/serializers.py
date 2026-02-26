from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ["company", "recipient"]
        read_only_fields = ["id", "created_at", "notification_type", "title", "body"]
