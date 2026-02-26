"""
Payroll Engine — country-agnostic gross→net calculation.

Architecture:
  TaxRule       — configurable tax/deduction brackets per country
  PayrollRun    — one run covers all employees in a company for a period
  PayrollLineItem — per-employee breakdown (gross, deductions, net)
  Payslip       — generated PDF record linked to a line item
"""
from django.db import models

from core.models import TenantModel, TimeStampedModel, UUIDModel


class TaxRule(UUIDModel, TimeStampedModel):
    """
    A configurable deduction rule tied to a country.
    Supports percentage, tax brackets (progressive), or fixed amounts.
    Examples: Income Tax, Social Security, Pension, Health Insurance.
    """
    class RuleType(models.TextChoices):
        INCOME_TAX = "income_tax", "Income Tax"
        SOCIAL_SECURITY = "social_security", "Social Security"
        PENSION = "pension", "Pension"
        HEALTH_INSURANCE = "health_insurance", "Health Insurance"
        PAYROLL_LEVY = "payroll_levy", "Payroll Levy"
        OTHER = "other", "Other Deduction"

    class CalcType(models.TextChoices):
        PERCENTAGE = "percentage", "Flat Percentage"
        BRACKET = "bracket", "Progressive Brackets"
        FIXED = "fixed", "Fixed Amount"

    country = models.ForeignKey(
        "geography.Country", on_delete=models.CASCADE, related_name="tax_rules"
    )
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=30, choices=RuleType.choices)
    calc_type = models.CharField(max_length=20, choices=CalcType.choices)
    # For PERCENTAGE: {"rate": 0.03, "applies_to": "gross", "employer_rate": 0.05}
    # For BRACKET:    {"brackets": [{"min": 0, "max": 30000, "rate": 0}, {"min": 30001, "max": 100000, "rate": 0.20}]}
    # For FIXED:      {"amount": 5000}
    configuration = models.JSONField(
        default=dict,
        help_text="Calculation config: rate/brackets/amount + employer split",
    )
    applies_to_employee = models.BooleanField(default=True)
    applies_to_employer = models.BooleanField(default=False)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "payroll_tax_rules"
        ordering = ["country", "rule_type", "name"]

    def __str__(self):
        return f"{self.country.iso_code} — {self.name}"


class PayrollRun(TenantModel):
    """One payroll processing run covering all employees in a period."""
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        APPROVED = "approved", "Approved"
        PAID = "paid", "Paid"

    period_start = models.DateField()
    period_end = models.DateField()
    currency = models.ForeignKey(
        "geography.Currency", on_delete=models.PROTECT, related_name="payroll_runs"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    gross_total = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    deduction_total = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    employer_contribution_total = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    net_total = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    processed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="processed_payrolls"
    )
    approved_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_payrolls"
    )
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "payroll_runs"
        ordering = ["-period_start"]
        unique_together = ["company", "period_start", "period_end"]

    def __str__(self):
        return f"{self.company.name} — {self.period_start} to {self.period_end}"


class PayrollLineItem(UUIDModel, TimeStampedModel):
    """Per-employee payroll calculation for one run."""
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="line_items")
    employee = models.ForeignKey(
        "employees.Employee", on_delete=models.CASCADE, related_name="payroll_items"
    )
    gross_salary = models.DecimalField(max_digits=14, decimal_places=2)
    # {"social_security": 1200.00, "income_tax": 3400.00, "pension": 600.00}
    employee_deductions = models.JSONField(default=dict)
    # {"social_security_employer": 2000.00, "pension_employer": 600.00}
    employer_contributions = models.JSONField(default=dict)
    total_employee_deductions = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_employer_contributions = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=14, decimal_places=2)
    is_payslip_generated = models.BooleanField(default=False)

    class Meta:
        db_table = "payroll_line_items"
        unique_together = ["payroll_run", "employee"]

    def __str__(self):
        return f"{self.employee.full_name} — {self.payroll_run}"


class Payslip(UUIDModel, TimeStampedModel):
    """Generated payslip PDF record."""
    line_item = models.OneToOneField(
        PayrollLineItem, on_delete=models.CASCADE, related_name="payslip"
    )
    file = models.FileField(upload_to="payslips/%Y/%m/", null=True, blank=True)
    is_ready = models.BooleanField(default=False)
    sent_to_employee = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payslips"

    def __str__(self):
        return f"Payslip — {self.line_item}"
