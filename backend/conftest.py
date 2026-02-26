"""
Pytest fixtures shared across all tests.
Run tests: pytest  (from backend/)
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


# ── Database factories ─────────────────────────────────────────────────────────

@pytest.fixture
def company(db):
    from apps.companies.models import Company
    return Company.objects.create(
        name="Test Company Ltd",
        company_type="sme",
        email="test@company.com",
        phone="+1 555 000 0000",
    )


@pytest.fixture
def admin_user(db, company):
    return User.objects.create_user(
        email="admin@company.com",
        password="TestP@ssword123",
        first_name="Admin",
        last_name="User",
        role=User.Role.COMPANY_ADMIN,
        company=company,
        must_change_password=False,
    )


@pytest.fixture
def hr_user(db, company):
    return User.objects.create_user(
        email="hr@company.com",
        password="TestP@ssword123",
        first_name="HR",
        last_name="Manager",
        role=User.Role.HR,
        company=company,
        must_change_password=False,
    )


@pytest.fixture
def employee_user(db, company):
    return User.objects.create_user(
        email="employee@company.com",
        password="TestP@ssword123",
        first_name="John",
        last_name="Doe",
        role=User.Role.EMPLOYEE,
        company=company,
        must_change_password=False,
    )


@pytest.fixture
def department(db, company):
    from apps.employees.models import Department
    return Department.objects.create(
        company=company,
        name="Engineering",
        description="Software engineering department",
    )


@pytest.fixture
def employee(db, company, department):
    from apps.employees.models import Employee
    return Employee.objects.create(
        company=company,
        employee_number="EMP-001",
        first_name="Alice",
        last_name="Johnson",
        job_title="Software Engineer",
        contract_type=Employee.ContractType.PERMANENT,
        employment_status=Employee.EmploymentStatus.ACTIVE,
        hire_date="2023-01-01",
        department=department,
        email="alice@company.com",
        social_insurance_number="SIN123456",
        tax_identifier="TAX123456",
    )


# ── API client fixtures ────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def auth_client(api_client, admin_user):
    """APIClient pre-authenticated as company admin."""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client


@pytest.fixture
def hr_client(api_client, hr_user):
    """APIClient pre-authenticated as HR manager."""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(hr_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return api_client
