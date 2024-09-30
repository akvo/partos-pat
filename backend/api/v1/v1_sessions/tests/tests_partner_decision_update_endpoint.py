from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, ParticipantDecision
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class UpdatePartnerDecisionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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
            "--test",
            True,
            "--user",
            self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_successfully_update_score(self):
        pat_session = (
            PATSession.objects.annotate(
                decision_count=Count("session_decision"),
            )
            .filter(
                user=self.user,
                decision_count__gt=0,
                closed_at__isnull=True
            )
            .first()
        )

        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()
        organization = pat_session.session_organization.first()
        score = ParticipantDecision.objects.create(
            decision=decision,
            organization=organization,
            score=4
        )
        scores = [
            {
                "id": score.id,
                "score": 3,
                "desired": True,
                "organization_id": score.organization.id,
                "decision_id": score.decision.id
            }
        ]
        payload = {
            "session_id": pat_session.id,
            "scores": scores
        }
        req = self.client.put(
            "/api/v1/participant-decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res[0]),
            [
                "id", "organization_id", "decision_id", "score", "desired"
            ]
        )
        updated_data = ParticipantDecision.objects.get(pk=score.id)
        self.assertEqual(res[0]["score"], updated_data.score)
        self.assertTrue(updated_data.desired)
