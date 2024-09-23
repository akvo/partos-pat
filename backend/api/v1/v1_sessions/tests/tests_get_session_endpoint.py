from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class GetSessionEndpointTestCase(TestCase, ProfileTestHelperMixin):
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
            "--repeat", 2,
            "--user", self.user.id
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_get_session_by_id(self):
        pat_session = PATSession.objects.filter(
            user=self.user
        ).first()
        req = self.client.get(
            f"/api/v1/sessions?id={pat_session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(
            list(res),
            [
                "id",
                "session_name",
                "facilitator",
                "countries",
                "sector",
                "other_sector",
                "date",
                "context",
                "organizations",
                "join_code",
                "is_published",
                "summary",
                "created_at",
                "updated_at",
                "closed_at",
            ]
        )

    def test_get_session_by_invalid_id(self):
        req = self.client.get(
            "/api/v1/sessions?id=9999",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 403)

    def test_get_session_by_code(self):
        pat_session = PATSession.objects.filter(
            user=self.user,
            closed_at__isnull=True
        ).order_by("?").first()
        req = self.client.get(
            f"/api/v1/sessions?code={pat_session.join_code}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["join_code"], pat_session.join_code)

    def test_get_session_by_invalid_code(self):
        req = self.client.get(
            "/api/v1/sessions?code=9999-ABC",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 404)

    def test_get_session_by_non_participant(self):
        # create a new user
        email = "jane@test.com"
        password = "Test#123"
        new_user = SystemUser.objects.create_user(
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

        # get existing session
        pat_session = PATSession.objects.exclude(
            session_participant__user=new_user
        ).first()
        req = self.client.get(
            f"/api/v1/sessions?id={pat_session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {new_user_token}"
        )
        self.assertEqual(req.status_code, 403)

    def test_get_session_by_different_owner(self):
        # create a new user
        email = "jane@test.com"
        password = "Test#123"
        new_user = SystemUser.objects.create_user(
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
        call_command(
            "fake_sessions_seeder",
            "--test", True,
            "--repeat", 1,
            "--user", new_user.id
        )

        # get session from other user
        pat_session = PATSession.objects.filter(
            user=self.user
        ).order_by("?").first()

        # request by new user
        req = self.client.get(
            f"/api/v1/sessions?id={pat_session.id}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {new_user_token}"
        )
        self.assertEqual(req.status_code, 403)
