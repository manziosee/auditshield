from rest_framework import serializers
from .models import Policy, PolicyAcknowledgment


class PolicyAcknowledgmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = PolicyAcknowledgment
        fields = ["id", "employee", "employee_name", "acknowledged_at", "ip_address"]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class PolicySerializer(serializers.ModelSerializer):
    acknowledgment_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Policy
        fields = [
            "id", "title", "content", "version", "status", "effective_date",
            "category", "requires_acknowledgment", "created_by", "created_by_name",
            "published_at", "acknowledgment_count", "created_at"
        ]
        read_only_fields = ["version", "created_by", "published_at"]

    def get_acknowledgment_count(self, obj):
        return obj.acknowledgments.count()

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email
