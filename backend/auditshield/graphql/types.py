"""
Strawberry GraphQL types — mirrors the Django models.
All fields are opt-in; sensitive data (salary, TIN) is permission-guarded at resolver level.
"""
from __future__ import annotations

from typing import Optional

import strawberry
import strawberry_django
from strawberry import auto

from apps.audit_logs.models import AuditLog
from apps.companies.models import Company
from apps.compliance.models import ComplianceCategory, ComplianceRecord, ComplianceRequirement
from apps.documents.models import Document
from apps.employees.models import Department, Employee
from apps.notifications.models import Notification


# ── Company ───────────────────────────────────────────────────────────────────
@strawberry_django.type(Company)
class CompanyType:
    id: auto
    name: auto
    company_type: auto
    email: auto
    phone: auto
    website: auto
    address: auto
    district: auto
    country: auto
    subscription_plan: auto
    is_active: auto
    created_at: auto


# ── Department ────────────────────────────────────────────────────────────────
@strawberry_django.type(Department)
class DepartmentType:
    id: auto
    name: auto
    description: auto
    created_at: auto


# ── Employee ──────────────────────────────────────────────────────────────────
@strawberry_django.type(Employee)
class EmployeeType:
    id: auto
    employee_number: auto
    first_name: auto
    last_name: auto
    email: auto
    phone: auto
    job_title: auto
    contract_type: auto
    employment_status: auto
    hire_date: auto
    contract_end_date: auto
    is_active: auto
    department: Optional[DepartmentType]
    created_at: auto

    @strawberry.field
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @strawberry.field
    def compliance_score(self) -> int:
        from apps.compliance.utils import get_employee_compliance_score
        return get_employee_compliance_score(self)


# ── Document ──────────────────────────────────────────────────────────────────
@strawberry_django.type(Document)
class DocumentType:
    id: auto
    title: auto
    document_type: auto
    file_name: auto
    file_size: auto
    mime_type: auto
    status: auto
    expiry_date: auto
    issue_date: auto
    reference_number: auto
    description: auto
    tags: auto
    ocr_processed: auto
    created_at: auto

    @strawberry.field
    def is_expired(self) -> bool:
        return self.is_expired

    @strawberry.field
    def days_until_expiry(self) -> Optional[int]:
        return self.days_until_expiry


# ── Compliance ────────────────────────────────────────────────────────────────
@strawberry_django.type(ComplianceCategory)
class ComplianceCategoryType:
    id: auto
    name: auto
    description: auto
    authority: auto


@strawberry_django.type(ComplianceRequirement)
class ComplianceRequirementType:
    id: auto
    title: auto
    description: auto
    frequency: auto
    is_mandatory: auto
    category: ComplianceCategoryType


@strawberry_django.type(ComplianceRecord)
class ComplianceRecordType:
    id: auto
    status: auto
    period_start: auto
    period_end: auto
    due_date: auto
    completed_date: auto
    notes: auto
    requirement: ComplianceRequirementType
    created_at: auto

    @strawberry.field
    def is_overdue(self) -> bool:
        return self.is_overdue


# ── Notification ──────────────────────────────────────────────────────────────
@strawberry_django.type(Notification)
class NotificationType:
    id: auto
    notification_type: auto
    title: auto
    body: auto
    is_read: auto
    created_at: auto


# ── Audit Log ─────────────────────────────────────────────────────────────────
@strawberry_django.type(AuditLog)
class AuditLogType:
    id: auto
    method: auto
    path: auto
    status_code: auto
    ip_address: auto
    duration_ms: auto
    created_at: auto


# ── Compliance Dashboard ──────────────────────────────────────────────────────
@strawberry.type
class ComplianceDashboard:
    score: int
    compliant: int
    pending: int
    overdue: int
    total: int


# ── Paginated results ─────────────────────────────────────────────────────────
@strawberry.type
class EmployeePage:
    items: list[EmployeeType]
    total: int
    page: int
    page_size: int


@strawberry.type
class DocumentPage:
    items: list[DocumentType]
    total: int
    page: int
    page_size: int
