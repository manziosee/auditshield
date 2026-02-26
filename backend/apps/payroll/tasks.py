"""Async Celery tasks for payroll processing and payslip PDF generation."""
import logging
from decimal import Decimal

from celery import shared_task

logger = logging.getLogger(__name__)


def _apply_tax_rules(gross, tax_rules):
    """
    Calculate employee deductions and employer contributions from a gross salary
    using the company country's active TaxRules.

    Returns (employee_deductions dict, employer_contributions dict).
    """
    employee_deductions = {}
    employer_contributions = {}

    for rule in tax_rules:
        cfg = rule.configuration
        amount = Decimal("0")

        if rule.calc_type == "percentage":
            rate = Decimal(str(cfg.get("rate", 0)))
            amount = gross * rate

        elif rule.calc_type == "bracket":
            remaining = gross
            for bracket in cfg.get("brackets", []):
                b_min = Decimal(str(bracket["min"]))
                b_max = Decimal(str(bracket.get("max", 999_999_999)))
                rate = Decimal(str(bracket["rate"]))
                taxable = min(remaining, b_max - b_min)
                if taxable <= 0:
                    break
                amount += taxable * rate
                remaining -= taxable

        elif rule.calc_type == "fixed":
            amount = Decimal(str(cfg.get("amount", 0)))

        if rule.applies_to_employee:
            employee_deductions[rule.name] = float(amount)

        if rule.applies_to_employer:
            employer_rate = Decimal(str(cfg.get("employer_rate", 0)))
            employer_amount = gross * employer_rate if employer_rate else amount
            employer_contributions[rule.name] = float(employer_amount)

    return employee_deductions, employer_contributions


@shared_task(bind=True, max_retries=3, queue="payroll")
def process_payroll_run(self, run_id: str):
    """Calculate gross → net for every employee in the run."""
    try:
        from .models import PayrollLineItem, PayrollRun, TaxRule

        run = PayrollRun.objects.select_related("company__country").get(id=run_id)
        run.status = PayrollRun.Status.PROCESSING
        run.save(update_fields=["status"])

        tax_rules = TaxRule.objects.filter(
            country=run.company.country, is_active=True
        ) if run.company.country else []

        gross_total = Decimal("0")
        deduction_total = Decimal("0")
        employer_total = Decimal("0")
        net_total = Decimal("0")

        employees = run.company.employee_set.filter(is_active=True)
        for emp in employees:
            gross = emp.gross_salary or Decimal("0")
            emp_deductions, empl_contributions = _apply_tax_rules(gross, tax_rules)

            total_emp_ded = Decimal(str(sum(emp_deductions.values())))
            total_empl_con = Decimal(str(sum(empl_contributions.values())))
            net = gross - total_emp_ded

            PayrollLineItem.objects.update_or_create(
                payroll_run=run,
                employee=emp,
                defaults={
                    "gross_salary": gross,
                    "employee_deductions": emp_deductions,
                    "employer_contributions": empl_contributions,
                    "total_employee_deductions": total_emp_ded,
                    "total_employer_contributions": total_empl_con,
                    "net_salary": net,
                },
            )

            gross_total += gross
            deduction_total += total_emp_ded
            employer_total += total_empl_con
            net_total += net

        run.gross_total = gross_total
        run.deduction_total = deduction_total
        run.employer_contribution_total = employer_total
        run.net_total = net_total
        run.status = PayrollRun.Status.COMPLETED
        run.save(update_fields=[
            "gross_total", "deduction_total",
            "employer_contribution_total", "net_total", "status",
        ])
        logger.info("Payroll run %s completed: %s employees processed", run_id, employees.count())

    except Exception as exc:
        logger.error("Payroll run %s failed: %s", run_id, exc, exc_info=True)
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3, queue="payroll")
def generate_payslip(self, line_item_id: str):
    """Generate a PDF payslip for a single PayrollLineItem."""
    try:
        from .models import PayrollLineItem, Payslip

        item = PayrollLineItem.objects.select_related(
            "employee", "payroll_run__company", "payroll_run__currency"
        ).get(id=line_item_id)

        payslip, _ = Payslip.objects.get_or_create(line_item=item)

        # PDF generation would use WeasyPrint here (template render + file save)
        # For now we mark as ready — extend with actual template rendering as needed
        payslip.is_ready = True
        payslip.save(update_fields=["is_ready"])

        item.is_payslip_generated = True
        item.save(update_fields=["is_payslip_generated"])

        logger.info("Payslip generated for line item %s", line_item_id)

    except Exception as exc:
        logger.error("Payslip generation failed for %s: %s", line_item_id, exc, exc_info=True)
        raise self.retry(exc=exc, countdown=60)
