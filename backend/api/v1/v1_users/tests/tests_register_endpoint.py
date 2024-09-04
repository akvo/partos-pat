from django.test import TestCase
from django.test.utils import override_settings


@override_settings(USE_TZ=False, TEST_ENV=True)
class RegistrationTestCase(TestCase):
    def test_successfully_register(self):
        payload = {
            "name": "User 1",
            "gender": 1,
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
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res, {
            "name": "User 1",
            "gender": 1,
            "country": "ID",
            "account_purpose": 1,
            "email": "user1@example.com",
            "last_login": None,
        })
