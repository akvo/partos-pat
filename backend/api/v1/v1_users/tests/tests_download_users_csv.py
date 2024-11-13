import os
from unittest.mock import patch
from django.utils import timezone
from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from partos_pat.settings import BASE_DIR
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False, TEST_ENV=True)
class DownloadUsersCSVTestCase(TestCase, ProfileTestHelperMixin):
    @patch('django.utils.timezone.now')
    def setUp(self, mock_timezone_now):
        mock_timezone_now.return_value = timezone.datetime(2024, 11, 11)
        password = "secret"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email="john@test.com",
            country="US",
            password=password,
        )

        admin_email = "admin@akvo.org"
        self.admin = SystemUser.objects.create_superuser(
            full_name="Super Admin",
            email=admin_email,
            country="EN",
            password="secret",
        )
        self.token = self.get_auth_token(
            email=admin_email,
            password=password,
        )
        self.user_token = self.get_auth_token(
            email=self.user.email,
            password=password,
        )

        call_command("export_users_csv", "--test", True)

        self.file_path = os.path.join(
            BASE_DIR,
            "storage",
            "users-export-test.csv"
        )

    def tearDown(self):
        # Remove the temporary CSV file and directory after the test
        if os.path.exists(self.file_path):
            os.remove(self.file_path)

    def test_successfully_download_users_csv_by_admin(self):
        response = self.client.get(
            "/api/v1/admin/download/users",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        # Check that the response is successful
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv")

        # Check the content of the file
        columns = "id,date_joined,full_name,email,country,"
        columns += "admin,verified"
        self.assertIn(columns, response.content.decode())
        data = f"{self.user.pk},2024-11-11,John Doe"
        self.assertIn(
            data,
            response.content.decode()
        )

    def test_invalid_download_users_csv_by_user(self):
        response = self.client.get(
            "/api/v1/admin/download/users",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.user_token}",
        )
        # Check that the response is successful
        self.assertEqual(response.status_code, 403)

    def test_invalid_download_users_csv_without_auth(self):
        response = self.client.get(
            "/api/v1/admin/download/users",
            content_type="application/json",
        )
        # Check that the response is successful
        self.assertEqual(response.status_code, 401)
