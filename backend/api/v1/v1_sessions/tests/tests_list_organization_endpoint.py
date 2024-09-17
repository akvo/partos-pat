from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import Organization
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ListOrganizationEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat")
        call_command("fake_sessions_seeder", "--test", True)

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
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_get_organizations_list_with_pagination(self):
        req = self.client.get(
            "/api/v1/organizations",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(res["total"], 0)
        self.assertEqual(
            list(res),
            [
                "current",
                "total",
                "total_page",
                "data"
            ]
        )
        self.assertEqual(
            list(res["data"][0]),
            [
                "id",
                "name",
                "acronym"
            ]
        )

    def test_successfully_search_by_name(self):
        org = Organization.objects.order_by("?").first()
        search = org.organization_name[:3].lower()
        req = self.client.get(
            f"/api/v1/organizations?search={search}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["data"][0]["name"], org.organization_name)

    def test_successfully_search_by_acronym(self):
        org = Organization.objects.order_by("?").first()
        req = self.client.get(
            f"/api/v1/organizations?search={org.acronym.lower()}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertEqual(res["data"][0]["acronym"], org.acronym)
