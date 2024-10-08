from django.test import TestCase
from django.core.management import call_command
from django.db.models import Q
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, Participant
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ListSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat", 2)
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
            "--repeat", 8,
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

    def test_successfully_get_my_open_sessions(self):
        req = self.client.get(
            "/api/v1/sessions",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)
        self.assertEqual(
            list(res["data"][0]),
            [
                "id",
                "session_name",
                "facilitator",
                "date",
                "context",
                "created_at",
                "updated_at",
                "closed_at",
            ]
        )

    def test_successfully_get_my_open_sessions_as_participant(self):
        pat_session = PATSession.objects.filter(
            is_published=False,
            closed_at__isnull=True,
        ).exclude(
            user=self.user,
            session_participant__user=self.user
        ).first()

        Participant.objects.create(
            user=self.user,
            session=pat_session,
            organization=pat_session.session_organization.first()
        )

        req = self.client.get(
            "/api/v1/sessions",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        res_ids = [
            d["id"]
            for d in res["data"]
        ]

        my_participant = self.user.user_participant.filter(
            session__closed_at__isnull=True
        ).order_by('?').first()
        my_pat_session = my_participant.session

        self.assertTrue(my_pat_session.id in res_ids)

    def test_successfully_get_my_closed_sessions(self):
        req = self.client.get(
            "/api/v1/sessions?published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)
        open_session = PATSession.objects.filter(
            (
                Q(user=self.user) |
                Q(session_participant__user=self.user)
            )
            & Q(is_published=False)
        ).first()

        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        self.assertTrue(open_session.id not in res_ids)

    def test_successfully_get_my_closed_sessions_w_custom_page_size(self):
        req = self.client.get(
            "/api/v1/sessions?published=true&page_size=1&page=2",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)

    def test_non_participant_cannot_see_the_session(self):
        email = "jane@test.com"
        password = "Test#123"

        SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            gender=1,
            account_purpose=1,
            country="EN",
            password=password,
        )

        new_user_token = self.get_auth_token(
            email=email,
            password=password
        )
        req = self.client.get(
            "/api/v1/sessions",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {new_user_token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["total"], 0)
