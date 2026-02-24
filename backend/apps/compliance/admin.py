from django.contrib import admin
from django.utils.html import format_html

from .models import ComplianceCategory, ComplianceRequirement, ComplianceRecord


@admin.register(ComplianceCategory)
class ComplianceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "authority", "order", "requirement_count")
    list_editable = ("order",)
    search_fields = ("name", "authority")
    ordering = ("order", "name")

    def requirement_count(self, obj):
        return obj.requirements.count()
    requirement_count.short_description = "Requirements"


@admin.register(ComplianceRequirement)
class ComplianceRequirementAdmin(admin.ModelAdmin):
    list_display = (
        "title", "category", "frequency", "deadline_day", "is_mandatory",
    )
    list_filter = ("category", "frequency", "is_mandatory")
    search_fields = ("title", "description")
    ordering = ("category", "title")

    fieldsets = (
        (None, {"fields": ("category", "title", "description", "frequency", "deadline_day", "is_mandatory")}),
        ("Details", {"fields": ("document_types_required", "penalty_description"), "classes": ("collapse",)}),
    )


@admin.register(ComplianceRecord)
class ComplianceRecordAdmin(admin.ModelAdmin):
    list_display = (
        "requirement", "company", "status", "period_start", "period_end",
        "due_date", "overdue_badge", "completed_by",
    )
    list_filter = ("status", "company", "requirement__category")
    search_fields = ("requirement__title", "company__name", "notes")
    ordering = ("due_date",)
    readonly_fields = ("id", "created_at", "updated_at")
    date_hierarchy = "due_date"

    fieldsets = (
        (None, {"fields": ("id", "company", "requirement", "status")}),
        ("Period", {"fields": ("period_start", "period_end", "due_date", "completed_date", "completed_by")}),
        ("Evidence", {"fields": ("evidence_documents", "notes")}),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
    filter_horizontal = ("evidence_documents",)

    def overdue_badge(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color:red;font-weight:bold;">OVERDUE</span>')
        return "—"
    overdue_badge.short_description = "Overdue?"
