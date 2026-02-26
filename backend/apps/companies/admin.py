from django.contrib import admin
from django.utils.html import format_html

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = (
        "name", "company_type", "subscription_plan", "is_active",
        "employee_count", "tax_identifier", "city", "country", "created_at",
    )
    list_filter = ("company_type", "subscription_plan", "is_active", "country")
    search_fields = ("name", "tax_identifier", "social_security_identifier", "registration_number", "email")
    ordering = ("name",)
    readonly_fields = ("id", "created_at", "updated_at", "logo_preview")

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "id", "name", "company_type", "registration_number",
                "tax_identifier", "social_security_identifier", "incorporation_date",
            ),
        }),
        ("Contact", {"fields": ("email", "phone", "website", "address", "city", "state_province", "postal_code", "country", "currency", "timezone")}),
        ("Branding", {"fields": ("logo", "logo_preview", "primary_color")}),
        ("Subscription", {
            "fields": ("subscription_plan", "subscription_expires_at", "is_active"),
        }),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height:40px;"/>', obj.logo.url)
        return "—"
    logo_preview.short_description = "Logo Preview"

    def employee_count(self, obj):
        return obj.users.filter(is_active=True).count()
    employee_count.short_description = "Active Users"
