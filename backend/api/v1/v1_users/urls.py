from django.urls import re_path

from api.v1.v1_users.views import (
    register,
    verify_token,
    login,
    get_profile,
    forgot_password,
)

urlpatterns = [
    re_path(r"^(?P<version>(v1))/register", register),
    re_path(r"^(?P<version>(v1))/verify", verify_token),
    re_path(r"^(?P<version>(v1))/users/login", login),
    re_path(r"^(?P<version>(v1))/users/me", get_profile),
    re_path(r"^(?P<version>(v1))/users/forgot-password", forgot_password),
]
