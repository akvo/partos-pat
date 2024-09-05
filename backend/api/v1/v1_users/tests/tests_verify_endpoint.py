from django.test import TestCase
from django.test.utils import override_settings
from api.v1.v1_users.models import SystemUser
from django.conf import settings


@override_settings(USE_TZ=False, WEBDOMAIN="http://example.com")
class VerificationTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="test@test.org",
            password="test1234",
            full_name="test",
            gender=1,
            country="ID",
            account_purpose=1,
        )

    def test_successfully_verified(self):
        req = self.client.get(
            f"/api/v1/verify?token={self.user.verification_code}",
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 302)

        # Assert that the redirect URL is correct
        expected_url = f"{settings.WEBDOMAIN}/en/login?verified=true"
        self.assertEqual(req["Location"], expected_url)

        current_user = SystemUser.objects.first()
        self.assertTrue(current_user.is_verified)

    def test_invalid_token(self):
        req = self.client.get(
            "/api/v1/verify?token=INVALID", content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(res, {"message": '“INVALID” is not a valid UUID.'})

    def test_user_is_verified(self):
        self.user.is_verified = True
        self.user.save()

        req = self.client.get(
            f"/api/v1/verify?token={self.user.verification_code}",
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 302)

        expected_url = f"{settings.WEBDOMAIN}/en/login"
        self.assertEqual(req["Location"], expected_url)
