from rest_framework import serializers
from .models import Partner, PartnerBranding, PartnerCompany


class PartnerBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerBranding
        fields = ["id", "logo_url", "primary_color", "secondary_color", "platform_name", "support_email", "custom_domain"]


class PartnerSerializer(serializers.ModelSerializer):
    branding = PartnerBrandingSerializer(read_only=True)
    company_count = serializers.SerializerMethodField()

    class Meta:
        model = Partner
        fields = ["id", "name", "slug", "contact_email", "is_active", "branding", "company_count", "created_at"]

    def get_company_count(self, obj):
        return obj.partner_companies.count()


class PartnerCompanySerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = PartnerCompany
        fields = ["id", "partner", "company", "company_name", "added_at"]

    def get_company_name(self, obj):
        return obj.company.name
