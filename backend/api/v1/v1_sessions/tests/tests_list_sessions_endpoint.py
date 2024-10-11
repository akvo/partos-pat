from django.test import TestCase
from django.core.management import call_command
from django.db.models import Q
from django.test.utils import override_settings
from django.utils import timezone
from api.v1.v1_sessions.models import PATSession, Participant
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ListSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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
                "is_owner",
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

    def test_deleted_closed_session_is_not_shown_as_participant(self):
        pat_session = PATSession.objects.filter(
            is_published=True,
            session_participant__user=self.user
        ).first()
        participant = None
        if not pat_session:
            pat_session = PATSession.objects.exclude(
                user=self.user,
                is_published=True,
                closed_at__isnull=False,
            ).first()
            participant = Participant.objects.create(
                user=self.user,
                session=pat_session,
                organization=pat_session.session_organization.first()
            )
        else:
            participant = Participant.objects.filter(
                user=self.user,
                session=pat_session,
            ).first()
        participant.session_deleted_at = timezone.now()
        participant.save()

        req = self.client.get(
            "/api/v1/sessions?published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        self.assertTrue(pat_session.id not in res_ids)

    def test_deleted_closed_session_is_not_shown_as_facilitator(self):
        pat_session = PATSession.objects.filter(
            is_published=True,
            closed_at__isnull=False,
            user=self.user,
        ).first()

        self.assertIsNotNone(pat_session)

        pat_session.soft_delete()

        req = self.client.get(
            "/api/v1/sessions?published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        self.assertTrue(pat_session.id not in res_ids)

    def test_filter_by_role(self):
        req = self.client.get(
            "/api/v1/sessions?role=1&published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        facilitated_count = PATSession.objects.filter(
            user=self.user,
            is_published=True,
            closed_at__isnull=False,
        ).count()
        self.assertEqual(res["total"], facilitated_count)
        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        for res_id in res_ids:
            self.assertTrue(PATSession.objects.filter(
                id=res_id,
                user=self.user
            ).exists())

    def test_filter_by_role_participated(self):
        req = self.client.get(
            "/api/v1/sessions?role=2&published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        participated_count = PATSession.objects.filter(
            session_participant__user=self.user,
            is_published=True,
            closed_at__isnull=False,
        ).count()
        self.assertEqual(res["total"], participated_count)
        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        for res_id in res_ids:
            self.assertTrue(PATSession.objects.filter(
                id=res_id,
                session_participant__user=self.user
            ).exists())

    def test_filter_by_search(self):
        pat_session = PATSession.objects.filter(
            is_published=True,
        ).first()
        keyword = pat_session.session_name[:3]
        req = self.client.get(
            f"/api/v1/sessions?search={keyword}&published=true",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)
        res_ids = [
            d["id"]
            for d in res["data"]
        ]
        self.assertTrue(pat_session.id in res_ids)
