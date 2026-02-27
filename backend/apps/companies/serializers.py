from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    employee_limit = serializers.ReadOnlyField()
    preferred_currency = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_employee_count(self, obj):
        return obj.employees_employee_set.filter(is_active=True).count()

    def get_preferred_currency(self, obj):
        """Return the ISO currency code string for the frontend."""
        if obj.currency:
            return obj.currency.code
        if obj.country and obj.country.default_currency:
            return obj.country.default_currency.code
        return "USD"

    def update(self, instance, validated_data):
        # Handle preferred_currency string → FK conversion
        preferred_currency = self.context.get("request") and self.context["request"].data.get("preferred_currency")
        if preferred_currency:
            from apps.geography.models import Currency
            try:
                currency_obj = Currency.objects.get(code=preferred_currency.upper())
                validated_data["currency"] = currency_obj
            except Currency.DoesNotExist:
                pass
        return super().update(instance, validated_data)


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
