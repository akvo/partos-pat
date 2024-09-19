from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("api/", include("api.v1.v1_init.urls"), name="v1_init"),
    path("api/", include("api.v1.v1_users.urls"), name="v1_users"),
    path("api/", include("api.v1.v1_sessions.urls"), name="v1_sessions"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
