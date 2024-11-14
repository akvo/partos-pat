from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ManageUsersTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat", 2)

        password = "secret"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email="john@test.com",
            country="EN",
            password=password,
        )

        admin_email = "admin@akvo.org"
        self.admin = SystemUser.objects.create_superuser(
            full_name="Super Admin",
            email=admin_email,
            country="EN",
            password="secret",
        )
        self.token = self.get_auth_token(
            email=admin_email,
            password=password,
        )

    def test_successfully_get_all_users(self):
        req = self.client.get(
            "/api/v1/admin/users",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res["data"][0]),
            [
                "id",
                "full_name",
                "email",
                "country",
                "is_superuser",
                "is_verified",
            ],
        )

    def test_successfully_get_users_by_name(self):
        user = SystemUser.objects.order_by("?").first()
        req = self.client.get(
            f"/api/v1/admin/users?name={user.full_name[:4]}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)

    def test_successfully_get_user_details(self):
        user = SystemUser.objects.order_by("?").first()
        req = self.client.get(
            f"/api/v1/admin/user/{user.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["email"], user.email)

    def test_successfully_update_regular_user_to_admin_role(self):
        user = SystemUser.objects.filter(
            is_superuser=False
        ).order_by("?").first()
        req = self.client.put(
            f"/api/v1/admin/user/{user.id}",
            {
                "is_superuser": True
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        updated_user = SystemUser.objects.get(pk=user.id)
        self.assertEqual(res["is_superuser"], updated_user.is_superuser)

    def test_successfully_delete_user(self):
        user = SystemUser.objects.filter(
            is_superuser=False
        ).order_by("?").first()
        req = self.client.delete(
            f"/api/v1/admin/user/{user.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        deleted_user = SystemUser.objects.filter(pk=user.id).first()
        self.assertIsNone(deleted_user)

    def test_invalid_get_users_by_regular_users(self):
        regular_token = self.get_auth_token(
            email="john@test.com",
            password="secret",
        )
        req = self.client.get(
            "/api/v1/admin/users",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {regular_token}",
        )
        self.assertEqual(req.status_code, 403)

    def test_invalid_update_user_by_regular_users(self):
        regular_token = self.get_auth_token(
            email="john@test.com",
            password="secret",
        )
        user = SystemUser.objects.filter(
            is_superuser=False
        ).order_by("?").first()
        req = self.client.put(
            f"/api/v1/admin/user/{user.id}",
            {
                "is_superuser": True
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {regular_token}",
        )
        self.assertEqual(req.status_code, 403)

    def test_invalid_delete_user_by_regular_users(self):
        regular_token = self.get_auth_token(
            email="john@test.com",
            password="secret",
        )
        user = SystemUser.objects.filter(
            is_superuser=False
        ).order_by("?").first()
        req = self.client.delete(
            f"/api/v1/admin/user/{user.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {regular_token}",
        )
        self.assertEqual(req.status_code, 403)

    def test_invalid_self_delete_user(self):
        req = self.client.delete(
            f"/api/v1/admin/user/{self.admin.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 403)

    def test_invalid_get_user_details_by_wrong_id(self):
        req = self.client.get(
            "/api/v1/admin/user/999",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 404)
