from django.test import TestCase
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


class UpdateProfileTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            country="EN",
            password=password,
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_update_my_profile(self):
        payload = {
            "full_name": "Jane Doe",
            "country": "ID",
        }
        req = self.client.put(
            "/api/v1/users/me",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id", "full_name", "email",
                "country", "is_superuser"
            ]
        )
        updated_user = SystemUser.objects.get(pk=self.user.id)
        self.assertEqual(res["full_name"], updated_user.full_name)
        self.assertEqual(res["country"], updated_user.country)
