from django.urls import re_path

from api.v1.v1_sessions.views import (
    PATSessionAddListView,
    BulkDecisionView,
    BulkParticipantDecisionView,
    ParticipantCommentViewSet,
    organization_list,
    participant_join_session,
    delete_decision,
    participant_list,
    total_session_completed,
    total_session_per_month,
    total_session_per_last_3_years,
    get_sessions_statistics,
)

urlpatterns = [
    re_path(
        r"^(?P<version>(v1))/sessions",
        PATSessionAddListView.as_view()
    ),
    re_path(
        r"^(?P<version>(v1))/session/(?P<session_id>[0-9]+)/organizations",
        organization_list
    ),
    re_path(
        r"^(?P<version>(v1))/participants/join",
        participant_join_session
    ),
    re_path(
        r"^(?P<version>(v1))/decisions",
        BulkDecisionView.as_view()
    ),
    re_path(
        r"^(?P<version>(v1))/decision/(?P<decision_id>[0-9]+)",
        delete_decision
    ),
    re_path(
        r"^(?P<version>(v1))/participant-decisions",
        BulkParticipantDecisionView.as_view()
    ),
    re_path(
        r"^(?P<version>(v1))/session/(?P<session_id>[0-9]+)/comments",
        ParticipantCommentViewSet.as_view({"get": "list", "post": "create"})
    ),
    re_path(
        r"^(?P<version>(v1))/comments/(?P<pk>[0-9]+)",
        ParticipantCommentViewSet.as_view({"put": "update"})
    ),
    re_path(
        r"^(?P<version>(v1))/session/(?P<session_id>[0-9]+)/participants",
        participant_list
    ),
    re_path(
        r"^(?P<version>(v1))/admin/sessions/completed",
        total_session_completed
    ),
    re_path(
        r"^(?P<version>(v1))/admin/sessions/per-month",
        total_session_per_month
    ),
    re_path(
        r"^(?P<version>(v1))/admin/sessions/per-last-3-years",
        total_session_per_last_3_years
    ),
    re_path(
        r"^(?P<version>(v1))/admin/statistics/sessions",
        get_sessions_statistics
    ),
]
