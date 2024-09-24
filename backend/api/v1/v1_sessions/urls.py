from django.urls import re_path

from api.v1.v1_sessions.views import (
    PATSessionAddListView,
    organization_list,
    participant_join_session,
    create_session_decisions,
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
    re_path(
        r"^(?P<version>(v1))/participants/join",
        participant_join_session
    ),
    re_path(
        r"^(?P<version>(v1))/decisions",
        create_session_decisions
    ),
]
