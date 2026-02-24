from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True, default="anonymous")

    class Meta:
        model = AuditLog
        fields = "__all__"
