"""
GraphQL Queries — all resolvers require authentication and are tenant-scoped.
"""
from __future__ import annotations

from typing import Optional

import strawberry
from strawberry.types import Info

from .permissions import IsAuthenticated, IsCompanyAdmin
from .types import (
    AuditLogType,
    CompanyType,
    ComplianceDashboard,
    ComplianceRecordType,
    DepartmentType,
    DocumentPage,
    DocumentType,
    EmployeePage,
    EmployeeType,
    NotificationType,
)


def _company(info: Info):
    """Shortcut — returns the current user's company."""
    return info.context.request.user.company


@strawberry.type
class Query:

    # ── Company ───────────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated])
    def my_company(self, info: Info) -> Optional[CompanyType]:
        return _company(info)

    # ── Employees ─────────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated])
    def employees(
        self,
        info: Info,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        status: Optional[str] = None,
        department_id: Optional[strawberry.ID] = None,
    ) -> EmployeePage:
        from apps.employees.models import Employee
        qs = Employee.objects.filter(company=_company(info)).select_related("department")
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(employee_number__icontains=search) |
                Q(email__icontains=search)
            )
        if status:
            qs = qs.filter(employment_status=status)
        if department_id:
            qs = qs.filter(department_id=department_id)

        total = qs.count()
        offset = (page - 1) * page_size
        items = list(qs[offset: offset + page_size])
        return EmployeePage(items=items, total=total, page=page, page_size=page_size)

    @strawberry.field(permission_classes=[IsAuthenticated])
    def employee(self, info: Info, id: strawberry.ID) -> Optional[EmployeeType]:
        from apps.employees.models import Employee
        try:
            return Employee.objects.get(id=id, company=_company(info))
        except Employee.DoesNotExist:
            return None

    @strawberry.field(permission_classes=[IsAuthenticated])
    def departments(self, info: Info) -> list[DepartmentType]:
        from apps.employees.models import Department
        return list(Department.objects.filter(company=_company(info)))

    # ── Documents ─────────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated])
    def documents(
        self,
        info: Info,
        page: int = 1,
        page_size: int = 25,
        document_type: Optional[str] = None,
        status: Optional[str] = None,
        employee_id: Optional[strawberry.ID] = None,
        expiring_soon: bool = False,
    ) -> DocumentPage:
        from datetime import timedelta

        from django.utils import timezone

        from apps.documents.models import Document

        qs = Document.objects.filter(company=_company(info)).select_related("employee")
        if document_type:
            qs = qs.filter(document_type=document_type)
        if status:
            qs = qs.filter(status=status)
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        if expiring_soon:
            threshold = timezone.now().date() + timedelta(days=30)
            qs = qs.filter(expiry_date__lte=threshold, expiry_date__gte=timezone.now().date())

        total = qs.count()
        offset = (page - 1) * page_size
        items = list(qs[offset: offset + page_size])
        return DocumentPage(items=items, total=total, page=page, page_size=page_size)

    @strawberry.field(permission_classes=[IsAuthenticated])
    def document(self, info: Info, id: strawberry.ID) -> Optional[DocumentType]:
        from apps.documents.models import Document
        try:
            return Document.objects.get(id=id, company=_company(info))
        except Document.DoesNotExist:
            return None

    # ── Compliance ────────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated])
    def compliance_dashboard(self, info: Info) -> ComplianceDashboard:
        from apps.compliance.utils import get_company_compliance_score
        data = get_company_compliance_score(_company(info))
        return ComplianceDashboard(**data)

    @strawberry.field(permission_classes=[IsAuthenticated])
    def compliance_records(
        self,
        info: Info,
        status: Optional[str] = None,
    ) -> list[ComplianceRecordType]:
        from apps.compliance.models import ComplianceRecord
        qs = ComplianceRecord.objects.filter(
            company=_company(info)
        ).select_related("requirement", "requirement__category")
        if status:
            qs = qs.filter(status=status)
        return list(qs)

    # ── Notifications ─────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated])
    def my_notifications(self, info: Info, unread_only: bool = False) -> list[NotificationType]:
        from apps.notifications.models import Notification
        qs = Notification.objects.filter(recipient=info.context.request.user)
        if unread_only:
            qs = qs.filter(is_read=False)
        return list(qs[:50])

    @strawberry.field(permission_classes=[IsAuthenticated])
    def unread_notification_count(self, info: Info) -> int:
        from apps.notifications.models import Notification
        return Notification.objects.filter(recipient=info.context.request.user, is_read=False).count()

    # ── Audit Logs ────────────────────────────────────────────────────────────
    @strawberry.field(permission_classes=[IsAuthenticated, IsCompanyAdmin])
    def audit_logs(
        self,
        info: Info,
        page: int = 1,
        page_size: int = 50,
    ) -> list[AuditLogType]:
        from apps.audit_logs.models import AuditLog
        user = info.context.request.user
        qs = AuditLog.objects.order_by("-created_at")
        if user.role != "super_admin":
            qs = qs.filter(company=user.company)
        offset = (page - 1) * page_size
        return list(qs[offset: offset + page_size])
