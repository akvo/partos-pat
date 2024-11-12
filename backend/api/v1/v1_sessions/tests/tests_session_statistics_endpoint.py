from datetime import timedelta
from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count, DateField
from django.db.models.functions import TruncMonth
from django.test.utils import override_settings
from django.utils import timezone
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin
from api.v1.v1_sessions.constants import SectorTypes


@override_settings(USE_TZ=False)
class SessionStatisticsEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat", 15)
        self.admin = SystemUser.objects.create_superuser(
            full_name="Super Admin",
            email="admin@akvo.org",
            gender=1,
            account_purpose=2,
            country="EN",
            password="Secret123!",
        )
        self.token = self.get_auth_token(
            email="admin@akvo.org",
            password="Secret123!",
        )
        call_command("fake_sessions_seeder", "--test", True, "--repeat", 15)

    def test_get_total_session_completed(self):
        req = self.client.get(
            "/api/v1/admin/sessions/completed",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        total_completed = PATSession.objects.filter(
            closed_at__isnull=False
        ).count()
        self.assertEqual(res["total_completed"], total_completed)
        total_completed_last_30_days = PATSession.objects.filter(
            closed_at__isnull=False,
            closed_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        self.assertEqual(
            res["total_completed_last_30_days"],
            total_completed_last_30_days
        )

    def test_get_total_session_per_month(self):
        req = self.client.get(
            "/api/v1/admin/sessions/per-month",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        total_sessions_per_month = PATSession.objects.annotate(
            month=TruncMonth("created_at", output_field=DateField())
        ).values("month").annotate(total_sessions=Count("id"))
        sessions_per_month = []
        for session in total_sessions_per_month:
            sessions_per_month.append({
                "month": session["month"].strftime("%Y-%m-%d"),
                "total_sessions": session["total_sessions"]
            })
        self.assertEqual(len(res), len(sessions_per_month))

    def test_get_total_session_per_last_3_years(self):
        req = self.client.get(
            "/api/v1/admin/sessions/per-last-3-years",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(len(res), 3)
        self.assertEqual(len(res[0]["total_sessions"]), 12)

    def test_get_total_session_per_category(self):
        req = self.client.get(
            "/api/v1/admin/statistics/sessions",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(list(res), [
            "total_sessions",
            "total_sessions_last_30_days",
            "total_sessions_per_category"
        ])
        categories = [
            value for name, value in vars(SectorTypes).items()
            if (
                not name.startswith('__') and
                not callable(value) and
                name != "FieldStr"
            )
        ]
        self.assertEqual(
            len(res["total_sessions_per_category"]),
            len(categories)
        )
