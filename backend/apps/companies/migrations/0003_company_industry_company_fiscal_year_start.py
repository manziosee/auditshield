from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0002_remove_company_district_remove_company_rssb_number_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="industry",
            field=models.CharField(
                blank=True,
                help_text="Business sector (e.g. technology, healthcare, retail, ngo)",
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name="company",
            name="fiscal_year_start",
            field=models.PositiveSmallIntegerField(
                default=1,
                help_text="Month the fiscal year starts (1=January \u2026 12=December)",
            ),
        ),
    ]
