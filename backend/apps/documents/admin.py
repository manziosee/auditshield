from django.contrib import admin
from django.utils.html import format_html

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title", "document_type", "status", "employee_link",
        "is_encrypted", "ocr_processed", "expiry_status", "file_size_display",
        "company", "created_at",
    )
    list_filter = (
        "company", "document_type", "status", "is_encrypted",
        "ocr_processed",
    )
    search_fields = ("title", "reference_number", "file_name", "employee__first_name", "employee__last_name")
    ordering = ("-created_at",)
    readonly_fields = (
        "id", "is_encrypted", "checksum", "file_size", "mime_type",
        "file_name", "extracted_text", "ocr_processed", "created_at", "updated_at",
    )
    date_hierarchy = "created_at"

    fieldsets = (
        ("Document Info", {
            "fields": (
                "id", "title", "document_type", "status", "company",
                "employee", "uploaded_by", "reference_number",
            ),
        }),
        ("File Details", {
            "fields": ("file", "file_name", "file_size", "mime_type", "is_encrypted", "checksum"),
        }),
        ("Dates", {"fields": ("issue_date", "expiry_date", "period_start", "period_end")}),
        ("Content", {"fields": ("description", "tags", "extracted_text", "ocr_processed")}),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def employee_link(self, obj):
        if obj.employee:
            return format_html(
                '<a href="/admin/employees/employee/{}/change/">{}</a>',
                obj.employee.pk,
                obj.employee.full_name,
            )
        return "—"
    employee_link.short_description = "Employee"

    def expiry_status(self, obj):
        if obj.is_expired:
            return format_html('<span style="color:red;font-weight:bold;">Expired</span>')
        days = obj.days_until_expiry
        if days is not None and days <= 30:
            return format_html('<span style="color:orange;">Expires in {} days</span>', days)
        return format_html('<span style="color:green;">OK</span>')
    expiry_status.short_description = "Expiry"

    def file_size_display(self, obj):
        if obj.file_size:
            size_kb = obj.file_size / 1024
            if size_kb > 1024:
                return f"{size_kb / 1024:.1f} MB"
            return f"{size_kb:.1f} KB"
        return "—"
    file_size_display.short_description = "Size"
