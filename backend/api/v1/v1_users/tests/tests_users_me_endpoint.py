from django.test import TestCase
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


class MyProfileTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            gender=1,
            country="EN",
            password=password,
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_get_my_account(self):
        req = self.client.get(
            "/api/v1/users/me",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id", "full_name", "email", "gender",
                "country", "is_superuser",
            ]
        )
        self.assertEqual(res["full_name"], "John Doe")

    def test_my_deleted_account(self):
        self.user.soft_delete()
        req = self.client.get(
            "/api/v1/users/me",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 401)
        res = req.json()
        self.assertEqual(
            res,
            {"detail": "User not found", "code": "user_not_found"}
        )
