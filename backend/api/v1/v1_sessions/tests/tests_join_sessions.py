from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class JoinSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat")
        call_command(
            "fake_sessions_seeder", "--test", True
        )

        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            country="EN",
            password=password,
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_join_session(self):
        pat_session = PATSession.objects.filter(
            closed_at__isnull=True
        ).exclude(
            user=self.user
        ).order_by('?').first()

        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": pat_session.id,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)
        is_joined = pat_session.session_participant.filter(
            user=self.user
        )
        self.assertTrue(is_joined)

    def test_invalid_join_code(self):
        pat_session = PATSession.objects.exclude(
            user=self.user
        ).order_by('?').first()

        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": 999,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)

    def test_rejoining_existing_participated_session(self):
        # first attempt
        pat_session = PATSession.objects.filter(
            closed_at__isnull=True
        ).exclude(
            user=self.user
        ).order_by('?').first()

        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": pat_session.id,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join/",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)

        # re-attempt
        pat_session = PATSession.objects.filter(
            session_participant__user=self.user
        ).order_by('?').first()
        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": pat_session.id,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)

    def test_invalid_join_by_owner(self):
        call_command(
            "fake_sessions_seeder",
            "--test", True,
            "--repeat", 1,
            "--user", self.user.id
        )
        pat_session = PATSession.objects.filter(
            user=self.user
        ).order_by('?').first()
        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": pat_session.id,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)

    def test_invalid_join_closed_session(self):
        # find closed session
        pat_session = PATSession.objects.filter(
            closed_at__isnull=False
        ).order_by('?').first()
        org = pat_session.session_organization.order_by("?").first()
        payload = {
            "role": "IT",
            "session_id": pat_session.id,
            "organization_id": org.id
        }
        req = self.client.post(
            "/api/v1/participants/join",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 400)
