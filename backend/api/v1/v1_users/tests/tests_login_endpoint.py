from django.test import TestCase
from api.v1.v1_users.models import SystemUser


class LoginTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="john@test.com",
            gender=1,
            account_purpose=1,
            country="EN",
            password="Open1234",
        )

    def test_successfully_logged_in(self):
        payload = {
            "email": "john@test.com",
            "password": "Open1234"
        }
        req = self.client.post(
            "/api/v1/users/login",
            payload,
            content_type="application/json"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            ["user", "token", "expiration_time"]
        )
        self.assertEqual(
            list(res["user"]),
            [
                "id", "full_name", "email", "gender",
                "country", "account_purpose"
            ]
        )

    def test_all_inputs_are_required(self):
        payload = {
            "email": "",
            "password": ""
        }
        req = self.client.post(
            "/api/v1/users/login",
            payload,
            content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(
            res,
            {"message": "email may not be blank.|password may not be blank."}
        )

    def test_invalid_input_email(self):
        payload = {
            "email": "john",
            "password": "Open1234"
        }
        req = self.client.post(
            "/api/v1/users/login",
            payload,
            content_type="application/json"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(
            res,
            {"message": "Enter a valid email address."}
        )

    def test_invalid_login_credentials(self):
        payload = {
            "email": "jhon@test.com",
            "password": "OPen1234"
        }
        req = self.client.post(
            "/api/v1/users/login",
            payload,
            content_type="application/json"
        )
        self.assertEqual(req.status_code, 401)
        res = req.json()
        self.assertEqual(
            res,
            {"message": "Invalid login credentials"}
        )
