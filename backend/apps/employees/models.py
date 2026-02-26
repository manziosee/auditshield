from django.db import models

from core.models import TenantModel


class Department(TenantModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "departments"
        unique_together = ["company", "name"]

    def __str__(self):
        return self.name


class Employee(TenantModel):
    class ContractType(models.TextChoices):
        PERMANENT = "permanent", "Permanent"
        FIXED_TERM = "fixed_term", "Fixed-Term"
        INTERNSHIP = "internship", "Internship"
        CONSULTANT = "consultant", "Consultant"
        PART_TIME = "part_time", "Part-Time"

    class EmploymentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On Leave"
        PROBATION = "probation", "On Probation"
        TERMINATED = "terminated", "Terminated"
        RESIGNED = "resigned", "Resigned"

    # Personal Info
    employee_number = models.CharField(max_length=30)  # e.g. EMP-001
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    national_id = models.CharField(max_length=50, blank=True, help_text="National ID / passport number")
    gender = models.CharField(max_length=10, choices=[("M", "Male"), ("F", "Female"), ("O", "Other")], blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to="employee_photos/", null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)

    # Employment
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    job_title = models.CharField(max_length=100)
    contract_type = models.CharField(max_length=20, choices=ContractType.choices)
    employment_status = models.CharField(max_length=20, choices=EmploymentStatus.choices, default=EmploymentStatus.PROBATION)
    hire_date = models.DateField()
    contract_end_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    probation_end_date = models.DateField(null=True, blank=True)

    # Compensation
    gross_salary = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    currency = models.ForeignKey(
        "geography.Currency",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
        help_text="Salary currency (defaults to company currency)",
    )

    # Statutory / compliance identifiers (generic — applies to any country)
    social_insurance_number = models.CharField(
        max_length=50, blank=True,
        help_text="National pension / social security number",
    )
    tax_identifier = models.CharField(
        max_length=50, blank=True,
        help_text="Employee tax identification number",
    )
    bank_account = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch_code = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "employees"
        unique_together = ["company", "employee_number"]
        indexes = [
            models.Index(fields=["company", "employment_status"]),
            models.Index(fields=["company", "is_active"]),
            models.Index(fields=["contract_end_date"]),
        ]

    def __str__(self):
        return f"{self.employee_number} — {self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
