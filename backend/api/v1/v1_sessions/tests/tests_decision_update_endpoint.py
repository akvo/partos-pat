from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, Decision
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class DecisionUpdateEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
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

    def test_successfully_update_decision_agreement(self):
        pat_session = PATSession.objects.annotate(
            decision_count=Count("session_decision")
        ).filter(
            user=self.user,
            decision_count__gt=0,
            closed_at__isnull=True
        ).first()

        self.assertIsNotNone(pat_session)

        decisions = pat_session.session_decision.all()[:2]
        decision_inputs = []
        for index, decision in enumerate(decisions):
            decision_inputs.append({
                "id": decision.id,
                "agree": index % 2 == 0
            })
        payload = {
            "session_id": pat_session.id,
            "decisions": decision_inputs
        }
        req = self.client.put(
            "/api/v1/decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(len(res), len(decisions))
        ds1 = Decision.objects.filter(pk=res[0]["id"]).first()
        self.assertTrue(ds1.agree)

        if len(res) > 1:
            ds2 = Decision.objects.filter(pk=res[1]["id"]).first()
            self.assertFalse(ds2.agree)
        updated_pat_session = PATSession.objects.get(
            pk=pat_session.id
        )
        self.assertIsNotNone(updated_pat_session.updated_at)

    def test_successfully_update_decision_notes(self):
        pat_session = PATSession.objects.annotate(
            decision_count=Count("session_decision")
        ).filter(
            user=self.user,
            decision_count__gt=0,
            closed_at__isnull=True
        ).first()

        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()
        notes = "Set Slack as the main communication"
        decision_inputs = [{
            "id": decision.id,
            "notes": notes
        }]
        payload = {
            "session_id": pat_session.id,
            "decisions": decision_inputs
        }
        req = self.client.put(
            "/api/v1/decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(len(res), 1)
        self.assertEqual(
            list(res[0]),
            [
                "id",
                "session_id",
                "name",
                "notes",
                "agree",
            ],
        )
        ds1 = Decision.objects.filter(pk=res[0]["id"]).first()
        self.assertEqual(ds1.notes, notes)

    def test_successfully_update_decision_name(self):
        pat_session = PATSession.objects.annotate(
            decision_count=Count("session_decision")
        ).filter(
            user=self.user,
            decision_count__gt=0,
            closed_at__isnull=True
        ).first()

        self.assertIsNotNone(pat_session)

        decision = pat_session.session_decision.first()
        new_name = f"EDITED-{decision.name}"
        decision_inputs = [{
            "id": decision.id,
            "name": new_name
        }]
        payload = {
            "session_id": pat_session.id,
            "decisions": decision_inputs
        }
        req = self.client.put(
            "/api/v1/decisions/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(len(res), 1)
        self.assertEqual(
            list(res[0]),
            [
                "id",
                "session_id",
                "name",
                "notes",
                "agree",
            ],
        )
        ds1 = Decision.objects.filter(pk=res[0]["id"]).first()
        self.assertEqual(ds1.name, new_name)
