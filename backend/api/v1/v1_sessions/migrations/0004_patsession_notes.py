# Generated by Django 4.2.15 on 2024-09-26 04:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "v1_sessions",
            "0003_participant_session_deleted_at_patsession_deleted_at_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="patsession",
            name="notes",
            field=models.TextField(default=None, null=True),
        ),
    ]
