# Generated by Django 4.2.15 on 2024-09-12 13:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Decision",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("agree", models.BooleanField(default=None, null=True)),
                ("notes", models.TextField(default=None, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(default=None, null=True)),
            ],
            options={
                "db_table": "decisions",
            },
        ),
        migrations.CreateModel(
            name="Organization",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("organization_name", models.CharField(max_length=255)),
                ("acronym", models.CharField(default=None, max_length=50, null=True)),
            ],
            options={
                "db_table": "organizations",
            },
        ),
        migrations.CreateModel(
            name="PATSession",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("session_name", models.CharField(max_length=255)),
                ("countries", models.TextField()),
                (
                    "sector",
                    models.IntegerField(
                        choices=[
                            (1, "Agriculture and Food Security"),
                            (2, "Disaster Relief and Humanitarian Aid"),
                            (3, "Economic Development and Poverty Alleviation"),
                            (4, "Education"),
                            (5, "Environmental Conservation"),
                            (6, "Health and Medical Services"),
                            (7, "Human Rights and Social Justice"),
                            (8, "Other"),
                        ]
                    ),
                ),
                ("other_sector", models.CharField(max_length=100, null=True)),
                ("date", models.DateField()),
                ("context", models.TextField()),
                ("summary", models.TextField(default=None, null=True)),
                (
                    "join_code",
                    models.CharField(default=None, max_length=100, null=True),
                ),
                ("is_published", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(default=None, null=True)),
                ("closed_at", models.DateTimeField(default=None, null=True)),
                (
                    "user_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_owner_session",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "pat_sessions",
            },
        ),
        migrations.CreateModel(
            name="ParticipantDecision",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("score", models.IntegerField()),
                ("updated_at", models.DateTimeField(default=None, null=True)),
                ("closed_at", models.DateTimeField(default=None, null=True)),
                (
                    "decision_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="decision_participant",
                        to="v1_sessions.decision",
                    ),
                ),
                (
                    "user_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_participant_decision",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "participant_decisions",
            },
        ),
        migrations.CreateModel(
            name="Participant",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("joined_at", models.DateTimeField(auto_now_add=True)),
                (
                    "organization_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="organization_participant",
                        to="v1_sessions.organization",
                    ),
                ),
                (
                    "session_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="session_participant",
                        to="v1_sessions.patsession",
                    ),
                ),
                (
                    "user_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_participant",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "participants",
            },
        ),
        migrations.AddField(
            model_name="organization",
            name="session_id",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="session_organization",
                to="v1_sessions.patsession",
            ),
        ),
        migrations.AddField(
            model_name="decision",
            name="session_id",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name="session_decision",
                to="v1_sessions.patsession",
            ),
        ),
    ]
