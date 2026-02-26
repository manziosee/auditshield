"""
Management command: seed_global_data
Seeds Countries, Currencies, Authorities, and global Compliance requirements.
Country packs are modular — add new countries by extending COUNTRY_PACKS.

Usage:
    python manage.py seed_global_data
    python manage.py seed_global_data --country KE   # Kenya only
    python manage.py seed_global_data --reset         # clear and re-seed everything
"""
from django.core.management.base import BaseCommand

# ─── Currencies ───────────────────────────────────────────────────────────────
CURRENCIES = [
    {"code": "USD", "name": "US Dollar",          "symbol": "$",   "decimal_places": 2},
    {"code": "EUR", "name": "Euro",                "symbol": "€",   "decimal_places": 2},
    {"code": "GBP", "name": "British Pound",       "symbol": "£",   "decimal_places": 2},
    {"code": "KES", "name": "Kenyan Shilling",     "symbol": "KSh", "decimal_places": 2},
    {"code": "UGX", "name": "Ugandan Shilling",    "symbol": "USh", "decimal_places": 0},
    {"code": "TZS", "name": "Tanzanian Shilling",  "symbol": "TSh", "decimal_places": 2},
    {"code": "RWF", "name": "Rwandan Franc",       "symbol": "Rwf", "decimal_places": 0},
    {"code": "GHS", "name": "Ghanaian Cedi",       "symbol": "₵",   "decimal_places": 2},
    {"code": "NGN", "name": "Nigerian Naira",      "symbol": "₦",   "decimal_places": 2},
    {"code": "ZAR", "name": "South African Rand",  "symbol": "R",   "decimal_places": 2},
    {"code": "INR", "name": "Indian Rupee",        "symbol": "₹",   "decimal_places": 2},
    {"code": "AED", "name": "UAE Dirham",          "symbol": "د.إ", "decimal_places": 2},
    {"code": "CAD", "name": "Canadian Dollar",     "symbol": "CA$", "decimal_places": 2},
    {"code": "AUD", "name": "Australian Dollar",   "symbol": "A$",  "decimal_places": 2},
    {"code": "SGD", "name": "Singapore Dollar",    "symbol": "S$",  "decimal_places": 2},
    {"code": "EGP", "name": "Egyptian Pound",      "symbol": "E£",  "decimal_places": 2},
    {"code": "MAD", "name": "Moroccan Dirham",     "symbol": "DH",  "decimal_places": 2},
]

# ─── Countries ────────────────────────────────────────────────────────────────
COUNTRIES = [
    {"name": "Kenya",          "iso_code": "KE", "iso_code_3": "KEN", "currency": "KES", "timezone": "Africa/Nairobi",    "phone_prefix": "+254", "flag_emoji": "🇰🇪", "tax_year_start_month": 1},
    {"name": "Uganda",         "iso_code": "UG", "iso_code_3": "UGA", "currency": "UGX", "timezone": "Africa/Kampala",    "phone_prefix": "+256", "flag_emoji": "🇺🇬", "tax_year_start_month": 7},
    {"name": "Tanzania",       "iso_code": "TZ", "iso_code_3": "TZA", "currency": "TZS", "timezone": "Africa/Dar_es_Salaam", "phone_prefix": "+255", "flag_emoji": "🇹🇿", "tax_year_start_month": 7},
    {"name": "Rwanda",         "iso_code": "RW", "iso_code_3": "RWA", "currency": "RWF", "timezone": "Africa/Kigali",     "phone_prefix": "+250", "flag_emoji": "🇷🇼", "tax_year_start_month": 1},
    {"name": "Ghana",          "iso_code": "GH", "iso_code_3": "GHA", "currency": "GHS", "timezone": "Africa/Accra",      "phone_prefix": "+233", "flag_emoji": "🇬🇭", "tax_year_start_month": 1},
    {"name": "Nigeria",        "iso_code": "NG", "iso_code_3": "NGA", "currency": "NGN", "timezone": "Africa/Lagos",      "phone_prefix": "+234", "flag_emoji": "🇳🇬", "tax_year_start_month": 1},
    {"name": "South Africa",   "iso_code": "ZA", "iso_code_3": "ZAF", "currency": "ZAR", "timezone": "Africa/Johannesburg", "phone_prefix": "+27",  "flag_emoji": "🇿🇦", "tax_year_start_month": 3},
    {"name": "United Kingdom", "iso_code": "GB", "iso_code_3": "GBR", "currency": "GBP", "timezone": "Europe/London",     "phone_prefix": "+44",  "flag_emoji": "🇬🇧", "tax_year_start_month": 4},
    {"name": "United States",  "iso_code": "US", "iso_code_3": "USA", "currency": "USD", "timezone": "America/New_York",  "phone_prefix": "+1",   "flag_emoji": "🇺🇸", "tax_year_start_month": 1},
    {"name": "India",          "iso_code": "IN", "iso_code_3": "IND", "currency": "INR", "timezone": "Asia/Kolkata",      "phone_prefix": "+91",  "flag_emoji": "🇮🇳", "tax_year_start_month": 4},
    {"name": "UAE",            "iso_code": "AE", "iso_code_3": "ARE", "currency": "AED", "timezone": "Asia/Dubai",        "phone_prefix": "+971", "flag_emoji": "🇦🇪", "tax_year_start_month": 1},
    {"name": "Canada",         "iso_code": "CA", "iso_code_3": "CAN", "currency": "CAD", "timezone": "America/Toronto",   "phone_prefix": "+1",   "flag_emoji": "🇨🇦", "tax_year_start_month": 1},
    {"name": "Australia",      "iso_code": "AU", "iso_code_3": "AUS", "currency": "AUD", "timezone": "Australia/Sydney",  "phone_prefix": "+61",  "flag_emoji": "🇦🇺", "tax_year_start_month": 7},
    {"name": "Egypt",          "iso_code": "EG", "iso_code_3": "EGY", "currency": "EGP", "timezone": "Africa/Cairo",      "phone_prefix": "+20",  "flag_emoji": "🇪🇬", "tax_year_start_month": 1},
    {"name": "Morocco",        "iso_code": "MA", "iso_code_3": "MAR", "currency": "MAD", "timezone": "Africa/Casablanca", "phone_prefix": "+212", "flag_emoji": "🇲🇦", "tax_year_start_month": 1},
    {"name": "Singapore",      "iso_code": "SG", "iso_code_3": "SGP", "currency": "SGD", "timezone": "Asia/Singapore",   "phone_prefix": "+65",  "flag_emoji": "🇸🇬", "tax_year_start_month": 1},
]

# ─── Universal Compliance Templates (country-agnostic) ────────────────────────
UNIVERSAL_REQUIREMENTS = [
    {
        "category": {"name": "Employment Records",  "icon": "badge",      "order": 1},
        "requirements": [
            {
                "title": "Employment Contracts on File",
                "description": "Ensure all employees have signed employment contracts archived.",
                "frequency": "one_time", "deadline_day": None, "is_mandatory": True,
                "document_types_required": ["employment_contract"],
                "penalty_description": "Labour inspectors can issue fines for missing contracts.",
            },
            {
                "title": "Monthly Payslip Issuance",
                "description": "Issue monthly payslips to all employees as required by law.",
                "frequency": "monthly", "deadline_day": 28, "is_mandatory": True,
                "document_types_required": ["payslip"],
                "penalty_description": "Employees can file labour complaints for missing payslips.",
            },
            {
                "title": "Annual Leave Register",
                "description": "Maintain an accurate record of employee annual leave balances.",
                "frequency": "annually", "deadline_day": 31, "is_mandatory": True,
                "document_types_required": ["other"],
                "penalty_description": "Required for labour audit compliance.",
            },
        ],
    },
    {
        "category": {"name": "Tax Compliance",  "icon": "receipt_long",  "order": 2},
        "requirements": [
            {
                "title": "Monthly Payroll Tax Return",
                "description": "File monthly payroll/income tax return on employee salaries to your national tax authority.",
                "frequency": "monthly", "deadline_day": 15, "is_mandatory": True,
                "document_types_required": ["payroll_tax_return"],
                "penalty_description": "Late filing typically incurs 10% of tax due + interest.",
            },
            {
                "title": "VAT / Sales Tax Return",
                "description": "File periodic VAT or sales tax return if registered.",
                "frequency": "monthly", "deadline_day": 20, "is_mandatory": False,
                "document_types_required": ["vat_return"],
                "penalty_description": "Late filing penalties vary by country.",
            },
            {
                "title": "Annual Corporate Income Tax Return",
                "description": "File annual income tax return within the statutory deadline after fiscal year-end.",
                "frequency": "annually", "deadline_day": 31, "is_mandatory": True,
                "document_types_required": ["audit_report"],
                "penalty_description": "Significant penalties for late or incorrect filing.",
            },
            {
                "title": "Tax Clearance Certificate",
                "description": "Obtain annual tax clearance certificate from your tax authority.",
                "frequency": "annually", "deadline_day": 31, "is_mandatory": True,
                "document_types_required": ["tax_clearance"],
                "penalty_description": "Required for government contracts and tenders.",
            },
        ],
    },
    {
        "category": {"name": "Social Security & Pension", "icon": "people_alt", "order": 3},
        "requirements": [
            {
                "title": "Monthly Social Security / Pension Contribution",
                "description": "Declare and remit employee and employer social security / pension contributions.",
                "frequency": "monthly", "deadline_day": 15, "is_mandatory": True,
                "document_types_required": ["social_security_declaration"],
                "penalty_description": "Late payment typically incurs 5% of amount due per month.",
            },
            {
                "title": "Annual Employee Enrollment Update",
                "description": "Add new joiners and remove leavers from your social security / pension registry.",
                "frequency": "annually", "deadline_day": 31, "is_mandatory": True,
                "document_types_required": ["social_security_declaration"],
                "penalty_description": "Missing employees cannot claim benefits.",
            },
        ],
    },
    {
        "category": {"name": "Business Registration & Licensing", "icon": "business", "order": 4},
        "requirements": [
            {
                "title": "Annual Business Registration Renewal",
                "description": "Renew company registration with the national business registry.",
                "frequency": "annually", "deadline_day": 31, "is_mandatory": True,
                "document_types_required": ["business_registration"],
                "penalty_description": "Non-renewal can result in deregistration.",
            },
            {
                "title": "Operating License Renewal",
                "description": "Renew sector-specific operating licenses as required.",
                "frequency": "annually", "deadline_day": None, "is_mandatory": True,
                "document_types_required": ["operating_license"],
                "penalty_description": "Varies by sector and licensing authority.",
            },
        ],
    },
]

# ─── Country-Specific Authorities ─────────────────────────────────────────────
COUNTRY_AUTHORITIES = {
    "KE": [
        {"name": "Kenya Revenue Authority",   "short_name": "KRA",   "authority_type": "tax"},
        {"name": "National Social Security Fund", "short_name": "NSSF", "authority_type": "social_security"},
        {"name": "National Hospital Insurance Fund", "short_name": "NHIF", "authority_type": "social_security"},
        {"name": "Business Registration Service", "short_name": "BRS",  "authority_type": "corporate"},
        {"name": "Ministry of Labour",        "short_name": "MOLSP", "authority_type": "labor"},
    ],
    "RW": [
        {"name": "Rwanda Revenue Authority",           "short_name": "RRA",    "authority_type": "tax"},
        {"name": "Rwanda Social Security Board",       "short_name": "RSSB",   "authority_type": "social_security"},
        {"name": "Rwanda Development Board",           "short_name": "RDB",    "authority_type": "corporate"},
        {"name": "Ministry of Public Service and Labour", "short_name": "MIFOTRA", "authority_type": "labor"},
    ],
    "NG": [
        {"name": "Federal Inland Revenue Service",    "short_name": "FIRS",   "authority_type": "tax"},
        {"name": "Nigeria Social Insurance Trust Fund", "short_name": "NSITF", "authority_type": "social_security"},
        {"name": "Pension Commission",                "short_name": "PenCom", "authority_type": "social_security"},
        {"name": "Corporate Affairs Commission",      "short_name": "CAC",    "authority_type": "corporate"},
        {"name": "Ministry of Labour and Employment", "short_name": "MLE",    "authority_type": "labor"},
    ],
    "ZA": [
        {"name": "South African Revenue Service",     "short_name": "SARS",   "authority_type": "tax"},
        {"name": "Unemployment Insurance Fund",       "short_name": "UIF",    "authority_type": "social_security"},
        {"name": "Companies and Intellectual Property Commission", "short_name": "CIPC", "authority_type": "corporate"},
        {"name": "Department of Labour",              "short_name": "DoL",    "authority_type": "labor"},
    ],
    "GB": [
        {"name": "HM Revenue and Customs",            "short_name": "HMRC",   "authority_type": "tax"},
        {"name": "Department for Work and Pensions",  "short_name": "DWP",    "authority_type": "social_security"},
        {"name": "Companies House",                   "short_name": "CH",     "authority_type": "corporate"},
    ],
    "US": [
        {"name": "Internal Revenue Service",          "short_name": "IRS",    "authority_type": "tax"},
        {"name": "Social Security Administration",    "short_name": "SSA",    "authority_type": "social_security"},
        {"name": "Department of Labor",               "short_name": "DOL",    "authority_type": "labor"},
    ],
    "GH": [
        {"name": "Ghana Revenue Authority",           "short_name": "GRA",    "authority_type": "tax"},
        {"name": "Social Security and National Insurance Trust", "short_name": "SSNIT", "authority_type": "social_security"},
        {"name": "Registrar General's Department",    "short_name": "RGD",    "authority_type": "corporate"},
    ],
    "UG": [
        {"name": "Uganda Revenue Authority",          "short_name": "URA",    "authority_type": "tax"},
        {"name": "National Social Security Fund",     "short_name": "NSSF",   "authority_type": "social_security"},
        {"name": "Uganda Registration Services Bureau", "short_name": "URSB", "authority_type": "corporate"},
    ],
    "TZ": [
        {"name": "Tanzania Revenue Authority",        "short_name": "TRA",    "authority_type": "tax"},
        {"name": "National Social Security Fund",     "short_name": "NSSF",   "authority_type": "social_security"},
        {"name": "Business Registrations and Licensing Agency", "short_name": "BRELA", "authority_type": "corporate"},
    ],
    "AE": [
        {"name": "Federal Tax Authority",             "short_name": "FTA",    "authority_type": "tax"},
        {"name": "General Pension and Social Security Authority", "short_name": "GPSSA", "authority_type": "social_security"},
        {"name": "Department of Economic Development", "short_name": "DED",   "authority_type": "corporate"},
    ],
    "IN": [
        {"name": "Central Board of Direct Taxes",     "short_name": "CBDT",   "authority_type": "tax"},
        {"name": "Employees Provident Fund Organisation", "short_name": "EPFO", "authority_type": "social_security"},
        {"name": "Employees State Insurance Corporation", "short_name": "ESIC", "authority_type": "social_security"},
        {"name": "Ministry of Corporate Affairs",     "short_name": "MCA",    "authority_type": "corporate"},
    ],
}


class Command(BaseCommand):
    help = "Seed global currencies, countries, compliance authorities, and universal requirements"

    def add_arguments(self, parser):
        parser.add_argument("--country", type=str, help="ISO-2 code to seed only one country's authorities (e.g. KE)")
        parser.add_argument("--reset", action="store_true", help="Clear existing data before seeding")

    def handle(self, *args, **options):
        from apps.compliance.models import Authority, ComplianceCategory, ComplianceRequirement
        from apps.geography.models import Country, Currency

        if options["reset"]:
            ComplianceRequirement.objects.all().delete()
            ComplianceCategory.objects.all().delete()
            Authority.objects.all().delete()
            Country.objects.all().delete()
            Currency.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing geo and compliance data."))

        # 1. Seed currencies
        currency_map = {}
        for data in CURRENCIES:
            obj, created = Currency.objects.update_or_create(
                code=data["code"],
                defaults={"name": data["name"], "symbol": data["symbol"], "decimal_places": data["decimal_places"]},
            )
            currency_map[data["code"]] = obj
            if created:
                self.stdout.write(f"  + Currency: {obj}")

        # 2. Seed countries
        country_map = {}
        target_iso = options.get("country")
        for data in COUNTRIES:
            if target_iso and data["iso_code"] != target_iso:
                continue
            currency = currency_map.get(data["currency"])
            if not currency:
                self.stdout.write(self.style.WARNING(f"  ! Currency {data['currency']} not found for {data['name']}"))
                continue
            obj, created = Country.objects.update_or_create(
                iso_code=data["iso_code"],
                defaults={
                    "name": data["name"],
                    "iso_code_3": data["iso_code_3"],
                    "default_currency": currency,
                    "default_timezone": data["timezone"],
                    "phone_prefix": data["phone_prefix"],
                    "flag_emoji": data["flag_emoji"],
                    "tax_year_start_month": data.get("tax_year_start_month", 1),
                },
            )
            country_map[data["iso_code"]] = obj
            if created:
                self.stdout.write(f"  + Country: {obj}")

        # 3. Seed country-specific authorities
        for iso, authorities in COUNTRY_AUTHORITIES.items():
            if target_iso and iso != target_iso:
                continue
            country = country_map.get(iso) or Country.objects.filter(iso_code=iso).first()
            if not country:
                continue
            for adata in authorities:
                obj, created = Authority.objects.update_or_create(
                    country=country,
                    short_name=adata["short_name"],
                    defaults={
                        "name": adata["name"],
                        "authority_type": adata["authority_type"],
                        "is_active": True,
                    },
                )
                if created:
                    self.stdout.write(f"  + Authority: {obj}")

        # 4. Seed universal compliance requirements (no country / authority binding)
        req_count = 0
        for block in UNIVERSAL_REQUIREMENTS:
            cat_data = block["category"]
            category, _ = ComplianceCategory.objects.update_or_create(
                name=cat_data["name"],
                defaults={"icon": cat_data["icon"], "order": cat_data["order"], "authority": None},
            )
            for req_data in block["requirements"]:
                _, created = ComplianceRequirement.objects.update_or_create(
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
                if created:
                    req_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nGlobal seed complete:\n"
            f"  {len(currency_map)} currencies\n"
            f"  {len(country_map)} countries\n"
            f"  {req_count} universal compliance requirements\n"
            f"\nRun with --country KE (or any ISO-2 code) to seed country-specific authorities."
        ))
