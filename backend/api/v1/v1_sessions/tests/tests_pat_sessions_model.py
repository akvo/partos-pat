from django.test import TestCase
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_sessions.constants import SectorTypes
from api.v1.v1_sessions.models import SystemUser


class PATSessionModelTestCase(TestCase):
    def setUp(self):
        self.user = SystemUser.objects.create_user(
            email="test@test.org", password="Test1234", full_name="test"
        )
        self.pat_session = PATSession.objects.create_session(
            owner=self.user,
            name="TEST PAT Session #1",
            countries=["ID", "NL", "EN"],
            sector=SectorTypes.sector5,
            date="2024-09-12",
            context="This is an example of PAT Session"
        )

    def test_is_published_false_by_default(self):
        self.assertFalse(self.pat_session.is_published)

    def test_generated_join_code(self):
        self.assertTrue(self.pat_session.join_code)

    def test_closed_at(self):
        self.pat_session.set_closed()
        self.assertTrue(self.pat_session.is_published)
        self.assertIsNotNone(self.pat_session.closed_at)

    def test_closed_at_with_param(self):
        closed_at = "2024-09-17 06:58:20.879976+00"
        self.pat_session.set_closed(closed_at=closed_at)
        self.assertTrue(self.pat_session.is_published)
        self.assertEqual(self.pat_session.closed_at, closed_at)

    def test_soft_delete_session(self):
        self.pat_session.soft_delete()
        self.assertIsNotNone(self.pat_session.id)
        self.assertTrue(self.pat_session.deleted_at)

    def test_restore_deleted_session(self):
        self.pat_session.restore()
        self.assertIsNone(self.pat_session.deleted_at)

    def test_hard_delete_session(self):
        self.pat_session.delete(hard=True)
        total_sessions = PATSession.objects.count()
        self.assertEqual(total_sessions, 0)
