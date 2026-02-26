from rest_framework import serializers

from .models import ComplianceCategory, ComplianceRecord, ComplianceRequirement


class ComplianceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceCategory
        fields = "__all__"


class RequirementSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = ComplianceRequirement
        fields = "__all__"


class ComplianceRecordSerializer(serializers.ModelSerializer):
    requirement_title = serializers.CharField(source="requirement.title", read_only=True)
    category_name = serializers.CharField(source="requirement.category.name", read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = ComplianceRecord
        exclude = ["company"]
        read_only_fields = ["id", "created_at", "updated_at"]
