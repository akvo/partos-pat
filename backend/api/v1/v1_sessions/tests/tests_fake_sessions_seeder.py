from django.test import TestCase
from django.core.management import call_command
from api.v1.v1_users.models import SystemUser
from api.v1.v1_sessions.models import PATSession


class FakeSessionSeederTestCase(TestCase):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)

    def test_default_command(self):
        call_command("fake_sessions_seeder", "--test", True)
        total = PATSession.objects.count()
        self.assertEqual(total, 4)

    def test_certain_number(self):
        call_command("fake_sessions_seeder", "--test", True, "--repeat", 1)
        total = PATSession.objects.count()
        self.assertEqual(total, 1)

    def test_certain_number_zero(self):
        call_command("fake_sessions_seeder", "--test", True, "--repeat", 0)
        total = PATSession.objects.count()
        self.assertEqual(total, 0)

    def test_with_certain_user(self):
        user = SystemUser.objects.create_user(
            full_name="John Doe",
            country="US",
            account_purpose=3,
            email="john@test.com",
            password="Open1234"
        )
        call_command(
            "fake_sessions_seeder",
            "--test", True,
            "--repeat", 2,
            "--user", user.id
        )
        user_sessions = user.user_owner_session.count()
        self.assertEqual(user_sessions, 2)
