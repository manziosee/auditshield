from rest_framework import serializers
from .models import Integration

INTEGRATION_CATALOG = {
    "quickbooks": {
        "name": "QuickBooks",
        "description": "Sync payroll and financial data from QuickBooks Online",
        "icon": "💼",
        "config_fields": ["api_key", "company_id", "environment"],
    },
    "bamboohr": {
        "name": "BambooHR",
        "description": "Auto-sync employee records from BambooHR",
        "icon": "🎋",
        "config_fields": ["api_key", "subdomain"],
    },
    "xero": {
        "name": "Xero",
        "description": "Connect Xero for payroll and accounting data",
        "icon": "📊",
        "config_fields": ["client_id", "client_secret", "tenant_id"],
    },
    "google_workspace": {
        "name": "Google Workspace",
        "description": "Import users and groups from Google Workspace",
        "icon": "🔷",
        "config_fields": ["service_account_json", "domain"],
    },
    "slack": {
        "name": "Slack",
        "description": "Send compliance alerts and notifications to Slack",
        "icon": "💬",
        "config_fields": ["webhook_url", "channel"],
    },
}


class IntegrationSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Integration
        fields = [
            "id", "integration_type", "display_name", "name", "is_active",
            "config", "last_sync_at", "sync_status", "error_message", "created_at"
        ]
        extra_kwargs = {"config": {"write_only": True}}

    def get_display_name(self, obj):
        return obj.get_integration_type_display()
