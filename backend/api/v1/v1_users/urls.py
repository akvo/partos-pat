from django.urls import re_path

from api.v1.v1_users.views import (
    register,
    verify_token,
    login,
    forgot_password,
    verify_password_code,
    reset_password,
    ProfileView,
    ManageUsersViewSet,
    get_users_statistics,
    download_users_csv
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
    re_path(
        r"^(?P<version>(v1))/admin/users",
        ManageUsersViewSet.as_view({"get": "list"})
    ),
    re_path(
        r"^(?P<version>(v1))/admin/user/(?P<pk>[0-9]+)",
        ManageUsersViewSet.as_view({
            "get": "retrieve",
            "put": "update",
            "delete": "destroy"
        })
    ),
    re_path(
        r"^(?P<version>(v1))/admin/statistics/users",
        get_users_statistics
    ),
    re_path(
        r"^(?P<version>(v1))/admin/download/users",
        download_users_csv
    ),
]
