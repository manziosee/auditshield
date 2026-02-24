from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title", "notification_type", "recipient", "company",
        "is_read", "is_sent_email", "created_at",
    )
    list_filter = ("notification_type", "is_read", "is_sent_email", "company")
    search_fields = ("title", "body", "recipient__email", "recipient__first_name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "sent_at")
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {"fields": ("id", "recipient", "company", "notification_type")}),
        ("Content", {"fields": ("title", "body")}),
        ("Status", {"fields": ("is_read", "is_sent_email", "scheduled_for", "sent_at")}),
        ("Related Object", {
            "fields": ("related_object_id", "related_object_type"),
            "classes": ("collapse",),
        }),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["mark_as_read", "mark_as_unread"]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected notifications as unread")
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
