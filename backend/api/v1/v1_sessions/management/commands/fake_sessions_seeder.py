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
    items = []
    # Flags to track conditions
    has_P_true_C_false = False
    has_P_true_C_true = False
    for i in range(n):
        # Randomly set A to True or False
        A = fake.boolean()

        # Randomly set B but ensure
        # at least one A=True, B=False and one A=True, B=True
        if i == 2:  # On the last item, make sure conditions are met
            if not has_P_true_C_false:
                A = True
                B = False
            elif not has_P_true_C_true:
                A = True
                B = True
            else:
                B = fake.boolean()
        else:
            B = fake.boolean()
            # Update flags based on generated values
            if A and not B:
                has_P_true_C_false = True
            elif A and B:
                has_P_true_C_true = True
        if B and not A:
            A = True
        items.append({'published': A, 'closed': B})
    return items


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-r", "--repeat", nargs="?", const=3, default=3, type=int
        )
        parser.add_argument(
            "-t", "--test", nargs="?", const=False, default=False, type=bool
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
        users_count = SystemUser.objects.count()
        # minimum: 3 users
        # 1 owner 2 participants
        if users_count < 3:
            if not test:
                print("please run fake_users_seeder first")
            exit()
        status_items = get_random_published_and_closed_status(n=repeat)
        for r in range(repeat):
            sector = self.fake_sector()
            other_sector = None
            if sector == SectorTypes.sector_other:
                other_sector = fake.catch_phrase()
            owner = SystemUser.objects.order_by('?').first()
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
            org_total = fake.random_int(
                min=1, max=users_count-1
            )
            orgs = self.fake_organizations(
                pat_session=pat_session,
                total=org_total
            )
            if status_items[r]["published"]:
                pat_session.set_published()

                participants = []
                for p in user_participants:
                    p_org = random.choice(orgs)
                    participant = Participant.objects.create(
                        user=p,
                        session=pat_session,
                        organization=p_org,
                    )
                    participants.append(participant)

                decisions = self.fake_decisions(pat_session=pat_session)

                if status_items[r]["closed"]:
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
