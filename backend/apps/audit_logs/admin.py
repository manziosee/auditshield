from django.contrib import admin
from django.utils.html import format_html

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "method_badge", "path", "status_badge", "user",
        "company", "ip_address", "duration_ms", "created_at",
    )
    list_filter = ("method", "company")
    search_fields = ("path", "user__email", "ip_address")
    ordering = ("-created_at",)
    readonly_fields = (
        "id", "user", "company", "method", "path", "status_code",
        "ip_address", "user_agent", "request_body", "duration_ms",
        "created_at", "updated_at",
    )
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def method_badge(self, obj):
        colours = {
            "POST": "green", "PUT": "blue", "PATCH": "orange",
            "DELETE": "red", "GET": "grey",
        }
        colour = colours.get(obj.method, "grey")
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour, obj.method,
        )
    method_badge.short_description = "Method"

    def status_badge(self, obj):
        if obj.status_code < 300:
            colour = "green"
        elif obj.status_code < 400:
            colour = "orange"
        else:
            colour = "red"
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour, obj.status_code,
        )
    status_badge.short_description = "Status"
