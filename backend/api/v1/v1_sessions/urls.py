from django.urls import re_path

from api.v1.v1_sessions.views import (
    PATSessionAddListView,
    organization_list
)

urlpatterns = [
    re_path(
        r"^(?P<version>(v1))/sessions",
        PATSessionAddListView.as_view()
    ),
    re_path(
        r"^(?P<version>(v1))/organizations",
        organization_list
    ),
]
