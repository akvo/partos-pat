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

    def test_successfully_update_notes_n_summary(self):
        payload = {
            "summary": "Lorem ipsum dolor sit amet",
            "notes": "Well done",
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
        self.assertEqual(res["notes"], "Well done")

        updated_pat_session = PATSession.objects.get(
            pk=pat_session.id
        )
        self.assertIsNotNone(updated_pat_session.updated_at)

    def test_successfully_update_active_session(self):
        pat_session = PATSession.objects.filter(
            user=self.user,
            closed_at__isnull=True
        ).first()
        orgs = []
        for org in pat_session.session_organization.all():
            orgs.append({
                "id": org.id,
                "name": org.organization_name,
                "acronym": org.acronym,
            })
        payload = {
            "session_name": f"EDITED-{pat_session.session_name}",
            "countries": ["ID", "NL", "UK"],
            "sector": pat_session.sector,
            "date": "2024-10-29",
            "context": "Lorem ipsum dolor amet",
            "organizations": [
                *orgs,
                {"name": "New Organization", "acronym": "NEWOO"}
            ]
        }
        req = self.client.put(
            f"/api/v1/sessions?id={pat_session.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()

        updated_session = PATSession.objects.filter(pk=pat_session.id).first()
        self.assertEqual(res["session_name"], updated_session.session_name)
        self.assertEqual(
            updated_session.session_organization.count(),
            len(orgs) + 1
        )

    def test_successfully_session_is_published(self):
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
        payload = {
            "is_published": True,
            "context": f"EDITED-{pat_session.context}"
        }
        req = self.client.put(
            f"/api/v1/sessions?id={pat_session.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertTrue(res["is_published"])

        updated = PATSession.objects.get(pk=pat_session.id)
        self.assertIsNotNone(updated.closed_at)
        self.assertEqual(res["context"], updated.context)

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
