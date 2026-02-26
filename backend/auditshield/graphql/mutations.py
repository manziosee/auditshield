"""
GraphQL Mutations — create, update, delete operations.
"""
from __future__ import annotations

from typing import Optional

import strawberry
from strawberry.types import Info

from .permissions import IsAuthenticated, IsCompanyAdmin, IsHROrAdmin
from .types import ComplianceRecordType, EmployeeType, NotificationType


# ── Input types ───────────────────────────────────────────────────────────────
@strawberry.input
class EmployeeInput:
    first_name: str
    last_name: str
    job_title: str
    hire_date: str                   # ISO date string
    contract_type: str
    employee_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[strawberry.ID] = None
    social_insurance_number: Optional[str] = None
    tax_identifier: Optional[str] = None


@strawberry.input
class UpdateEmployeeInput:
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    employment_status: Optional[str] = None
    department_id: Optional[strawberry.ID] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    social_insurance_number: Optional[str] = None
    tax_identifier: Optional[str] = None


@strawberry.input
class ComplianceRecordInput:
    requirement_id: strawberry.ID
    status: str
    period_start: str
    period_end: str
    due_date: str
    notes: Optional[str] = None


@strawberry.input
class DepartmentInput:
    name: str
    description: Optional[str] = None


# ── Result types ──────────────────────────────────────────────────────────────
@strawberry.type
class MutationResult:
    success: bool
    message: str


@strawberry.type
class Mutation:

    # ── Employee mutations ────────────────────────────────────────────────────
    @strawberry.mutation(permission_classes=[IsAuthenticated, IsHROrAdmin])
    def create_employee(self, info: Info, input: EmployeeInput) -> EmployeeType:
        from datetime import date

        from apps.employees.models import Employee
        company = info.context.request.user.company
        return Employee.objects.create(
            company=company,
            employee_number=input.employee_number or f"EMP-{Employee.objects.filter(company=company).count() + 1:04d}",
            first_name=input.first_name,
            last_name=input.last_name,
            job_title=input.job_title,
            hire_date=date.fromisoformat(input.hire_date),
            contract_type=input.contract_type,
            email=input.email or "",
            phone=input.phone or "",
            department_id=input.department_id,
            social_insurance_number=input.social_insurance_number or "",
            tax_identifier=input.tax_identifier or "",
        )

    @strawberry.mutation(permission_classes=[IsAuthenticated, IsHROrAdmin])
    def update_employee(
        self, info: Info, id: strawberry.ID, input: UpdateEmployeeInput
    ) -> Optional[EmployeeType]:
        from apps.employees.models import Employee
        try:
            emp = Employee.objects.get(id=id, company=info.context.request.user.company)
        except Employee.DoesNotExist:
            return None
        fields = [f for f in vars(input) if not f.startswith("_") and getattr(input, f) is not None]
        for field in fields:
            setattr(emp, field, getattr(input, field))
        emp.save(update_fields=fields)
        return emp

    @strawberry.mutation(permission_classes=[IsAuthenticated, IsHROrAdmin])
    def delete_employee(self, info: Info, id: strawberry.ID) -> MutationResult:
        from apps.employees.models import Employee
        try:
            emp = Employee.objects.get(id=id, company=info.context.request.user.company)
            emp.is_active = False
            emp.employment_status = "terminated"
            emp.save(update_fields=["is_active", "employment_status"])
            return MutationResult(success=True, message="Employee deactivated.")
        except Employee.DoesNotExist:
            return MutationResult(success=False, message="Employee not found.")

    # ── Department mutations ──────────────────────────────────────────────────
    @strawberry.mutation(permission_classes=[IsAuthenticated, IsHROrAdmin])
    def create_department(self, info: Info, input: DepartmentInput) -> MutationResult:
        from apps.employees.models import Department
        company = info.context.request.user.company
        dept, created = Department.objects.get_or_create(
            company=company, name=input.name,
            defaults={"description": input.description or ""},
        )
        return MutationResult(
            success=True,
            message="Department created." if created else "Department already exists.",
        )

    # ── Compliance mutations ──────────────────────────────────────────────────
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    def update_compliance_record(
        self, info: Info, id: strawberry.ID, status: str, notes: Optional[str] = None
    ) -> Optional[ComplianceRecordType]:
        from django.utils import timezone

        from apps.compliance.models import ComplianceRecord
        try:
            record = ComplianceRecord.objects.get(id=id, company=info.context.request.user.company)
            record.status = status
            record.notes = notes or record.notes
            if status == "compliant":
                record.completed_date = timezone.now().date()
                record.completed_by = info.context.request.user
            record.save()
            return record
        except ComplianceRecord.DoesNotExist:
            return None

    # ── Notification mutations ────────────────────────────────────────────────
    @strawberry.mutation(permission_classes=[IsAuthenticated])
    def mark_notification_read(self, info: Info, id: strawberry.ID) -> MutationResult:
        from apps.notifications.models import Notification
        try:
            notif = Notification.objects.get(id=id, recipient=info.context.request.user)
            notif.is_read = True
            notif.save(update_fields=["is_read"])
            return MutationResult(success=True, message="Marked as read.")
        except Notification.DoesNotExist:
            return MutationResult(success=False, message="Notification not found.")

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    def mark_all_notifications_read(self, info: Info) -> MutationResult:
        from apps.notifications.models import Notification
        count = Notification.objects.filter(
            recipient=info.context.request.user, is_read=False
        ).update(is_read=True)
        return MutationResult(success=True, message=f"{count} notifications marked as read.")
