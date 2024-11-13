from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, ParticipantComment
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ParticipantCreateCommentEndpointTestCase(
    TestCase, ProfileTestHelperMixin
):
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

    def test_successfully_comment_created(self):
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

        self.assertIsNotNone(pat_session)

        payload = {
            "comment": "Ok! LGTM"
        }
        req = self.client.post(
            f"/api/v1/session/{pat_session.id}/comments",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 201)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id",
                "user_id",
                "fullname",
                "organization_name",
                "session_id",
                "comment"
            ]
        )
        total_comment = ParticipantComment.objects.filter(
            session=pat_session
        ).count()
        self.assertEqual(total_comment, 1)
