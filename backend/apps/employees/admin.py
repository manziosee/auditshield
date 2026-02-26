from django.contrib import admin

from .models import Department, Employee


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "employee_count", "description")
    list_filter = ("company",)
    search_fields = ("name", "company__name")
    ordering = ("company", "name")
    readonly_fields = ("id", "created_at", "updated_at")

    def employee_count(self, obj):
        return obj.employee_set.filter(is_active=True).count()
    employee_count.short_description = "Active Employees"


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employee_number", "full_name", "job_title", "department",
        "contract_type", "employment_status", "is_active", "hire_date", "company",
    )
    list_filter = (
        "company", "employment_status", "contract_type", "is_active",
        "gender", "department",
    )
    search_fields = (
        "employee_number", "first_name", "last_name", "email",
        "national_id", "social_insurance_number", "tax_identifier", "job_title",
    )
    ordering = ("-hire_date",)
    readonly_fields = ("id", "created_at", "updated_at")
    date_hierarchy = "hire_date"

    fieldsets = (
        ("Identity", {
            "fields": (
                "id", "employee_number", "company", "department",
                "first_name", "last_name", "date_of_birth", "gender",
                "national_id", "photo",
            ),
        }),
        ("Contact", {"fields": ("email", "phone", "address", "emergency_contact_name", "emergency_contact_phone")}),
        ("Employment", {
            "fields": (
                "job_title", "contract_type", "employment_status",
                "hire_date", "contract_end_date", "probation_end_date", "termination_date", "is_active",
            ),
        }),
        ("Compensation & Statutory", {
            "fields": ("gross_salary", "currency", "social_insurance_number", "tax_identifier", "bank_account", "bank_name"),
            "classes": ("collapse",),
        }),
        ("Metadata", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = "Full Name"
