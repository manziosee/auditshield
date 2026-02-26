from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source="generated_by.get_full_name", read_only=True)

    class Meta:
        model = Report
        exclude = ["company"]
        read_only_fields = ["id", "generated_by", "is_ready", "file", "created_at"]
