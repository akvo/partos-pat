from django.test import TestCase
from django.core.management import call_command
from api.v1.v1_sessions.models import PATSession


class FakeSessionSeederTestCase(TestCase):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)

    def test_default_command(self):
        call_command("fake_sessions_seeder", "--test", True)
        total = PATSession.objects.count()
        self.assertEqual(total, 3)

    def test_certain_number(self):
        call_command("fake_sessions_seeder", "--test", True, "--repeat", 1)
        total = PATSession.objects.count()
        self.assertEqual(total, 1)
