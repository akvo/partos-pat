from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class CreateDecisionsEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
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
            "fake_sessions_seeder", "--test", True, "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_successfully_add_decisions(self):
        pat_session = PATSession.objects.annotate(
            decision_count=Count("session_decision")
        ).filter(
            user=self.user,
            decision_count=0
        ).first()

        self.assertIsNotNone(pat_session)

        payload = {
            "session_id": pat_session.id,
            "decisions": [
                "Decision on budget allocation",
                "Decision on resource distribution"
            ]
        }
        req = self.client.post(
            "/api/v1/decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertEqual(
           list(res[0]),
           [
              "id",
              "session_id",
              "name",
              "created_at",
           ]
        )
        self.assertEqual(len(res), 2)
