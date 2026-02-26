from rest_framework import serializers

from .models import PayrollLineItem, PayrollRun, Payslip, TaxRule


class TaxRuleSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source="country.name", read_only=True)

    class Meta:
        model = TaxRule
        fields = [
            "id", "country", "country_name", "name", "rule_type", "calc_type",
            "configuration", "applies_to_employee", "applies_to_employer",
            "effective_from", "effective_to", "is_active",
        ]
        read_only_fields = ["id"]


class PayrollLineItemSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_number = serializers.CharField(source="employee.employee_number", read_only=True)

    class Meta:
        model = PayrollLineItem
        fields = [
            "id", "employee", "employee_name", "employee_number",
            "gross_salary", "employee_deductions", "employer_contributions",
            "total_employee_deductions", "total_employer_contributions",
            "net_salary", "is_payslip_generated",
        ]
        read_only_fields = ["id", "is_payslip_generated"]


class PayrollRunSerializer(serializers.ModelSerializer):
    line_items = PayrollLineItemSerializer(many=True, read_only=True)
    currency_code = serializers.CharField(source="currency.code", read_only=True)
    processed_by_name = serializers.CharField(source="processed_by.get_full_name", read_only=True)

    class Meta:
        model = PayrollRun
        fields = [
            "id", "period_start", "period_end", "currency", "currency_code",
            "status", "gross_total", "deduction_total",
            "employer_contribution_total", "net_total",
            "processed_by", "processed_by_name", "approved_by",
            "notes", "line_items", "created_at",
        ]
        read_only_fields = [
            "id", "gross_total", "deduction_total",
            "employer_contribution_total", "net_total", "created_at",
        ]


class PayslipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payslip
        fields = ["id", "line_item", "is_ready", "sent_to_employee", "sent_at", "created_at"]
        read_only_fields = ["id", "is_ready", "sent_at", "created_at"]
