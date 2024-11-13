from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False)
class ListOrganizationEndpointTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True, "--repeat")
        call_command("fake_sessions_seeder", "--test", True)
        self.pat_session = PATSession.objects.filter(
            closed_at__isnull=True
        ).order_by("?").first()

        email = "john@test.com"
        password = "Open1234"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email=email,
            country="EN",
            password=password,
        )
        self.reset_db_sequence(SystemUser)
        self.token = self.get_auth_token(
            email=email,
            password=password
        )

    def test_successfully_get_organizations_list(self):
        req = self.client.get(
            f"/api/v1/session/{self.pat_session.id}/organizations",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertCountEqual(
            list(res[0]),
            [
                "id",
                "name",
                "acronym"
            ]
        )

    def test_successfully_search_by_name(self):
        participant = self.pat_session.session_participant.first()
        org = participant.organization
        search = org.organization_name[:3].lower()
        url = f"/api/v1/session/{self.pat_session.id}"
        req = self.client.get(
            f"{url}/organizations?search={search}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(len(res), 0)

    def test_successfully_search_by_acronym(self):
        participant = self.pat_session.session_participant.first()
        org = participant.organization
        url = f"/api/v1/session/{self.pat_session.id}"
        req = self.client.get(
            f"{url}/organizations?search={org.acronym.lower()}",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )
        self.assertEqual(req.status_code, 200)
        res = req.json()
        self.assertGreater(len(res), 0)
