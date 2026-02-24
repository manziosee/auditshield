"""
Management command: seed_compliance
Populates ComplianceCategory and ComplianceRequirement tables with
Rwanda-specific RRA / RSSB / Labor Law requirements.

Usage:
    python manage.py seed_compliance
    python manage.py seed_compliance --reset   # clears existing data first
"""
from django.core.management.base import BaseCommand


REQUIREMENTS = [
    # ── RRA Tax ───────────────────────────────────────────────────────────────
    {
        "category": {
            "name": "RRA Tax Obligations",
            "description": "Rwanda Revenue Authority tax filings and payments",
            "authority": "RRA",
            "icon": "receipt_long",
            "order": 1,
        },
        "requirements": [
            {
                "title": "Monthly PAYE (Pay As You Earn) Return",
                "description": "File monthly PAYE tax return on employee salaries to RRA.",
                "frequency": "monthly",
                "deadline_day": 15,
                "is_mandatory": True,
                "document_types_required": ["paye_return"],
                "penalty_description": "Late filing: 10% of tax due + 1.5% interest per month",
            },
            {
                "title": "Monthly VAT Return",
                "description": "File monthly VAT return if registered for VAT.",
                "frequency": "monthly",
                "deadline_day": 15,
                "is_mandatory": True,
                "document_types_required": ["vat_return"],
                "penalty_description": "Late filing: 10% of tax due",
            },
            {
                "title": "Annual Corporate Income Tax (CIT) Return",
                "description": "File annual income tax return within 3 months of fiscal year-end.",
                "frequency": "annually",
                "deadline_day": 31,
                "is_mandatory": True,
                "document_types_required": ["audit_report"],
                "penalty_description": "Late filing: RWF 100,000 penalty",
            },
            {
                "title": "Tax Clearance Certificate Renewal",
                "description": "Obtain annual tax clearance certificate from RRA.",
                "frequency": "annually",
                "deadline_day": 31,
                "is_mandatory": True,
                "document_types_required": ["tax_clearance"],
                "penalty_description": "Required for government contracts and tenders",
            },
            {
                "title": "Withholding Tax on Rent & Services",
                "description": "File withholding tax returns on rent and professional services paid.",
                "frequency": "monthly",
                "deadline_day": 15,
                "is_mandatory": True,
                "document_types_required": ["rra_filing"],
                "penalty_description": "Late: 10% of withheld amount",
            },
        ],
    },
    # ── RSSB ──────────────────────────────────────────────────────────────────
    {
        "category": {
            "name": "RSSB Contributions",
            "description": "Rwanda Social Security Board employee contributions",
            "authority": "RSSB",
            "icon": "people_alt",
            "order": 2,
        },
        "requirements": [
            {
                "title": "Monthly RSSB Pension Contribution",
                "description": "Declare and remit employee pension contributions (3% employee + 5% employer).",
                "frequency": "monthly",
                "deadline_day": 10,
                "is_mandatory": True,
                "document_types_required": ["rssb_declaration"],
                "penalty_description": "Late payment: 5% of amount due per month",
            },
            {
                "title": "Monthly Health Insurance (CBHI/Mutuelle) Contribution",
                "description": "Remit employee medical insurance contributions to RSSB.",
                "frequency": "monthly",
                "deadline_day": 10,
                "is_mandatory": True,
                "document_types_required": ["rssb_declaration"],
                "penalty_description": "Late payment: penalties as per RSSB regulations",
            },
            {
                "title": "Maternity Leave Insurance Declaration",
                "description": "Declare maternity leave payments for reimbursement from RSSB.",
                "frequency": "as_needed",
                "deadline_day": None,
                "is_mandatory": True,
                "document_types_required": ["rssb_declaration"],
                "penalty_description": "Must be filed within 30 days of maternity leave start",
            },
            {
                "title": "Annual Employee List Update",
                "description": "Update employee list with RSSB — add new joiners, remove leavers.",
                "frequency": "annually",
                "deadline_day": 31,
                "is_mandatory": True,
                "document_types_required": ["rssb_declaration"],
                "penalty_description": "Missing employees cannot claim RSSB benefits",
            },
        ],
    },
    # ── Labor Law ─────────────────────────────────────────────────────────────
    {
        "category": {
            "name": "Labor Law Compliance",
            "description": "Rwanda Labor Code (Law No. 66/2018) compliance requirements",
            "authority": "MIFOTRA",
            "icon": "gavel",
            "order": 3,
        },
        "requirements": [
            {
                "title": "Employment Contracts on File",
                "description": "Ensure all employees have signed employment contracts archived.",
                "frequency": "one_time",
                "deadline_day": None,
                "is_mandatory": True,
                "document_types_required": ["employment_contract"],
                "penalty_description": "Labor inspector can issue fines for missing contracts",
            },
            {
                "title": "Payslip Issuance",
                "description": "Issue monthly payslips to all employees as required by law.",
                "frequency": "monthly",
                "deadline_day": 28,
                "is_mandatory": True,
                "document_types_required": ["payslip"],
                "penalty_description": "Employee can file labor complaint for missing payslips",
            },
            {
                "title": "Annual Leave Register",
                "description": "Maintain an accurate record of employee annual leave days used.",
                "frequency": "annually",
                "deadline_day": 31,
                "is_mandatory": True,
                "document_types_required": ["other"],
                "penalty_description": "Required for labor audit compliance",
            },
            {
                "title": "Internship Contract Registration",
                "description": "Register internship agreements with MIFOTRA within 30 days of start.",
                "frequency": "as_needed",
                "deadline_day": None,
                "is_mandatory": True,
                "document_types_required": ["employment_contract"],
                "penalty_description": "Unregistered interns cannot claim labor protection",
            },
        ],
    },
    # ── Business Registration ──────────────────────────────────────────────────
    {
        "category": {
            "name": "Business Registration & Licenses",
            "description": "RDB registration and sector-specific operating licenses",
            "authority": "RDB",
            "icon": "business",
            "order": 4,
        },
        "requirements": [
            {
                "title": "Annual Business Registration Renewal",
                "description": "Renew company registration with Rwanda Development Board (RDB) annually.",
                "frequency": "annually",
                "deadline_day": 31,
                "is_mandatory": True,
                "document_types_required": ["business_registration"],
                "penalty_description": "Deregistration and inability to operate legally",
            },
            {
                "title": "Operating License Renewal",
                "description": "Renew sector-specific operating licenses (e.g. trading license).",
                "frequency": "annually",
                "deadline_day": None,
                "is_mandatory": True,
                "document_types_required": ["other"],
                "penalty_description": "Varies by sector and licensing authority",
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Seed compliance categories and requirements for Rwanda"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing categories and requirements before seeding",
        )

    def handle(self, *args, **options):
        from apps.compliance.models import ComplianceCategory, ComplianceRequirement

        if options["reset"]:
            ComplianceRequirement.objects.all().delete()
            ComplianceCategory.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing compliance data."))

        created_cats = 0
        created_reqs = 0

        for block in REQUIREMENTS:
            cat_data = block["category"]
            category, cat_created = ComplianceCategory.objects.update_or_create(
                name=cat_data["name"],
                defaults={
                    "description": cat_data["description"],
                    "authority": cat_data["authority"],
                    "icon": cat_data["icon"],
                    "order": cat_data["order"],
                },
            )
            if cat_created:
                created_cats += 1

            for req_data in block["requirements"]:
                _, req_created = ComplianceRequirement.objects.update_or_create(
                    category=category,
                    title=req_data["title"],
                    defaults={
                        "description": req_data["description"],
                        "frequency": req_data["frequency"],
                        "deadline_day": req_data["deadline_day"],
                        "is_mandatory": req_data["is_mandatory"],
                        "document_types_required": req_data["document_types_required"],
                        "penalty_description": req_data["penalty_description"],
                    },
                )
                if req_created:
                    created_reqs += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Compliance seed complete: "
                f"{created_cats} new categories, {created_reqs} new requirements."
            )
        )
