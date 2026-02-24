from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the UUID-based User model."""

    list_display = (
        "email", "get_full_name", "role", "company", "is_active", "is_staff",
        "must_change_password", "two_factor_enabled", "created_at",
    )
    list_filter = ("role", "is_active", "is_staff", "must_change_password", "two_factor_enabled", "company")
    search_fields = ("email", "first_name", "last_name", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "last_login", "last_login_ip")

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "phone", "avatar")}),
        (_("Company & Role"), {"fields": ("company", "role")}),
        (_("Permissions"), {
            "fields": (
                "is_active", "is_staff", "is_superuser",
                "must_change_password", "two_factor_enabled",
                "groups", "user_permissions",
            ),
            "classes": ("collapse",),
        }),
        (_("Metadata"), {"fields": ("last_login", "last_login_ip", "created_at", "updated_at"), "classes": ("collapse",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "company", "role", "password1", "password2"),
        }),
    )

    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = "Full Name"
