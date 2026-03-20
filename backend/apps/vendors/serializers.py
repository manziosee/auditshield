from rest_framework import serializers
from .models import Vendor, VendorDocument


class VendorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocument
        fields = ["id", "document_type", "title", "document", "expiry_date", "status", "created_at"]


class VendorSerializer(serializers.ModelSerializer):
    vendor_documents = VendorDocumentSerializer(many=True, read_only=True)
    country_name = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id", "name", "vendor_type", "contact_name", "contact_email", "contact_phone",
            "tax_identifier", "status", "compliance_score", "country", "country_name",
            "notes", "vendor_documents", "created_at"
        ]

    def get_country_name(self, obj):
        return obj.country.name if obj.country else None
