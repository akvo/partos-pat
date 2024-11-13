from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from django.utils import timezone
from datetime import timedelta
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class UsersStatisticsTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat", 15)
        self.admin = SystemUser.objects.create_superuser(
            full_name="Super Admin",
            email="admin@akvo.org",
            gender=1,
            country="EN",
            password="Secret123!",
        )
        self.token = self.get_auth_token(
            email="admin@akvo.org",
            password="Secret123!",
        )

    def test_get_users_statistics(self):
        req = self.client.get(
            "/api/v1/admin/statistics/users",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["total_users"], 16)
        total_users_last_30_days = SystemUser.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=30)
        ).count()
        self.assertEqual(
            res["total_users_last_30_days"],
            total_users_last_30_days
        )
