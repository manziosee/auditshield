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
    requirement_frequency = serializers.CharField(source="requirement.frequency", read_only=True)
    category_name = serializers.CharField(source="requirement.category.name", read_only=True)
    # Authority display name used by the frontend badge
    authority = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = ComplianceRecord
        exclude = ["company"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_authority(self, obj):
        """Return human-readable authority type label."""
        try:
            auth = obj.requirement.category.authority
            if auth is None:
                return "Other"
            type_labels = {
                "tax": "Tax Authority",
                "social_security": "Social Security Agency",
                "labor": "Labour Department",
                "corporate": "Business Registry",
                "environmental": "Environmental",
                "financial": "Financial Regulator",
                "other": "Other",
            }
            return type_labels.get(auth.authority_type, auth.name)
        except AttributeError:
            return "Other"
