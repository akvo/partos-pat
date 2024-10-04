from django.urls import re_path

from api.v1.v1_users.views import (
    register,
    verify_token,
    login,
    forgot_password,
    verify_password_code,
    reset_password,
    ProfileView,
)

urlpatterns = [
    re_path(r"^(?P<version>(v1))/register", register),
    re_path(r"^(?P<version>(v1))/verify", verify_token),
    re_path(r"^(?P<version>(v1))/users/login", login),
    re_path(r"^(?P<version>(v1))/users/me", ProfileView.as_view()),
    re_path(r"^(?P<version>(v1))/users/forgot-password", forgot_password),
    re_path(
        r"^(?P<version>(v1))/users/verify-password-code", verify_password_code
    ),
    re_path(r"^(?P<version>(v1))/users/reset-password", reset_password),
]
