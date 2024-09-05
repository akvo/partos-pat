from django.test import TestCase
from api.v1.v1_users.models import SystemUser


class UserModelTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="test@test.org", password="Test1234", full_name="test"
        )

    def test_get_sign_pk(self):
        self.assertTrue(self.user.get_sign_pk)

    def test_soft_delete_user(self):
        self.user.soft_delete()
        self.assertIsNotNone(self.user.id)
        self.assertTrue(self.user.deleted_at)

    def test_restore_deleted_user(self):
        self.user.restore()
        self.assertIsNone(self.user.deleted_at)

    def test_hard_delete_user(self):
        self.user.delete(hard=True)
        total_users = SystemUser.objects.count()
        self.assertEqual(total_users, 0)

    def test_create_user_without_email(self):
        with self.assertRaises(ValueError) as context:
            SystemUser.objects.create_user(
                email=None,
                password="test1234",
                full_name="test",
            )
        self.assertEqual(
            str(context.exception),
            "The given email must be set"
        )

    def test_successfully_created_superuser(self):
        admin = SystemUser.objects.create_superuser(
            email="admin@mail.com",
            password="admin",
            full_name="admin"
        )
        self.assertIsNotNone(admin.id)
        total_admin = SystemUser.objects.filter(
            is_superuser=True,
            is_verified=True
        ).count()
        self.assertEqual(total_admin, 1)

    def test_create_superuser_without_is_superuser(self):
        with self.assertRaises(ValueError) as context:
            SystemUser.objects.create_superuser(
                email="admin@mail.com",
                password="admin",
                full_name="admin",
                is_superuser=False
            )
        self.assertEqual(
            str(context.exception),
            "Superuser must have is_superuser=True."
        )
