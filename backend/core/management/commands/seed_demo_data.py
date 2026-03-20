"""
seed_demo_data — fills the database with realistic demo records so the
system looks live across every page.

Usage:
    python manage.py seed_demo_data
    python manage.py seed_demo_data --reset   # wipe tenant data first
"""

import random
from datetime import date, datetime, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

User = get_user_model()


# ─── helpers ──────────────────────────────────────────────────────────────────

def rdate(days_ago_min, days_ago_max=0):
    """Return a random date between `days_ago_min` and `days_ago_max` ago."""
    delta = random.randint(days_ago_min, days_ago_max) if days_ago_min <= days_ago_max else random.randint(days_ago_max, days_ago_min)
    return date.today() - timedelta(days=delta)


def rdt(days_ago_min, days_ago_max=0):
    """Same but returns a timezone-aware datetime."""
    d = rdate(days_ago_min, days_ago_max)
    return timezone.make_aware(datetime(d.year, d.month, d.day,
                                        random.randint(8, 18),
                                        random.randint(0, 59)))


def pick(lst):
    return random.choice(lst)


# ─── static demo data ─────────────────────────────────────────────────────────

DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "Operations",
               "Legal & Compliance", "Sales", "Marketing", "IT Infrastructure"]

FIRST_NAMES = ["James", "Sarah", "Michael", "Grace", "David", "Amara", "Peter",
               "Fatima", "Robert", "Chidi", "Alice", "Emmanuel", "Linda", "Kwame",
               "Sophie", "Ibrahim", "Chloe", "Oluwaseun", "Daniel", "Aisha",
               "Victor", "Naomi", "Brian", "Zara", "Kevin", "Nkechi", "Patrick",
               "Esther", "George", "Priya"]

LAST_NAMES  = ["Kamau", "Osei", "Nwosu", "Mensah", "Diallo", "Sow", "Mwangi",
               "Adeyemi", "Banda", "Kariuki", "Owusu", "Hassan", "Patel", "Smith",
               "Dubois", "Nakamura", "Reyes", "Ahmed", "Müller", "Santos"]

JOB_TITLES  = ["Software Engineer", "HR Manager", "Financial Analyst", "Compliance Officer",
               "Operations Lead", "Legal Counsel", "Sales Executive", "IT Specialist",
               "Product Manager", "Data Analyst", "Accountant", "Business Analyst",
               "Project Manager", "DevOps Engineer", "Customer Success Manager",
               "Marketing Specialist", "Payroll Administrator", "Risk Analyst"]

VENDOR_NAMES = ["CloudSec Ltd", "TechSupply Co", "GlobalPay Solutions",
                "LegalEdge Partners", "DataGuard Inc", "SwiftLogistics",
                "PrimeSoft Technologies", "NexGen Consulting", "SafeGuard Insurance",
                "AuditPro Services", "CompliancePlus", "TrustHR Agency"]

POLICY_TITLES = [
    ("Data Privacy & Protection Policy", "data_privacy"),
    ("Anti-Bribery and Corruption Policy", "compliance"),
    ("Health and Safety Policy", "health_safety"),
    ("Remote Work Policy", "hr"),
    ("Code of Conduct", "conduct"),
    ("Information Security Policy", "it_security"),
    ("Leave and Absence Policy", "hr"),
    ("Whistleblower Protection Policy", "compliance"),
]

INCIDENT_TITLES = [
    ("Unauthorised data access attempt detected", "violation", "high"),
    ("GDPR data subject request missed deadline", "violation", "medium"),
    ("Expired work permit — contractor on-site", "violation", "critical"),
    ("Health & safety near-miss in server room", "safety", "medium"),
    ("Suspicious login from unrecognised IP", "breach", "high"),
    ("Payroll file sent to wrong email address", "breach", "critical"),
    ("Training not completed before deadline", "near_miss", "low"),
    ("Vendor insurance certificate expired", "violation", "high"),
]

CERT_TYPES = [
    ("First Aid at Work", 12, True),
    ("Fire Safety Warden", 12, True),
    ("Data Privacy Certification", 24, True),
    ("ISO 27001 Awareness", 12, False),
    ("Anti-Money Laundering", 12, True),
    ("Driver's Licence", 120, False),
    ("Food Handling Certificate", 6, True),
    ("Manual Handling", 36, False),
]


class Command(BaseCommand):
    help = "Seeds realistic demo data across all apps for a demo company."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true",
                            help="Delete all existing tenant data before seeding")

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("🌱  AuditShield Demo Seed"))

        # ── imports inside handle to avoid circular import issues ──────────────
        from apps.accounts.models import User as UserModel
        from apps.companies.models import Company
        from apps.geography.models import Country, Currency
        from apps.employees.models import Department, Employee
        from apps.compliance.models import (Authority, ComplianceCategory,
                                             ComplianceRequirement, ComplianceRecord)
        from apps.documents.models import Document
        from apps.notifications.models import Notification
        from apps.reports.models import Report
        from apps.payroll.models import TaxRule, PayrollRun, PayrollLineItem, Payslip

        try:
            from apps.signatures.models import SignatureRequest, SignatureRequestSigner
            HAS_SIGNATURES = True
        except Exception:
            HAS_SIGNATURES = False

        try:
            from apps.onboarding.models import (OnboardingTemplate, OnboardingTask,
                                                  EmployeeOnboarding, OnboardingTaskCompletion)
            HAS_ONBOARDING = True
        except Exception:
            HAS_ONBOARDING = False

        try:
            from apps.training.models import CertificationType, EmployeeCertification
            HAS_TRAINING = True
        except Exception:
            HAS_TRAINING = False

        try:
            from apps.policies.models import Policy, PolicyAcknowledgment
            HAS_POLICIES = True
        except Exception:
            HAS_POLICIES = False

        try:
            from apps.incidents.models import Incident, IncidentUpdate
            HAS_INCIDENTS = True
        except Exception:
            HAS_INCIDENTS = False

        try:
            from apps.approvals.models import ApprovalWorkflow, ApprovalStep, ApprovalRequest, ApprovalDecision
            HAS_APPROVALS = True
        except Exception:
            HAS_APPROVALS = False

        try:
            from apps.vendors.models import Vendor, VendorDocument
            HAS_VENDORS = True
        except Exception:
            HAS_VENDORS = False

        try:
            from apps.forms.models import FormTemplate, FormField, FormSubmission
            HAS_FORMS = True
        except Exception:
            HAS_FORMS = False

        try:
            from apps.integrations.models import Integration
            HAS_INTEGRATIONS = True
        except Exception:
            HAS_INTEGRATIONS = False

        # ── 1. Geo ─────────────────────────────────────────────────────────────
        country, _ = Country.objects.get_or_create(
            iso_code="US",
            defaults=dict(name="United States", iso_code_3="USA",
                          timezone="America/New_York", phone_prefix="+1",
                          flag_emoji="🇺🇸", tax_year_start_month=1)
        )
        usd, _ = Currency.objects.get_or_create(
            code="USD", defaults=dict(name="US Dollar", symbol="$", decimal_places=2)
        )

        # ── 2. Demo company ────────────────────────────────────────────────────
        company, created = Company.objects.get_or_create(
            name="TechNova International Ltd",
            defaults=dict(
                email="admin@technova.com",
                phone="+1 555 0100",
                address="250 Innovation Drive, Suite 400",
                city="San Francisco",
                country=country,
                currency=usd,
                industry="Technology",
                tax_identifier="US-TAX-847201",
                social_security_identifier="SS-998877",
                subscription_plan="enterprise",
            )
        )
        self.stdout.write(f"  Company: {company.name} ({'created' if created else 'exists'})")

        if options.get("reset") and not created:
            self._reset_tenant(company)
            self.stdout.write("  ↺  Reset complete")

        # ── 3. Users ───────────────────────────────────────────────────────────
        roles = [
            ("admin@technova.com",      "Admin",     "admin",      "Alexandra", "Chen"),
            ("hr@technova.com",         "HR",        "hr",         "Marcus",    "Williams"),
            ("accountant@technova.com", "Finance",   "accountant", "Priya",     "Sharma"),
            ("auditor@technova.com",    "Auditor",   "auditor",    "James",     "Osei"),
            ("emp1@technova.com",       "Employee",  "employee",   "Sarah",     "Mwangi"),
            ("emp2@technova.com",       "Employee",  "employee",   "David",     "Adeyemi"),
        ]
        users = {}
        for email, label, role, fname, lname in roles:
            u, _ = User.objects.get_or_create(
                email=email,
                defaults=dict(
                    first_name=fname, last_name=lname,
                    role=role, company=company, is_active=True
                )
            )
            if _:
                u.set_password("Demo@12345")
                u.save()
            users[role if role != "employee" else label.lower()] = u
        admin_user = users["admin"]
        hr_user    = users["hr"]
        self.stdout.write(f"  Users: {len(users)} seeded")

        # ── 4. Departments + Employees ─────────────────────────────────────────
        depts = {}
        for name in DEPARTMENTS:
            d, _ = Department.objects.get_or_create(name=name, company=company)
            depts[name] = d

        contracts = ["permanent", "fixed_term", "internship", "consultant", "part_time"]
        statuses  = ["active", "active", "active", "active", "probation", "on_leave"]

        created_emps = []
        for i in range(30):
            fn = pick(FIRST_NAMES)
            ln = pick(LAST_NAMES)
            emp, _ = Employee.objects.get_or_create(
                employee_number=f"EMP-{i+1:03d}",
                company=company,
                defaults=dict(
                    first_name=fn, last_name=ln,
                    email=f"{fn.lower()}.{ln.lower()}{i}@technova.com",
                    phone=f"+1 555 {random.randint(1000,9999)}",
                    department=pick(list(depts.values())),
                    job_title=pick(JOB_TITLES),
                    contract_type=pick(contracts),
                    employment_status=pick(statuses),
                    hire_date=rdate(365 * 3, 30),
                    date_of_birth=rdate(365 * 40, 365 * 25),
                    nationality="American",
                    gender=pick(["M", "F"]),
                    currency=usd,
                    gross_salary=random.randint(45000, 150000),
                    tax_identifier=f"TIN-{random.randint(100000,999999)}",
                    social_insurance_number=f"SSN-{random.randint(100000,999999)}",
                    bank_name=pick(["Chase Bank", "Bank of America", "Wells Fargo", "Citibank"]),
                )
            )
            created_emps.append(emp)
        self.stdout.write(f"  Employees: {len(created_emps)} seeded")

        # ── 5. Compliance ──────────────────────────────────────────────────────
        # Ensure we have at least one authority
        auth, _ = Authority.objects.get_or_create(
            short_name="IRS",
            defaults=dict(name="Internal Revenue Service", authority_type="tax",
                          country=country, is_active=True)
        )
        auth_ss, _ = Authority.objects.get_or_create(
            short_name="SSA",
            defaults=dict(name="Social Security Administration", authority_type="social_security",
                          country=country, is_active=True)
        )
        auth_dol, _ = Authority.objects.get_or_create(
            short_name="DOL",
            defaults=dict(name="Dept of Labour", authority_type="labor",
                          country=country, is_active=True)
        )

        cat_tax, _ = ComplianceCategory.objects.get_or_create(
            name="Tax Filings", defaults=dict(authority=auth, description="Federal and state tax obligations")
        )
        cat_hr, _ = ComplianceCategory.objects.get_or_create(
            name="HR & Payroll", defaults=dict(authority=auth_ss, description="Social security and HR compliance")
        )
        cat_labour, _ = ComplianceCategory.objects.get_or_create(
            name="Labour Law", defaults=dict(authority=auth_dol, description="Employment law requirements")
        )

        requirements_data = [
            ("Federal Income Tax Return (Form 1120)",  "tax",    "annually",  cat_tax,    True,  "Up to $50,000 penalty for late filing"),
            ("Quarterly Payroll Tax (Form 941)",        "tax",    "quarterly", cat_tax,    True,  "2% penalty on late deposits"),
            ("W-2 Filing to Employees",                 "tax",    "annually",  cat_tax,    True,  "$50 per W-2 not filed on time"),
            ("Social Security Contributions",           "social", "monthly",   cat_hr,     True,  "10% surcharge on overdue amounts"),
            ("Federal Unemployment Tax (FUTA)",        "tax",    "annually",  cat_tax,    True,  "Interest accrues from due date"),
            ("I-9 Employment Eligibility Verification","hr",     "one_time",  cat_labour, True,  "$2,789–$27,894 per violation"),
            ("OSHA 300 Injury Log Annual Summary",     "safety", "annually",  cat_labour, True,  "Up to $15,625 per violation"),
            ("EEO-1 Component 1 Report",               "hr",     "annually",  cat_hr,     True,  "$6,450 per violation"),
        ]

        reqs = []
        for title, freq_type, freq, cat, mandatory, penalty in requirements_data:
            req, _ = ComplianceRequirement.objects.get_or_create(
                title=title,
                defaults=dict(category=cat, description=f"Regulatory requirement: {title}",
                              frequency=freq, is_mandatory=mandatory, penalty_description=penalty)
            )
            reqs.append(req)

        # Compliance records — 6 months of history for trend graph
        statuses_dist = ["compliant", "compliant", "compliant", "pending", "overdue"]
        records_created = 0
        for req in reqs:
            for months_ago in range(6, 0, -1):
                period_start = date.today().replace(day=1) - timedelta(days=30 * months_ago)
                period_end   = period_start + timedelta(days=29)
                due          = period_end + timedelta(days=7)
                status       = pick(statuses_dist)
                completed    = period_end - timedelta(days=random.randint(1, 5)) if status == "compliant" else None
                _, c = ComplianceRecord.objects.get_or_create(
                    company=company, requirement=req,
                    period_start=period_start, period_end=period_end,
                    defaults=dict(
                        due_date=due,
                        status=status,
                        completed_date=completed,
                        completed_by=admin_user if completed else None,
                        notes=pick(["Filed on time", "Completed via portal", "Submitted to authority", ""]),
                    )
                )
                records_created += int(c)
        self.stdout.write(f"  Compliance records: {records_created} new")

        # ── 6. Documents ───────────────────────────────────────────────────────
        doc_types = [
            ("Employment Contract",    "contract",       90, 730),
            ("NDA Agreement",          "contract",       30, 365),
            ("ID / Passport Copy",     "identification", 180, 1825),
            ("Payslip – March 2026",   "payslip",        7,  90),
            ("Insurance Certificate",  "insurance",      30, 365),
            ("Work Permit",            "permit",         60, 730),
            ("Training Certificate",   "training",       90, 365),
            ("Performance Review",     "report",         30, 180),
        ]
        docs_created = 0
        for title, dtype, exp_min, exp_max in doc_types:
            for emp in random.sample(created_emps, min(8, len(created_emps))):
                exp_date = date.today() + timedelta(days=random.randint(exp_min, exp_max))
                _, c = Document.objects.get_or_create(
                    company=company,
                    employee=emp,
                    title=f"{title} — {emp.first_name} {emp.last_name}",
                    defaults=dict(
                        document_type=dtype,
                        expiry_date=exp_date,
                        status=pick(["active", "active", "active", "expiring_soon", "expired"]),
                        description=f"Official {title.lower()} document",
                        uploaded_by=hr_user,
                        file_size=random.randint(50000, 2000000),
                        file_name=f"{title.lower().replace(' ', '_')}.pdf",
                    )
                )
                docs_created += int(c)
        self.stdout.write(f"  Documents: {docs_created} seeded")

        # ── 7. Notifications ───────────────────────────────────────────────────
        notif_data = [
            ("Document Expiring Soon", "Work permit for David Adeyemi expires in 14 days", "document_expiry"),
            ("Compliance Due", "Quarterly Payroll Tax filing is due in 5 days", "compliance_due"),
            ("New Employee Added", "Sarah Mwangi has been added to the system", "system"),
            ("Policy Update", "Health and Safety Policy has been updated — please review", "reminder"),
            ("Report Ready", "Monthly compliance summary report is ready for download", "system"),
            ("Training Reminder", "Fire Safety Warden certifications expire next month for 3 employees", "reminder"),
            ("Incident Reported", "A new compliance violation has been reported — review required", "compliance_due"),
            ("Contract Renewal", "Employment contract for Grace Mensah is up for renewal", "contract_renewal"),
            ("Audit Trail Alert", "Bulk export of audit logs performed by admin user", "system"),
            ("Vendor Compliance", "CloudSec Ltd insurance certificate expired yesterday", "compliance_due"),
        ]
        for title, msg, ntype in notif_data:
            Notification.objects.get_or_create(
                company=company, title=title,
                defaults=dict(
                    body=msg, notification_type=ntype,
                    is_read=random.choice([True, False]),
                    recipient=pick([admin_user, hr_user]),
                )
            )
        self.stdout.write("  Notifications: seeded")

        # ── 8. Reports ─────────────────────────────────────────────────────────
        report_types = [
            ("Monthly Compliance Summary — February 2026", "compliance_status"),
            ("Q1 Employee Headcount Report",               "employee_summary"),
            ("Document Expiry Risk Report",                "document_inventory"),
            ("Annual Tax Filing Summary — 2025",           "tax_filing_summary"),
            ("H1 Social Security Reconciliation",          "social_security_summary"),
            ("Payroll Variance Analysis — Q1 2026",        "payroll_summary"),
        ]
        for title, rtype in report_types:
            Report.objects.get_or_create(
                company=company, title=title,
                defaults=dict(
                    report_type=rtype,
                    is_ready=random.choice([True, True, False]),
                    generated_by=admin_user,
                )
            )
        self.stdout.write("  Reports: seeded")

        # ── 9. Payroll ─────────────────────────────────────────────────────────
        TaxRule.objects.get_or_create(
            name="Federal Income Tax", country=country,
            defaults=dict(
                rule_type="income_tax", calc_type="percentage",
                configuration={"rate": 22.0},
                effective_from=date(2024, 1, 1),
                is_active=True
            )
        )
        for month_offset in range(6, 0, -1):
            period_start = (date.today().replace(day=1) - timedelta(days=30 * month_offset))
            period_end   = period_start + timedelta(days=29)
            run, _ = PayrollRun.objects.get_or_create(
                company=company, period_start=period_start,
                defaults=dict(
                    period_end=period_end,
                    status=pick(["completed", "approved"]),
                    processed_by=admin_user,
                    gross_total=random.randint(180000, 250000),
                    net_total=random.randint(140000, 200000),
                    deduction_total=random.randint(30000, 50000),
                    currency=usd,
                )
            )
            if _:
                for emp in random.sample(created_emps, min(20, len(created_emps))):
                    gross = random.randint(3500, 12000)
                    tax   = int(gross * 0.22)
                    PayrollLineItem.objects.get_or_create(
                        payroll_run=run, employee=emp,
                        defaults=dict(
                            gross_salary=gross,
                            employee_deductions={"income_tax": tax},
                            total_employee_deductions=tax,
                            net_salary=gross - tax,
                        )
                    )
        self.stdout.write("  Payroll runs: 6 months seeded")

        # ── 10. Signatures ─────────────────────────────────────────────────────
        if HAS_SIGNATURES:
            try:
                sig_docs = Document.objects.filter(company=company)[:5]
                for doc in sig_docs:
                    sr, _ = SignatureRequest.objects.get_or_create(
                        company=company, document=doc,
                        title=f"Sign: {doc.title}",
                        defaults=dict(
                            message="Please review and sign the attached document.",
                            status=pick(["pending", "completed", "partial"]),
                            created_by=hr_user,
                            expires_at=timezone.now() + timedelta(days=14),
                        )
                    )
                    if _:
                        for emp in random.sample(created_emps, 2):
                            signed = pick([True, False])
                            SignatureRequestSigner.objects.get_or_create(
                                request=sr, employee=emp,
                                defaults=dict(
                                    role="signer",
                                    status="signed" if signed else "pending",
                                    signed_at=timezone.now() - timedelta(days=random.randint(1, 5)) if signed else None,
                                )
                            )
                self.stdout.write("  Signatures: seeded")
            except Exception as e:
                self.stdout.write(f"  Signatures: skipped ({e})")

        # ── 11. Onboarding ─────────────────────────────────────────────────────
        if HAS_ONBOARDING:
            try:
                tmpl, _ = OnboardingTemplate.objects.get_or_create(
                    company=company, name="Standard Employee Onboarding",
                    defaults=dict(description="Default checklist for all new hires", is_default=True)
                )
                task_items = [
                    ("Upload signed employment contract", "document", True, 3),
                    ("Complete I-9 employment eligibility form", "form", True, 1),
                    ("Attend Health & Safety induction", "training", True, 5),
                    ("Sign Code of Conduct policy", "sign", True, 2),
                    ("Set up IT equipment and accounts", "other", False, 3),
                    ("Complete payroll setup form", "form", True, 2),
                ]
                tasks = []
                for i, (title, ttype, required, days) in enumerate(task_items):
                    t, _ = OnboardingTask.objects.get_or_create(
                        template=tmpl, title=title,
                        defaults=dict(task_type=ttype, is_required=required,
                                      due_days=days, order=i)
                    )
                    tasks.append(t)

                new_emps = created_emps[:6]
                for emp in new_emps:
                    ob, _ = EmployeeOnboarding.objects.get_or_create(
                        company=company, employee=emp, template=tmpl,
                        defaults=dict(
                            start_date=emp.hire_date if hasattr(emp, 'hire_date') and emp.hire_date else date.today() - timedelta(days=random.randint(10, 60)),
                            status=pick(["in_progress", "completed", "not_started"]),
                            completion_percent=pick([0, 25, 50, 75, 100]),
                        )
                    )
                    if _:
                        for t in tasks:
                            done = random.choice([True, False])
                            OnboardingTaskCompletion.objects.get_or_create(
                                onboarding=ob, task=t,
                                defaults=dict(
                                    completed=done,
                                    completed_at=timezone.now() - timedelta(days=random.randint(1, 10)) if done else None,
                                    completed_by=hr_user if done else None,
                                )
                            )
                self.stdout.write("  Onboarding: seeded")
            except Exception as e:
                self.stdout.write(f"  Onboarding: skipped ({e})")

        # ── 12. Training & Certifications ─────────────────────────────────────
        if HAS_TRAINING:
            try:
                cert_types = []
                for name, months, mandatory in CERT_TYPES:
                    ct, _ = CertificationType.objects.get_or_create(
                        company=company, name=name,
                        defaults=dict(validity_months=months, is_mandatory=mandatory,
                                      reminder_days=30)
                    )
                    cert_types.append(ct)

                certs_created = 0
                for emp in created_emps:
                    for ct in random.sample(cert_types, random.randint(1, 4)):
                        issue = rdate(365, 30)
                        expiry = issue + timedelta(days=ct.validity_months * 30)
                        status = "valid"
                        if expiry < date.today():
                            status = "expired"
                        elif expiry < date.today() + timedelta(days=30):
                            status = "expiring_soon"
                        _, c = EmployeeCertification.objects.get_or_create(
                            company=company, employee=emp, certification_type=ct,
                            defaults=dict(
                                issue_date=issue, expiry_date=expiry,
                                issuing_body=pick(["OSHA", "Red Cross", "IAPP", "CompTIA", "ISACA", "PMI"]),
                                certificate_number=f"CERT-{random.randint(10000,99999)}",
                                status=status,
                            )
                        )
                        certs_created += int(c)
                self.stdout.write(f"  Certifications: {certs_created} seeded")
            except Exception as e:
                self.stdout.write(f"  Training: skipped ({e})")

        # ── 13. Policies ───────────────────────────────────────────────────────
        if HAS_POLICIES:
            try:
                policies = []
                for title, category in POLICY_TITLES:
                    p, _ = Policy.objects.get_or_create(
                        company=company, title=title,
                        defaults=dict(
                            content=f"""## {title}\n\n### Purpose\nThis policy establishes the framework and requirements for {title.lower()} at TechNova International Ltd.\n\n### Scope\nThis policy applies to all employees, contractors, and third-party vendors.\n\n### Policy Statement\nAll individuals operating on behalf of TechNova International Ltd must comply with this policy at all times. Violations may result in disciplinary action up to and including termination.\n\n### Responsibilities\n- **Management**: Ensure this policy is communicated and enforced.\n- **HR**: Maintain acknowledgment records and track compliance.\n- **All Staff**: Read, understand, and adhere to this policy.\n\n### Review\nThis policy is reviewed annually or as required by regulatory changes.""",
                            version=random.randint(1, 3),
                            status=pick(["active", "active", "active", "draft"]),
                            category=category,
                            requires_acknowledgment=True,
                            created_by=admin_user,
                            effective_date=rdate(180, 30),
                        )
                    )
                    policies.append(p)

                acks_created = 0
                for policy in policies:
                    if policy.status == "active":
                        for emp_user in random.sample(created_emps, random.randint(8, 20)):
                            _, c = PolicyAcknowledgment.objects.get_or_create(
                                company=company, policy=policy, employee=emp_user,
                                defaults=dict(ip_address=f"192.168.{random.randint(1,10)}.{random.randint(1,200)}")
                            )
                            acks_created += int(c)
                self.stdout.write(f"  Policies + {acks_created} acknowledgments: seeded")
            except Exception as e:
                self.stdout.write(f"  Policies: skipped ({e})")

        # ── 14. Incidents ──────────────────────────────────────────────────────
        if HAS_INCIDENTS:
            try:
                for title, itype, severity in INCIDENT_TITLES:
                    incident, _ = Incident.objects.get_or_create(
                        company=company, title=title,
                        defaults=dict(
                            description=f"Incident report: {title}. Immediate investigation required per company protocol.",
                            incident_type=itype,
                            severity=severity,
                            status=pick(["open", "investigating", "resolved", "closed"]),
                            incident_date=rdate(90, 1),
                            reported_by=pick([admin_user, hr_user]),
                            assigned_to=admin_user,
                            corrective_action=pick([
                                "Access revoked and security review initiated.",
                                "Affected parties notified. Process updated.",
                                "Disciplinary review underway. Policy update issued.",
                                ""
                            ]),
                        )
                    )
                    if _:
                        IncidentUpdate.objects.create(
                            incident=incident,
                            author=admin_user,
                            content=f"Incident acknowledged. Investigation team assigned. Reference: INC-{random.randint(1000,9999)}."
                        )
                self.stdout.write("  Incidents: seeded")
            except Exception as e:
                self.stdout.write(f"  Incidents: skipped ({e})")

        # ── 15. Approvals ──────────────────────────────────────────────────────
        if HAS_APPROVALS:
            try:
                wf, _ = ApprovalWorkflow.objects.get_or_create(
                    company=company, name="Document Approval",
                    defaults=dict(workflow_type="document", is_active=True)
                )
                if _:
                    ApprovalStep.objects.get_or_create(workflow=wf, order=1,
                        defaults=dict(approver_role="hr", label="HR Review"))
                    ApprovalStep.objects.get_or_create(workflow=wf, order=2,
                        defaults=dict(approver_role="admin", label="Admin Sign-off"))

                approval_titles = [
                    "Employment Contract — Grace Mensah",
                    "NDA Agreement — CloudSec Ltd",
                    "Leave Request — David Adeyemi",
                    "Expense Report Q1 2026",
                    "Remote Work Agreement — Sarah Mwangi",
                ]
                for title in approval_titles:
                    ApprovalRequest.objects.get_or_create(
                        company=company, title=title,
                        defaults=dict(
                            workflow=wf,
                            object_type="document",
                            object_id=company.id,
                            status=pick(["pending", "approved", "pending", "rejected"]),
                            requested_by=hr_user,
                            current_step=1,
                        )
                    )
                self.stdout.write("  Approvals: seeded")
            except Exception as e:
                self.stdout.write(f"  Approvals: skipped ({e})")

        # ── 16. Vendors ────────────────────────────────────────────────────────
        if HAS_VENDORS:
            try:
                vtypes = ["contractor", "supplier", "consultant", "service_provider"]
                for i, vname in enumerate(VENDOR_NAMES):
                    v, _ = Vendor.objects.get_or_create(
                        company=company, name=vname,
                        defaults=dict(
                            vendor_type=pick(vtypes),
                            contact_name=f"{pick(FIRST_NAMES)} {pick(LAST_NAMES)}",
                            contact_email=f"contact@{vname.lower().replace(' ','')}.com",
                            contact_phone=f"+1 555 {random.randint(1000,9999)}",
                            status=pick(["active", "active", "active", "inactive"]),
                            compliance_score=random.randint(55, 100),
                            country=country,
                        )
                    )
                    if _:
                        VendorDocument.objects.get_or_create(
                            company=company, vendor=v,
                            document_type="insurance",
                            defaults=dict(
                                title=f"Liability Insurance — {vname}",
                                expiry_date=date.today() + timedelta(days=random.randint(-30, 365)),
                                status=pick(["valid", "valid", "expiring_soon", "expired"]),
                            )
                        )
                        VendorDocument.objects.get_or_create(
                            company=company, vendor=v,
                            document_type="contract",
                            defaults=dict(
                                title=f"Service Agreement — {vname}",
                                expiry_date=date.today() + timedelta(days=random.randint(30, 730)),
                                status="valid",
                            )
                        )
                self.stdout.write("  Vendors: seeded")
            except Exception as e:
                self.stdout.write(f"  Vendors: skipped ({e})")

        # ── 17. Custom Forms ───────────────────────────────────────────────────
        if HAS_FORMS:
            try:
                form_templates = [
                    ("New Hire Information Form", "hr"),
                    ("Annual Health Questionnaire", "health_safety"),
                    ("Remote Work Risk Assessment", "hr"),
                    ("Supplier Onboarding Checklist", "procurement"),
                ]
                for fname, fcategory in form_templates:
                    ft, _ = FormTemplate.objects.get_or_create(
                        company=company, title=fname,
                        defaults=dict(category=fcategory, is_active=True, created_by=admin_user)
                    )
                    if _:
                        field_defs = [
                            ("Full Legal Name", "text", True, 0),
                            ("Date of Birth", "date", True, 1),
                            ("Emergency Contact Name", "text", False, 2),
                            ("Emergency Contact Phone", "text", False, 3),
                            ("Department", "select", True, 4),
                            ("Have you read the company handbook?", "checkbox", True, 5),
                            ("Additional Comments", "textarea", False, 6),
                        ]
                        for flabel, ftype, frequired, forder in field_defs:
                            options = ["Engineering", "HR", "Finance", "Operations", "Legal"] if ftype == "select" else []
                            FormField.objects.get_or_create(
                                template=ft, label=flabel,
                                defaults=dict(field_type=ftype, is_required=frequired,
                                              order=forder, options=options)
                            )
                        for emp in random.sample(created_emps, min(5, len(created_emps))):
                            FormSubmission.objects.get_or_create(
                                company=company, template=ft,
                                submitted_by=hr_user, employee=emp,
                                defaults=dict(
                                    data={"Full Legal Name": f"{emp.first_name} {emp.last_name}",
                                          "Department": emp.department.name if emp.department else ""},
                                    status="submitted",
                                )
                            )
                self.stdout.write("  Forms: seeded")
            except Exception as e:
                self.stdout.write(f"  Forms: skipped ({e})")

        # ── 18. Integrations ───────────────────────────────────────────────────
        if HAS_INTEGRATIONS:
            try:
                int_types = [
                    ("quickbooks", "QuickBooks", True),
                    ("slack",      "Slack",      True),
                    ("bamboohr",   "BambooHR",   False),
                ]
                for itype, iname, active in int_types:
                    Integration.objects.get_or_create(
                        company=company, integration_type=itype,
                        defaults=dict(
                            name=iname, is_active=active,
                            sync_status="success" if active else "idle",
                            last_sync_at=timezone.now() - timedelta(hours=random.randint(1, 48)) if active else None,
                        )
                    )
                self.stdout.write("  Integrations: seeded")
            except Exception as e:
                self.stdout.write(f"  Integrations: skipped ({e})")

        self.stdout.write(self.style.SUCCESS("\n✅  Demo seed complete!"))
        self.stdout.write("   Login: admin@technova.com / Demo@12345")
        self.stdout.write("   Company: TechNova International Ltd")

    def _reset_tenant(self, company):
        """Delete all tenant-scoped data for a fresh re-seed."""
        from apps.employees.models import Employee, Department
        from apps.documents.models import Document
        from apps.compliance.models import ComplianceRecord
        from apps.notifications.models import Notification
        from apps.reports.models import Report

        for model in [Employee, Document, ComplianceRecord, Notification, Report]:
            try:
                model.objects.filter(company=company).delete()
            except Exception:
                pass
