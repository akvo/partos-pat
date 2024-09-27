from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class DecisionListEndpointTestCase(TestCase, ProfileTestHelperMixin):
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
            "fake_sessions_seeder", "--test", True, "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_successfully_get_decisions_list(self):
        pat_session = PATSession.objects.annotate(
            decision_count=Count("session_decision")
        ).filter(
            user=self.user,
            decision_count__gt=0
        ).first()
        req = self.client.get(
            f"/api/v1/decisions?session_id={pat_session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
           list(res[0]),
           [
              "id",
              "name",
              "notes",
              "agree",
              "scores",
           ]
        )
        self.assertEqual(len(res), pat_session.session_decision.count())

    def test_successfully_get_decisions_list_with_scores(self):
        pat_session = (
            PATSession.objects.annotate(
                participant_score_count=Count(
                    "session_decision__decision_participant"
                ),
            )
            .filter(
                user=self.user,
                participant_score_count__gt=0,
                closed_at__isnull=True
            )
            .first()
        )
        req = self.client.get(
            f"/api/v1/decisions?session_id={pat_session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res[0]["scores"][0]),
            [
                "id",
                "acronym",
                "score"
            ]
        )
