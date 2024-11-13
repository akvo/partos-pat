import random
from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class CreatePartnerDecisionEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)
        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
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

    def test_successfully_add_score(self):
        pat_session = (
            PATSession.objects.annotate(
                decision_count=Count("session_decision"),
                organization_count=Count("session_organization")
            )
            .filter(
                user=self.user,
                decision_count__gt=0,
                organization_count__gt=0,
                closed_at__isnull=True
            )
            .first()
        )

        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()
        scores = [
            {
                "organization_id": org.id,
                "decision_id": decision.id,
                "score": random.choice([0, 1, 2, 3, 4])
            }
            for org in pat_session.session_organization.all()
        ]
        payload = {
            "session_id": pat_session.id,
            "scores": scores
        }
        req = self.client.post(
            "/api/v1/participant-decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertEqual(
            list(res[0]),
            [
                "id", "organization_id", "decision_id", "score", "desired"
            ]
        )
