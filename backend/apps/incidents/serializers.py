from rest_framework import serializers
from .models import Incident, IncidentUpdate


class IncidentUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = IncidentUpdate
        fields = ["id", "content", "author", "author_name", "created_at"]
        read_only_fields = ["author"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.email


class IncidentSerializer(serializers.ModelSerializer):
    updates = IncidentUpdateSerializer(many=True, read_only=True)
    reported_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    employees_involved_names = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            "id", "title", "description", "incident_type", "severity", "status",
            "incident_date", "reported_by", "reported_by_name", "assigned_to", "assigned_to_name",
            "employees_involved", "employees_involved_names", "corrective_action",
            "resolved_at", "updates", "created_at"
        ]
        read_only_fields = ["reported_by", "resolved_at"]

    def get_reported_by_name(self, obj):
        return obj.reported_by.get_full_name() or obj.reported_by.email

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.email
        return None

    def get_employees_involved_names(self, obj):
        return [f"{e.first_name} {e.last_name}" for e in obj.employees_involved.all()]
