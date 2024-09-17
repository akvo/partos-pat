from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class EditSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)
        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            gender=1,
            account_purpose=1,
            country="EN",
            password=password,
        )
        call_command(
            "fake_sessions_seeder",
            "--test", True,
            "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_update_n_published(self):
        payload = {
            "summary": "Lorem ipsum dolor sit amet",
        }
        pat_session = PATSession.objects.filter(
            user=self.user
        ).annotate(
            participant_decision_count=Count(
                "session_decision__decision_participant"
            )
        ).filter(
            participant_decision_count__gt=0
        ).first()
        req = self.client.put(
            f"/api/v1/sessions?id={pat_session.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["summary"], "Lorem ipsum dolor sit amet")
        self.assertTrue(res["is_published"])
        self.assertIsNotNone(res["closed_at"])

    def test_invalid_update_by_different_owner(self):
        email = "jane@test.com"
        password = "Test#123"

        SystemUser.objects.create_user(
            full_name="Jane Doe",
            email=email,
            gender=2,
            account_purpose=2,
            country="EN",
            password=password,
        )

        new_user_token = self.get_auth_token(
            email=email,
            password=password
        )
        payload = {
            "summary": "Lorem ipsum dolor sit amet",
        }
        pat_session = PATSession.objects.filter(
            user=self.user
        ).annotate(
            decision_count=Count("session_decision")
        ).filter(
            decision_count__gt=0
        ).first()
        req = self.client.put(
            f"/api/v1/sessions?id={pat_session.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {new_user_token}"
        )
        self.assertEqual(req.status_code, 403)

    def test_session_not_publish_when_decision_empty(self):
        payload = {
            "summary": "Lorem ipsum dolor sit amet",
        }
        pat_session = PATSession.objects.filter(
            user=self.user
        ).annotate(
            decision_count=Count("session_decision")
        ).filter(
            decision_count=0
        ).first()
        req = self.client.put(
            f"/api/v1/sessions?id={pat_session.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["summary"], "Lorem ipsum dolor sit amet")
        self.assertFalse(res["is_published"])
        self.assertIsNone(res["closed_at"])