from rest_framework import serializers
from .models import CertificationType, EmployeeCertification


class CertificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificationType
        fields = ["id", "name", "description", "validity_months", "is_mandatory", "reminder_days", "created_at"]


class EmployeeCertificationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    cert_type_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeCertification
        fields = [
            "id", "employee", "employee_name", "certification_type", "cert_type_name",
            "issue_date", "expiry_date", "certificate_number", "issuing_body",
            "document", "status", "notes", "created_at"
        ]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_cert_type_name(self, obj):
        return obj.certification_type.name
