from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, Participant
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class DeleteSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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

    def test_successfully_delete_session_by_facilitator(self):
        session = PATSession.objects.filter(user=self.user).first()
        req = self.client.delete(
            f"/api/v1/sessions?id={session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        self.assertEqual(PATSession.objects.filter(id=session.id).count(), 0)

    def test_successfully_delete_session_by_participant(self):
        session = PATSession.objects.filter(user=self.user).first()
        participant = Participant.objects.filter(session=session).first()
        participant_token = self.get_auth_token(
            email=participant.user.email,
            password="Test1234"
        )
        req = self.client.delete(
            f"/api/v1/sessions?id={session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {participant_token}"
        )
        self.assertEqual(req.status_code, 200)
        self.assertEqual(PATSession.objects.filter(id=session.id).count(), 1)
        archived_participant = Participant.objects.filter(
            session=session,
            session_deleted_at__isnull=False
        ).first()
        self.assertIsNotNone(archived_participant)
