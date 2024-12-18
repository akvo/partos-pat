from unittest.mock import patch
from django.utils import timezone
from django.test import TestCase
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_sessions.constants import SessionPurpose
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False, TEST_ENV=True)
class CreateSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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

    @patch('django.utils.timezone.now')
    def test_create_session_successfully(self, mock_timezone_now):
        mock_timezone_now.return_value = timezone.datetime(2024, 9, 13)
        payload = {
            "session_name": "Test session #11",
            "countries": ["ID", "NL"],
            "purpose": SessionPurpose.purpose4,
            "date": "2024-09-13",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                {"name": "Akvo", "acronym": "AKV"},
                {"name": "Partos", "acronym": "PTS"}
            ]
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id",
                "session_name",
                "join_code",
                "date",
                "is_published",
            ],
        )
        self.assertEqual(res["session_name"], payload["session_name"])
        pat_session = PATSession.objects.filter(
            pk=res["id"]
        ).first()
        self.assertIsNotNone(pat_session)

    def test_all_fields_required(self):
        payload = {
            "session_name": "",
            "countries": None,
            "purpose": None,
            "date": "",
            "context": "",
            "organizations": []
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        error_count = len(res["message"].split("|"))
        self.assertEqual(error_count, 5)

    @patch('django.utils.timezone.now')
    def test_invalid_date_session(self, mock_timezone_now):
        mock_timezone_now.return_value = timezone.datetime(2024, 9, 13)
        payload = {
            "session_name": "Test session #11",
            "countries": ["ID", "NL"],
            "purpose": SessionPurpose.purpose4,
            "date": "2022-09-13",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                {"name": "Akvo", "acronym": "AKV"},
                {"name": "Partos", "acronym": "PTS"}
            ]
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)
        res = req.json()
        self.assertEqual(res["message"], "The date must be today or later.")

    def test_invalid_purpose(self):
        payload = {
            "session_name": "Test session #11",
            "countries": ["ID", "NL"],
            "purpose": 211,
            "date": "2022-09-13",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                {"name": "Akvo", "acronym": "AKV"},
                {"name": "Partos", "acronym": "PTS"}
            ]
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)

    def test_invalid_countries(self):
        payload = {
            "session_name": "Test session #11",
            "countries": "ID",
            "purpose": SessionPurpose.purpose4,
            "date": "2022-09-13",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                {"name": "Akvo", "acronym": "AKV"},
                {"name": "Partos", "acronym": "PTS"}
            ]
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)

    def test_invalid_add_organizations(self):
        payload = {
            "session_name": "Test session #11",
            "countries": ["ID", "NL"],
            "purpose": SessionPurpose.purpose4,
            "date": "2022-09-13",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                "Akvo",
                "Partos"
            ]
        }
        req = self.client.post(
            "/api/v1/sessions",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)
