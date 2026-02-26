from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    employee_limit = serializers.ReadOnlyField()

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_employee_count(self, obj):
        return obj.employees_employee_set.filter(is_active=True).count()


class CompanyOnboardingSerializer(serializers.Serializer):
    """Used during initial registration — creates company + admin user atomically."""
    # Company fields
    company_name = serializers.CharField(max_length=200)
    company_type = serializers.ChoiceField(choices=Company.CompanyType.choices)
    tax_identifier = serializers.CharField(max_length=50, required=False, allow_blank=True)
    company_email = serializers.EmailField()
    company_phone = serializers.CharField(max_length=20)
    country_iso = serializers.CharField(max_length=2, required=False, allow_blank=True)

    # Admin user fields
    admin_first_name = serializers.CharField(max_length=100)
    admin_last_name = serializers.CharField(max_length=100)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(min_length=10, write_only=True)
