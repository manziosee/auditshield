from rest_framework import serializers

from .models import Department, Employee


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ["id", "name", "description", "employee_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_employee_count(self, obj):
        return obj.employee_set.filter(is_active=True).count()


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            "id", "employee_number", "full_name", "first_name", "last_name",
            "job_title", "department_name", "contract_type", "employment_status",
            "hire_date", "contract_end_date", "is_active", "photo",
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    full_name = serializers.ReadOnlyField()
    compliance_score = serializers.SerializerMethodField()
    currency_code = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        exclude = ["company"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_compliance_score(self, obj):
        from apps.compliance.utils import get_employee_compliance_score
        return get_employee_compliance_score(obj)

    def get_currency_code(self, obj):
        if obj.currency:
            return obj.currency.code
        try:
            if obj.company.currency:
                return obj.company.currency.code
        except Exception:
            pass
        return ""

    def validate_employee_number(self, value):
        company = self.context["request"].user.company
        qs = Employee.objects.filter(company=company, employee_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Employee number already exists in this company.")
        return value


class BulkImportSerializer(serializers.Serializer):
    """For Excel/CSV import."""
    file = serializers.FileField()
