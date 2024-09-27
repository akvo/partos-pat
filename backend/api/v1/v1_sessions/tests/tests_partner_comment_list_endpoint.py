from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, ParticipantComment
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class GetParticipantCommentListEndpointTestCase(
    TestCase, ProfileTestHelperMixin
):
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

    def test_successfully_get_all_comments(self):
        pat_session = (
            PATSession.objects
            .filter(
                user=self.user,
                closed_at__isnull=False
            )
            .first()
        )

        self.assertIsNotNone(pat_session)

        req = self.client.get(
            f"/api/v1/session/{pat_session.id}/comments",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res["data"][0]),
            ["id", "user_id", "session_id", "comment"]
        )
        total_comment = ParticipantComment.objects.filter(
            session=pat_session
        ).count()
        self.assertEqual(res["total"], total_comment)
