from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ParticipantListEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)
        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            gender=1,
            country="EN",
            password=password,
        )
        call_command(
            "fake_sessions_seeder", "--test", True, "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_get_participants_list(self):
        pat_session = PATSession.objects.filter(
            user=self.user,
            closed_at__isnull=False
        ).first()
        req = self.client.get(
            f"/api/v1/session/{pat_session.id}/participants",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
           list(res[0]),
           [
              "id",
              "full_name",
              "email",
              "role",
              "organization_name",
              "organization_acronym",
              "organization_id",
           ]
        )
        self.assertEqual(len(res), pat_session.session_participant.count())

    def test_get_participants_list_with_invalid_session_id(self):
        req = self.client.get(
            "/api/v1/session/9999999999999999999/participants",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res, [])
