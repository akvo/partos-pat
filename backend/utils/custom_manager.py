from django.contrib.auth.base_user import BaseUserManager
from utils.soft_deletes_model import SoftDeletesManager
from uuid import uuid4
from readable_passcode import passcode_generator


class UserManager(BaseUserManager, SoftDeletesManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError("The given email must be set")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.verification_code = uuid4()
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class PATSessionManager(SoftDeletesManager):
    def create_session(
        self, owner, name, join_code=None, **extra_fields
    ):
        if not join_code:
            join_code = passcode_generator(word=4, number=4)
        pat_session = self.model(user=owner, **extra_fields)
        pat_session.session_name = name
        pat_session.join_code = join_code
        pat_session.save(using=self._db)
        return pat_session
