from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core import signing
from django.db import models
from django.utils import timezone

from utils.soft_deletes_model import SoftDeletes
from utils.custom_manager import UserManager
from api.v1.v1_users.constants import (
    AccountPurpose, Gender
)


class SystemUser(AbstractBaseUser, PermissionsMixin, SoftDeletes):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(default=None, null=True)
    country = models.CharField(max_length=25)
    account_purpose = models.IntegerField(
        choices=AccountPurpose.FieldStr.items(),
        default=None,
        null=True
    )
    gender = models.IntegerField(
        choices=Gender.FieldStr.items(),
        default=None,
        null=True
    )
    is_verified = models.BooleanField(default=False)
    verification_code = models.UUIDField(default=None, null=True)
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "country", "account_purpose"]

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

    def get_full_name(self):
        return "{0} {1}".format(self.first_name, self.last_name)

    @property
    def name(self):
        return "{0} {1}".format(self.first_name, self.last_name)

    def get_sign_pk(self):
        return signing.dumps(self.pk)

    class Meta:
        db_table = "system_user"
