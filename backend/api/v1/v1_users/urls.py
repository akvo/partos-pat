from django.urls import re_path

from api.v1.v1_users.views import (
    register,
)

urlpatterns = [
    re_path(r"^(?P<version>(v1))/register", register),
]
