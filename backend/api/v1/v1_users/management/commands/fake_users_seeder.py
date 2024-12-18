import random
import json
from django.core.management import BaseCommand
from api.v1.v1_users.models import SystemUser

from faker import Faker

fake = Faker()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-r", "--repeat", nargs="?", const=3, default=3, type=int
        )
        parser.add_argument(
            "-t", "--test", nargs="?", const=False, default=False, type=bool
        )

    def handle(self, *args, **options):
        test = options.get("test")
        countries = ["ID", "NL", "UK", "AX", "AF"]
        if not test:
            countries_json = open("./i18n/countries.json", "r")
            countries_json = json.load(countries_json)
            countries = [
                c["alpha-2"]
                for c in countries_json
            ]
        repeat = options.get("repeat")

        for r in range(repeat):
            profile = fake.simple_profile()
            country = random.choice(countries)
            SystemUser.objects.create_user(
                email=profile["mail"],
                password="Test1234",
                full_name=profile["name"],
                date_joined=fake.date_this_year(),
                country=country,
                is_verified=fake.boolean()
            )
        if not test:
            print(f"{repeat} users have been created successfully.")
