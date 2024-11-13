from django.test import TestCase
from django.test.utils import override_settings
from django.core.management import call_command
from api.v1.v1_users.models import SystemUser


@override_settings(USE_TZ=False, TEST_ENV=True)
class RegistrationTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="john@test.com",
            country="EN",
            password="secret",
        )

    def test_successfully_register_with_fullname(self):
        payload = {
            "full_name": "Jane Doe",
            "country": "ID",
            "email": "user1@example.com",
            "password": "Test#123",
            "confirm_password": "Test#123",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertCountEqual(
            list(res),
            [
                "id", "full_name", "email",
                "country", "is_superuser",
            ],
        )
        self.assertEqual(res["full_name"], "Jane Doe")
        self.assertEqual(res["email"], "user1@example.com")

    def test_invalid_email(self):
        payload = {
            "full_name": "User 1",
            "country": "ID",
            "email": "user1",
            "password": "Test#123",
            "confirm_password": "Test#123",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(res, {"message": "Enter a valid email address."})

    def test_confirm_password_not_match(self):
        payload = {
            "full_name": "User 1",
            "country": "ID",
            "email": "user1@example.com",
            "password": "Open1234",
            "confirm_password": "Test",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(
            res,
            {"message": "Confirm password and password are not same"}
        )

    def test_email_exists(self):
        payload = {
            "full_name": "Joni",
            "country": "ID",
            "email": self.user.email,
            "password": "Test#123",
            "confirm_password": "Test#123",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(
            res,
            {"message": ("A user with this email already exists.")},
        )

    def test_password_not_match_criteria(self):
        payload = {
            "full_name": "User 1",
            "country": "ID",
            "email": "user1@example.com",
            "password": "secret",
            "confirm_password": "secret",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(res, {"message": "False Password Criteria"})

    def test_agreement_is_false(self):
        payload = {
            "full_name": "User 1",
            "country": "ID",
            "email": "user1@example.com",
            "password": "Open1234",
            "confirm_password": "Open1234",
            "agreement": False,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(res, {"message": "checkAgreementRequired"})

    def test_successfully_register_with_delete_account(self):
        call_command("fake_users_seeder", "--test", True, "--repeat", 2)
        deleted_user = SystemUser.objects.order_by("?").first()
        deleted_user.is_verified = True
        deleted_user.save()
        deleted_user.soft_delete()

        payload = {
            "full_name": "User 1",
            "country": "ID",
            "email": deleted_user.email,
            "password": "Open1234",
            "confirm_password": "Open1234",
            "agreement": True,
        }

        req = self.client.post(
            "/api/v1/register", payload, content_type="application/json"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertEqual(res["email"], deleted_user.email)

        updated_user = SystemUser.objects.get(pk=deleted_user.id)

        self.assertNotEqual(updated_user.full_name, deleted_user.full_name)
        self.assertIsNone(updated_user.deleted_at)
        self.assertTrue(updated_user.is_verified)
