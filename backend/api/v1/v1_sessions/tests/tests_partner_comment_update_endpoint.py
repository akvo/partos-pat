from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession, ParticipantComment
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ParticipantUpdateCommentEndpointTestCase(
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
        call_command("fake_sessions_seeder", "--test", True)
        self.pat_session = PATSession.objects.filter(
            closed_at__isnull=True,
            session_participant__user=self.user
        ).first()
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(email=email, password=password)

    def test_successfully_comment_updated(self):
        self.assertIsNotNone(self.pat_session)

        # create a new comment
        comment = ParticipantComment.objects.create(
            session=self.pat_session,
            user=self.user,
            comment="Ok! LGTM"
        )
        payload = {
            "comment": "Ok! update LGTM to Good job!"
        }
        req = self.client.put(
            f"/api/v1/comments/{comment.id}",
            payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            ["id", "user_id", "fullname", "session_id", "comment"]
        )
        comment_updated = ParticipantComment.objects.get(pk=comment.id)
        self.assertEqual(res["comment"], comment_updated.comment)