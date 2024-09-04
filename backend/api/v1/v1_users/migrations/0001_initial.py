# Generated by Django 4.2.15 on 2024-09-04 07:00

from django.db import migrations, models
import utils.custom_manager


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="SystemUser",
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
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("first_name", models.CharField(max_length=50)),
                ("last_name", models.CharField(blank=True, max_length=50)),
                ("date_joined", models.DateTimeField(auto_now_add=True)),
                ("updated", models.DateTimeField(default=None, null=True)),
                ("country", models.CharField(max_length=25)),
                (
                    "account_purpose",
                    models.IntegerField(
                        choices=[
                            (1, "purposeOfAccount1"),
                            (2, "purposeOfAccount2"),
                            (3, "purposeOfAccount3"),
                            (4, "purposeOfAccount4"),
                            (5, "purposeOfAccount5"),
                            (6, "purposeOfAccount6"),
                        ],
                        default=None,
                        null=True,
                    ),
                ),
                (
                    "gender",
                    models.IntegerField(
                        choices=[(1, "male"), (2, "female"), (3, "other")],
                        default=None,
                        null=True,
                    ),
                ),
                ("is_verified", models.BooleanField(default=False)),
                ("verification_token", models.TextField()),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "db_table": "system_user",
            },
            managers=[
                ("objects", utils.custom_manager.UserManager()),
            ],
        ),
    ]
