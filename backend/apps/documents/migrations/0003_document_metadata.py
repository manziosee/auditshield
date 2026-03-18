from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0002_alter_document_document_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="document",
            name="metadata",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Flexible metadata store — includes ai_extracted sub-key after OCR processing",
            ),
        ),
    ]
