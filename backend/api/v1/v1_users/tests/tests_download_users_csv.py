import os
from django.test import TestCase
from django.core.management import call_command
from django.test.utils import override_settings
from partos_pat.settings import BASE_DIR
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.tests.mixins import ProfileTestHelperMixin


@override_settings(USE_TZ=False, TEST_ENV=True)
class DownloadUsersCSVTestCase(TestCase, ProfileTestHelperMixin):
    def setUp(self):
        password = "secret"
        self.user = SystemUser.objects.create_user(
            full_name="John Doe",
            email="john@test.com",
            gender=1,
            account_purpose=6,
            country="US",
            password=password,
        )

        admin_email = "admin@akvo.org"
        self.admin = SystemUser.objects.create_superuser(
            full_name="Super Admin",
            email=admin_email,
            gender=1,
            account_purpose=6,
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
        self.assertIn(
            "id,full_name,email,gender,country,account_purpose,admin",
            response.content.decode()
        )
        c_US = "United States of America"
        self.assertIn(
            f"{self.user.pk},John Doe,john@test.com,male,{c_US},Other,No",
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
