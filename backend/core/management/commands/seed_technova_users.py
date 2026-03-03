"""
Management command: seed_technova_users

Creates 10 employees and 3 login-capable users (HR, Finance, Procurement)
for the TechNova Solutions Ltd company (or any company matching the name).

Usage:
    python manage.py seed_technova_users
    python manage.py seed_technova_users --company "My Company Name"
    python manage.py seed_technova_users --reset   # delete existing employees first
"""
import datetime

from django.core.management.base import BaseCommand, CommandError


EMPLOYEES = [
    # Engineering
    {"first_name": "Alice",   "last_name": "Mercer",   "job_title": "Lead Software Engineer",    "department": "Engineering",  "contract_type": "permanent",  "employment_status": "active",     "gender": "F", "gross_salary": 85000},
    {"first_name": "Brian",   "last_name": "Okafor",   "job_title": "Backend Developer",          "department": "Engineering",  "contract_type": "permanent",  "employment_status": "active",     "gender": "M", "gross_salary": 72000},
    {"first_name": "Chloe",   "last_name": "Mwangi",   "job_title": "Frontend Developer",         "department": "Engineering",  "contract_type": "fixed_term", "employment_status": "probation",  "gender": "F", "gross_salary": 60000},
    # HR
    {"first_name": "David",   "last_name": "Nguyen",   "job_title": "HR Business Partner",        "department": "HR",           "contract_type": "permanent",  "employment_status": "active",     "gender": "M", "gross_salary": 62000},
    {"first_name": "Eva",     "last_name": "Santos",   "job_title": "Talent Acquisition Specialist","department": "HR",          "contract_type": "permanent",  "employment_status": "on_leave",   "gender": "F", "gross_salary": 58000},
    # Finance
    {"first_name": "Frank",   "last_name": "Dubois",   "job_title": "Senior Accountant",          "department": "Finance",      "contract_type": "permanent",  "employment_status": "active",     "gender": "M", "gross_salary": 70000},
    {"first_name": "Grace",   "last_name": "Kimani",   "job_title": "Financial Analyst",          "department": "Finance",      "contract_type": "permanent",  "employment_status": "active",     "gender": "F", "gross_salary": 65000},
    # Procurement
    {"first_name": "Henry",   "last_name": "Osei",     "job_title": "Procurement Manager",        "department": "Procurement",  "contract_type": "permanent",  "employment_status": "active",     "gender": "M", "gross_salary": 68000},
    {"first_name": "Irene",   "last_name": "Balogun",  "job_title": "Supply Chain Analyst",       "department": "Procurement",  "contract_type": "fixed_term", "employment_status": "active",     "gender": "F", "gross_salary": 55000},
    # Administration
    {"first_name": "James",   "last_name": "Petrov",   "job_title": "Operations Coordinator",     "department": "Administration","contract_type": "part_time", "employment_status": "active",     "gender": "M", "gross_salary": 40000},
]

LOGIN_USERS = [
    {
        "first_name": "Sarah",
        "last_name": "Nakamura",
        "email": "hr@technova.io",
        "role": "hr",
        "job_title": "HR Manager",
        "password": "HRManager@2026!",
    },
    {
        "first_name": "Mark",
        "last_name": "Hoffmann",
        "email": "finance@technova.io",
        "role": "accountant",
        "job_title": "Finance Manager",
        "password": "Finance@2026!",
    },
    {
        "first_name": "Priya",
        "last_name": "Rajan",
        "email": "procurement@technova.io",
        "role": "auditor",
        "job_title": "Procurement Auditor",
        "password": "Procurement@2026!",
    },
]


class Command(BaseCommand):
    help = "Seed 10 employees and 3 login users for TechNova Solutions Ltd"

    def add_arguments(self, parser):
        parser.add_argument(
            "--company",
            default="TechNova Solutions Ltd",
            help="Company name to seed data into (default: TechNova Solutions Ltd)",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing employees for the company before seeding",
        )

    def handle(self, *args, **options):
        from apps.companies.models import Company
        from apps.employees.models import Department, Employee

        company_name = options["company"]

        # ── Find company ─────────────────────────────────────────────────────
        try:
            company = Company.objects.get(name__iexact=company_name)
        except Company.DoesNotExist:
            # List available companies to help the user
            names = list(Company.objects.values_list("name", flat=True)[:10])
            raise CommandError(
                f"Company '{company_name}' not found.\n"
                f"Available companies: {', '.join(names) or '(none)'}\n"
                f"Pass --company 'Exact Company Name'"
            )

        self.stdout.write(f"Seeding data for company: {company.name} ({company.id})")

        # ── Optional reset ───────────────────────────────────────────────────
        if options["reset"]:
            deleted, _ = Employee.objects.filter(company=company).delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing employees."))

        # ── Determine hire dates ─────────────────────────────────────────────
        base_date = datetime.date(2024, 1, 15)

        # ── Create departments ────────────────────────────────────────────────
        dept_names = list({e["department"] for e in EMPLOYEES})
        departments: dict[str, Department] = {}
        for name in dept_names:
            dept, created = Department.objects.get_or_create(
                company=company, name=name
            )
            departments[name] = dept
            if created:
                self.stdout.write(f"  Created department: {name}")

        # ── Create employees ──────────────────────────────────────────────────
        created_emps = 0
        for i, data in enumerate(EMPLOYEES, start=1):
            emp_number = f"EMP-{i:03d}"
            hire_date  = base_date + datetime.timedelta(days=i * 30)

            _, created = Employee.objects.update_or_create(
                company=company,
                employee_number=emp_number,
                defaults={
                    "first_name":         data["first_name"],
                    "last_name":          data["last_name"],
                    "job_title":          data["job_title"],
                    "department":         departments[data["department"]],
                    "contract_type":      data["contract_type"],
                    "employment_status":  data["employment_status"],
                    "gender":             data["gender"],
                    "gross_salary":       data["gross_salary"],
                    "hire_date":          hire_date,
                    "is_active":          True,
                    "email":              f"{data['first_name'].lower()}.{data['last_name'].lower()}@technova.io",
                    "phone":              f"+1555{100 + i:04d}",
                    "national_id":        f"ID{2000 + i:06d}",
                },
            )
            if created:
                created_emps += 1

        self.stdout.write(self.style.SUCCESS(f"  Created {created_emps} new employees (skipped existing)."))

        # ── Create login users ────────────────────────────────────────────────
        from django.contrib.auth import get_user_model
        User = get_user_model()

        created_users = 0
        for u in LOGIN_USERS:
            if User.objects.filter(email=u["email"]).exists():
                self.stdout.write(self.style.WARNING(f"  User {u['email']} already exists — skipped."))
                continue

            User.objects.create_user(
                email=u["email"],
                password=u["password"],
                first_name=u["first_name"],
                last_name=u["last_name"],
                role=u["role"],
                company=company,
                must_change_password=False,
            )
            created_users += 1
            self.stdout.write(f"  Created user: {u['email']}  role={u['role']}")

        # ── Summary ───────────────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("Seed complete!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write("")
        self.stdout.write("Login credentials:")
        for u in LOGIN_USERS:
            self.stdout.write(f"  {u['role']:12s}  {u['email']:30s}  {u['password']}")
        self.stdout.write("")
        self.stdout.write(f"Employees created: {created_emps}   Login users created: {created_users}")
