# Generated by Django 4.2.15 on 2024-11-14 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("v1_sessions", "0007_rename_other_sector_patsession_other_purpose_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="patsession",
            name="purpose",
            field=models.IntegerField(
                choices=[
                    (1, "purposeCreation1"),
                    (2, "purposeCreation2"),
                    (3, "purposeCreation3"),
                    (4, "purposeCreation4"),
                    (5, "purposeCreation5"),
                    (6, "purposeCreation6"),
                ],
                default=None,
                null=True,
            ),
        ),
    ]