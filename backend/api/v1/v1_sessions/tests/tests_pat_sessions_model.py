from django.test import TestCase
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_sessions.constants import SectorTypes


class PATSessionModelTestCase(TestCase):
    def setUp(self):
        self.pat_session = PATSession.objects.create(
            session_name="TEST PAT Session #1",
            countries="ID,NL,EN",
            sector=SectorTypes.sector5,
            date="2024-09-12",
            context="This is an example of PAT Session"
        )

    def test_get_sign_pk(self):
        self.assertTrue(self.pat_session.get_sign_pk)

    def test_soft_delete_user(self):
        self.pat_session.soft_delete()
        self.assertIsNotNone(self.pat_session.id)
        self.assertTrue(self.pat_session.deleted_at)

    def test_restore_deleted_user(self):
        self.pat_session.restore()
        self.assertIsNone(self.pat_session.deleted_at)

    def test_hard_delete_user(self):
        self.pat_session.delete(hard=True)
        total_users = PATSession.objects.count()
        self.assertEqual(total_users, 0)
