from django.urls import re_path

from api.v1.v1_sessions.views import (
    PATSessionAddListView
)

urlpatterns = [
    re_path(
        r"^(?P<version>(v1))/sessions",
        PATSessionAddListView.as_view()
    ),
]
