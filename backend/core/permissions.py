"""
DRF permission classes — role-based access control.
Mirror the Strawberry permission classes in auditshield/graphql/permissions.py.
"""
from rest_framework.permissions import BasePermission


class IsCompanyAdmin(BasePermission):
    """Allow only company admins (role=admin) and super_admins."""
    message = "You must be a company admin to perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("admin", "super_admin")
        )


class IsHROrAdmin(BasePermission):
    """Allow HR managers, company admins, and super_admins."""
    message = "You must be an HR manager or admin to perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) in ("hr", "admin", "super_admin")
        )


class IsSuperAdmin(BasePermission):
    """Allow only platform super_admins."""
    message = "Super-admin access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == "super_admin"
        )
