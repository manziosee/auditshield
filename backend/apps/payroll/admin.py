from django.contrib import admin

from .models import PayrollLineItem, PayrollRun, Payslip, TaxRule


@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ["name", "country", "rule_type", "calc_type", "is_active", "effective_from"]
    list_filter = ["country", "rule_type", "is_active"]
    search_fields = ["name"]


class PayrollLineItemInline(admin.TabularInline):
    model = PayrollLineItem
    extra = 0
    readonly_fields = ["gross_salary", "total_employee_deductions", "net_salary"]


@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ["company", "period_start", "period_end", "status", "net_total", "currency"]
    list_filter = ["status"]
    inlines = [PayrollLineItemInline]


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ["line_item", "is_ready", "sent_to_employee", "sent_at"]
    list_filter = ["is_ready", "sent_to_employee"]
