from django.test import TestCase
from django.test.utils import override_settings
from api.v1.v1_users.models import SystemUser
from django.utils import timezone


@override_settings(USE_TZ=False, TEST_ENV=True)
class ForgotPasswordTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="john@test.com",
            gender=1,
            account_purpose=1,
            country="EN",
            password="secret",
        )

    def test_successfully_forgot_password(self):
        payload = {"email": self.user.email}
        req = self.client.post(
            "/api/v1/users/forgot-password",
            payload,
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res, {"message": "OK"})

    def test_email_not_found(self):
        payload = {"email": "random@test.com"}
        req = self.client.post(
            "/api/v1/users/forgot-password",
            payload,
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        # success even the email is not found
        self.assertEqual(res, {"message": "OK"})

    def test_verify_password_code(self):
        self.assertFalse(self.user.reset_password_code)
        self.assertFalse(self.user.reset_password_code_expiry)
        self.user.generate_reset_password_code()
        self.assertTrue(self.user.reset_password_code)
        self.assertTrue(self.user.reset_password_code_expiry > timezone.now())
        token = self.user.reset_password_code
        req = self.client.get(
            f"/api/v1/users/verify-password-code?token={token}",
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res, {"message": "OK"})

    def test_verify_password_code_invalid_token(self):
        payload = {"token": "invalid-token"}
        req = self.client.get(
            "/api/v1/users/verify-password-code",
            payload,
            content_type="application/json",
        )
        self.assertEqual(req.status_code, 400)
