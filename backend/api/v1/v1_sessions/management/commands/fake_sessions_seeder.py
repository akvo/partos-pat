import random
from datetime import timedelta
from django.core.management import BaseCommand
from api.v1.v1_users.models import SystemUser
from api.v1.v1_sessions.models import (
    PATSession,
    Organization,
    Participant,
    Decision,
    ParticipantDecision,
)
from api.v1.v1_sessions.constants import SectorTypes
from utils.custom_helper import generate_acronym
from faker import Faker
from typing import List

fake = Faker()

MAX_ITEMS = 6


def get_random_published_and_closed_status(n: int) -> List:
    # Define the possible statuses
    statuses = [
        {"published": False, "has_decision": False},  # Initial
        {"published": False, "has_decision": True},   # On Going
        {"published": True, "has_decision": True}     # Closed
    ]

    # Ensure exactly one of each status
    result = statuses[:]

    # If more data is needed, fill the remaining with random choices
    while len(result) < n:
        result.append(random.choice(statuses))
    # Shuffle the result to randomize the order
    random.shuffle(result)
    return result


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-r", "--repeat", nargs="?", const=3, default=3, type=int
        )
        parser.add_argument(
            "-t", "--test", nargs="?", const=False, default=False, type=bool
        )
        parser.add_argument(
            "-u", "--user", nargs="?", const=False, default=None, type=int
        )

    def fake_sector(self):
        return random.choice(list(SectorTypes.FieldStr.keys()))

    def fake_organizations(
        self, pat_session: PATSession, total=0
    ) -> List[Organization]:
        orgs = []
        for t in range(total):
            name = fake.company()
            acronym = generate_acronym(name=name)
            org = Organization.objects.create(
                session=pat_session,
                organization_name=name,
                acronym=acronym
            )
            orgs.append(org)
        return orgs

    def fake_decisions(
        self,
        pat_session: PATSession
    ) -> List[Decision]:
        decisions = []
        total = fake.random_int(min=1, max=MAX_ITEMS)
        for d in range(total):
            decision = Decision.objects.create(
                session=pat_session,
                name=fake.sentence(),
                agree=fake.boolean(),
                notes=fake.paragraph()
            )
            decisions.append(decision)
        return decisions

    def handle(self, *args, **options):
        repeat = options.get("repeat")
        test = options.get("test")
        user = options.get("user")
        users_count = SystemUser.objects.count()
        status_items = get_random_published_and_closed_status(n=repeat)
        current_user = None
        if user:
            current_user = SystemUser.objects.get(pk=int(user))
        for r in range(repeat):
            sector = self.fake_sector()
            other_sector = None
            if sector == SectorTypes.sector_other:
                other_sector = fake.catch_phrase()
            owner = SystemUser.objects.order_by('?').first()
            if current_user:
                owner = current_user
            countries = ["NL", "ID", "KE"]
            user_participants = []
            if users_count >= 3:
                user_participants = SystemUser.objects.exclude(
                    pk=owner.pk
                ).all()[:MAX_ITEMS]
                countries = [
                    p.country
                    for p in user_participants
                ]

            pat_session = PATSession.objects.create_session(
                owner=owner,
                name=fake.sentence(),
                countries=countries,
                sector=sector,
                date=fake.date_this_month(before_today=False),
                context=fake.paragraph()
            )
            pat_session.other_sector = other_sector
            pat_session.save()

            participants = []
            orgs = []
            if users_count >= 3:
                org_total = fake.random_int(
                    min=1, max=users_count-1
                )
                orgs = self.fake_organizations(
                    pat_session=pat_session,
                    total=org_total
                )

            for p in user_participants:
                p_org = random.choice(orgs)
                participant = Participant.objects.create(
                    user=p,
                    session=pat_session,
                    organization=p_org,
                    role=fake.job(),
                )
                participants.append(participant)

            decisions = []
            if status_items[r]["has_decision"]:
                decisions = self.fake_decisions(pat_session=pat_session)

            if status_items[r]["published"]:
                spent_days = fake.random_int(min=0, max=7)
                score = fake.random_int(min=1, max=5)
                closed_at = pat_session.created_at + timedelta(
                    days=spent_days
                )

                pat_session.set_closed(closed_at=closed_at)
                summary = "|".join([
                    d.notes
                    for d in decisions
                ])
                pat_session.summary = summary
                pat_session.save()
                for participant in participants:
                    for decision in decisions:
                        ParticipantDecision.objects.create(
                            user=participant.user,
                            decision=decision,
                            score=score
                        )
        if not test:
            print(f"{repeat} PAT Sessions have been created successfully.")
