"""
Management command: create_admin
Quickly creates a superuser and optionally a demo company for development.

Usage:
    python manage.py create_admin
    python manage.py create_admin --email admin@demo.rw --password Admin123!
"""
import os

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a Django superuser with a demo company for development"

    def add_arguments(self, parser):
        parser.add_argument("--email", default="admin@auditshield.rw")
        parser.add_argument("--password", default="Admin@123456")
        parser.add_argument("--no-company", action="store_true", help="Skip creating a demo company")

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        email = options["email"]
        password = options["password"]

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"User {email} already exists. Skipping."))
            return

        company = None
        if not options["no_company"]:
            from apps.companies.models import Company
            company, created = Company.objects.get_or_create(
                name="Demo Company Ltd",
                defaults={
                    "company_type": "sme",
                    "email": "demo@company.rw",
                    "phone": "+250788000000",
                    "district": "Kigali",
                    "tin_number": "000000000",
                    "subscription_plan": "enterprise",
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created demo company: {company.name}"))

        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name="Super",
            last_name="Admin",
            role=User.Role.SUPER_ADMIN,
            company=company,
            must_change_password=False,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Superuser created:\n"
                f"  Email:    {user.email}\n"
                f"  Password: {password}\n"
                f"  Company:  {company.name if company else 'None'}\n\n"
                f"API Docs:  http://localhost:8000/api/docs/\n"
                f"Admin:     http://localhost:8000/admin/\n"
                f"GraphiQL:  http://localhost:8000/graphql/"
            )
        )
