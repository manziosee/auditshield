from django.contrib import admin
from django.utils.html import format_html

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        "title", "report_type", "company", "generated_by",
        "is_ready", "period_start", "period_end", "created_at",
    )
    list_filter = ("report_type", "is_ready", "company")
    search_fields = ("title", "company__name", "generated_by__email")
    ordering = ("-created_at",)
    readonly_fields = ("id", "is_ready", "file", "created_at", "updated_at")
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("id", "title", "report_type", "company", "generated_by")}),
        ("Period", {"fields": ("period_start", "period_end")}),
        ("Parameters & Output", {"fields": ("parameters", "file", "is_ready")}),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def has_add_permission(self, request):
        # Reports are generated via the API, not manually in admin
        return False
