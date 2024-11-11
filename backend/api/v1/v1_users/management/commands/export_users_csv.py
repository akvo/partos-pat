import os
import pandas as pd
from django.core.management import BaseCommand
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.serializers import ExportUserSerializer
from partos_pat.settings import STORAGE_PATH


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "-t", "--test", nargs="?", const=False, default=False, type=bool
        )

    def handle(self, *args, **options):
        test = options.get("test")
        filename = "users-export-test.csv" if test else "users-export.csv"
        file_path = f"{STORAGE_PATH}/{filename}"
        if os.path.exists(file_path):
            os.remove(file_path)
        users = SystemUser.objects.all()
        users = users[:2] if test else users
        serializer = ExportUserSerializer(
            instance=users,
            many=True
        )
        df = pd.DataFrame(serializer.data)
        df.to_csv(file_path, index=False)
