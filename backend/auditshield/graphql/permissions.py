"""
Strawberry permission classes — reusable guards for GraphQL resolvers.
"""
from typing import Any

import strawberry
from strawberry.types import Info


class IsAuthenticated(strawberry.permission.BasePermission):
    message = "Authentication required."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        request = info.context.request
        return request.user.is_authenticated


class IsCompanyAdmin(strawberry.permission.BasePermission):
    message = "Company admin access required."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        user = info.context.request.user
        return user.is_authenticated and user.role in ("super_admin", "admin")


class IsHROrAdmin(strawberry.permission.BasePermission):
    message = "HR or admin access required."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        user = info.context.request.user
        return user.is_authenticated and user.role in ("super_admin", "admin", "hr")


class IsSuperAdmin(strawberry.permission.BasePermission):
    message = "Super admin access required."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        user = info.context.request.user
        return user.is_authenticated and user.role == "super_admin"
