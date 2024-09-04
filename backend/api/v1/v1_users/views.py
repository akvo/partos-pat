from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
)
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.conf import settings

from api.v1.v1_users.serializers import (
    RegisterSerializer,
    UserSerializer,
    VerifyTokenSerializer,
)
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import validate_serializers_message
from utils.default_serializers import DefaultResponseSerializer
from utils.email_helper import send_email, EmailTypes
from partos_pat.settings import WEBDOMAIN


@extend_schema(
    request=RegisterSerializer,
    responses={200: UserSerializer, 401: DefaultResponseSerializer},
    tags=["Auth"],
)
@api_view(["POST"])
def register(request, version):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"message": validate_serializers_message(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = serializer.save()

    if not settings.TEST_ENV:
        send_email(
            type=EmailTypes.user_register,
            context={
                "send_to": [user.email],
                "name": user.name,
                "verification_token": user.verification_token,
            },
        )

    user = UserSerializer(instance=user).data
    response = Response(
        data=user,
        status=status.HTTP_200_OK,
    )
    return response


@extend_schema(
    responses={200: DefaultResponseSerializer},
    tags=["Auth"],
    parameters=[
        OpenApiParameter(
            name="token",
            required=True,
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
        ),
    ],
)
@api_view(["GET"])
def verify_token(request, version):
    serializer = VerifyTokenSerializer(data=request.GET)
    if not serializer.is_valid():
        return Response(
            {"message": validate_serializers_message(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    token = serializer.validated_data.get("token")
    user = SystemUser.objects.get(verification_token=token)
    if user.is_verified:
        return HttpResponseRedirect(f"{WEBDOMAIN}/en/login")
    user.is_verified = True
    user.updated = timezone.now()
    user.save()
    return HttpResponseRedirect(f"{WEBDOMAIN}/en/login?verified=true")
