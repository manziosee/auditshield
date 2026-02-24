from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    is_expired = serializers.ReadOnlyField()
    days_until_expiry = serializers.ReadOnlyField()

    class Meta:
        model = Document
        exclude = ["company", "extracted_text"]
        read_only_fields = ["id", "file_name", "file_size", "mime_type", "is_encrypted",
                            "checksum", "ocr_processed", "created_at", "updated_at"]


class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        fields = ["title", "document_type", "employee", "description",
                  "tags", "expiry_date", "issue_date", "reference_number",
                  "period_start", "period_end", "file"]
