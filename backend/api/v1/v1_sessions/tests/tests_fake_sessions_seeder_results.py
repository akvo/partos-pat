from django.test import TestCase
from django.core.management import call_command
from django.db.models import Count
from api.v1.v1_sessions.models import PATSession


class FakeSessionSeederResultsTestCase(TestCase):
    def setUp(self):
        call_command("fake_users_seeder", "--test", True)
        call_command("fake_sessions_seeder", "--test", True, "--repeat", 5)

    def test_basic_requirements(self):
        pat_session = PATSession.objects.order_by('?').first()
        # should have a name
        self.assertIsNotNone(pat_session.session_name)
        # should have a purpose
        self.assertIsNotNone(pat_session.purpose)
        # should have a date planned
        self.assertIsNotNone(pat_session.date)
        # should have context
        self.assertIsNotNone(pat_session.context)
        # should have country at least 1
        total_countries = len(pat_session.countries)
        self.assertNotEqual(total_countries, 0)

        # should have organizations
        total_org = pat_session.session_organization.count()
        self.assertNotEqual(total_org, 0)

    def test_open_session_start(self):
        pat_session = PATSession.objects.filter(
            is_published=False
        )\
            .annotate(decision_count=Count("session_decision")) \
            .filter(
                decision_count=0
            ) \
            .order_by('?').first()
        total_participants = pat_session.session_participant.count()
        self.assertGreater(total_participants, 0)
        total_decisions = pat_session.session_decision.count()
        self.assertEqual(total_decisions, 0)

    def test_validate_joinable_session(self):
        cannot_join = PATSession.objects.filter(
            is_published=True,
            join_code__isnull=False,
            closed_at__isnull=False,
        ).order_by('?').first()
        self.assertIsNotNone(cannot_join)

        can_join = PATSession.objects.filter(
            is_published=False,
            join_code__isnull=False,
            closed_at__isnull=True,
        ).order_by('?').first()
        self.assertIsNotNone(can_join)

    def test_open_session_on_going(self):
        pat_session = PATSession.objects.filter(
            is_published=False,
        ) \
            .annotate(decision_count=Count("session_decision")) \
            .filter(
                decision_count__gt=0
            ) \
            .order_by('?').first()
        total_participants = pat_session.session_participant.count()
        self.assertNotEqual(total_participants, 0)
        total_decisions = pat_session.session_decision.count()
        self.assertNotEqual(total_decisions, 0)

        # session summary should empty
        self.assertIsNone(pat_session.summary)

    def test_published_and_closed_session(self):
        pat_session = PATSession.objects.filter(
            is_published=True,
            closed_at__isnull=False
        ).order_by('?').first()
        # session should have a summary
        self.assertIsNotNone(pat_session.summary)

        random_decision = pat_session.session_decision \
            .order_by('?').first()

        # some decision should have some scores from participant
        decision_scores_count = random_decision.decision_participant.count()
        self.assertNotEqual(decision_scores_count, 0)

        self.assertTrue(True)
