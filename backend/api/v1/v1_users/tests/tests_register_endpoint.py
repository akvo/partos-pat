from django.test import TestCase
from django.test.utils import override_settings
from api.v1.v1_users.models import SystemUser


@override_settings(USE_TZ=False, TEST_ENV=True)
class RegistrationTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="john@test.com",
            gender=1,
            account_purpose=1,
            country="EN",
            password="secret",
        )

    def test_successfully_register_with_fullname(self):
        payload = {
            "full_name": "Jane Doe",
            "gender": 2,
            "country": "ID",
            "account_purpose": 1,
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
        self.assertEqual(
            list(res),
            [
                "id", "full_name", "email", "gender",
                "country", "account_purpose", "is_superuser",
            ],
        )
        self.assertEqual(res["full_name"], "Jane Doe")
        self.assertEqual(res["email"], "user1@example.com")

    def test_invalid_email(self):
        payload = {
            "full_name": "User 1",
            "gender": 1,
            "country": "ID",
            "account_purpose": 1,
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

    def test_invalid_optiions(self):
        payload = {
            "full_name": "User 1",
            "gender": 12,
            "country": "ID",
            "account_purpose": 111,
            "email": "user1@example.com",
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
            {
                "message": (
                    '"12" is not a valid choice in gender.|'
                    '"111" is not a valid choice in account_purpose.'
                )
            },
        )

    def test_confirm_password_not_match(self):
        payload = {
            "full_name": "User 1",
            "gender": 1,
            "country": "ID",
            "account_purpose": 1,
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
            "gender": 1,
            "country": "ID",
            "account_purpose": 3,
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
            "gender": 1,
            "country": "ID",
            "account_purpose": 1,
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
            "gender": 1,
            "country": "ID",
            "account_purpose": 1,
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
