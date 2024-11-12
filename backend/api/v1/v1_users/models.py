import uuid
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core import signing
from django.db import models
from django.utils import timezone
from datetime import timedelta

from utils.soft_deletes_model import SoftDeletes
from utils.custom_manager import UserManager
from api.v1.v1_users.constants import Gender


class SystemUser(AbstractBaseUser, PermissionsMixin, SoftDeletes):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(default=None, null=True)
    country = models.CharField(max_length=25)
    gender = models.IntegerField(
        choices=Gender.FieldStr.items(), default=None, null=True
    )
    is_verified = models.BooleanField(default=False)
    verification_code = models.UUIDField(default=None, null=True)
    reset_password_code = models.UUIDField(default=None, null=True, blank=True)
    reset_password_code_expiry = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "country"]

    def delete(self, using=None, keep_parents=False, hard: bool = False):
        if hard:
            return super().delete(using, keep_parents)
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])

    def soft_delete(self) -> None:
        self.delete(hard=False)

    def restore(self) -> None:
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])

    def get_sign_pk(self):
        return signing.dumps(self.pk)

    def generate_reset_password_code(self):
        self.reset_password_code = uuid.uuid4()
        self.reset_password_code_expiry = timezone.now() + timedelta(hours=1)
        self.save(
            update_fields=["reset_password_code", "reset_password_code_expiry"]
        )
        return self.reset_password_code

    def is_reset_code_valid(self):
        if self.reset_password_code and self.reset_password_code_expiry:
            return timezone.now() < self.reset_password_code_expiry
        return False

    class Meta:
        db_table = "system_user"
