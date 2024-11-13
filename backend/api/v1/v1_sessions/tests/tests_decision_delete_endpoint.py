from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class DeleteDecisionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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
            "fake_sessions_seeder", "--test", True, "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_successfully_deleted_decision(self):
        pat_session = (
            PATSession.objects.annotate(
                decision_count=Count("session_decision")
            )
            .filter(user=self.user, decision_count__gt=0)
            .first()
        )
        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()

        req = self.client.delete(
            f"/api/v1/decision/{decision.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id",
                "session_id",
                "name",
                "notes",
                "agree",
            ],
        )

    def test_failed_to_delete_decision_by_non_owner(self):
        pat_session = (
            PATSession.objects.annotate(
                decision_count=Count("session_decision")
            )
            .filter(user=self.user, decision_count__gt=0)
            .first()
        )
        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()
        self.assertIsNotNone(decision)

        non_owner = SystemUser.objects.exclude(pk=self.user.id).first()
        self.assertIsNotNone(non_owner)

        non_owner_token = self.get_auth_token(
            email=non_owner.email, password="Test1234"
        )

        req = self.client.delete(
            f"/api/v1/decision/{decision.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {non_owner_token}",
        )
        self.assertEqual(req.status_code, 403)
