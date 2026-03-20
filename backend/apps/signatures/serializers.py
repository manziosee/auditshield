from rest_framework import serializers
from .models import SignatureRequest, SignatureRequestSigner


class SignatureRequestSignerSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = SignatureRequestSigner
        fields = ["id", "employee", "employee_name", "role", "order", "status", "signed_at", "ip_address"]
        read_only_fields = ["signed_at", "ip_address", "status"]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class SignatureRequestSerializer(serializers.ModelSerializer):
    signers = SignatureRequestSignerSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    document_title = serializers.SerializerMethodField()

    class Meta:
        model = SignatureRequest
        fields = [
            "id", "title", "message", "status", "expires_at",
            "document", "document_title", "created_by", "created_by_name",
            "signers", "created_at", "updated_at"
        ]
        read_only_fields = ["status", "created_by"]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email

    def get_document_title(self, obj):
        return obj.document.title if obj.document else ""
