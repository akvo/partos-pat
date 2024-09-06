from datetime import datetime
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from api.v1.v1_users.serializers import (
    RegisterSerializer,
    UserSerializer,
    VerifyTokenSerializer,
    LoginSerializer,
)
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import validate_serializers_message
from utils.default_serializers import DefaultResponseSerializer
from utils.email_helper import send_email, EmailTypes


@extend_schema(
    request=RegisterSerializer,
    responses={201: UserSerializer, 401: DefaultResponseSerializer},
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
                "name": user.full_name,
                "verification_code": user.verification_code,
            },
        )

    user = UserSerializer(instance=user).data
    response = Response(
        data=user,
        status=status.HTTP_201_CREATED,
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
    user = SystemUser.objects.get(verification_code=token)
    if user.is_verified:
        return HttpResponseRedirect(f"{settings.WEBDOMAIN}/en/login")
    user.is_verified = True
    user.updated = timezone.now()
    user.save()
    return HttpResponseRedirect(f"{settings.WEBDOMAIN}/en/login?verified=true")


@extend_schema(
    request=LoginSerializer,
    responses={200: UserSerializer, 401: DefaultResponseSerializer},
    tags=["Auth"],
)
@api_view(["POST"])
def login(request, version):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {
                "message": validate_serializers_message(serializer.errors)
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        email=serializer.validated_data["email"],
        password=serializer.validated_data["password"],
    )

    if user:
        user.last_login = timezone.now()
        user.save()
        refresh = RefreshToken.for_user(user)
        # Get the expiration time of the new token
        expiration_time = datetime.fromtimestamp(
            refresh.access_token["exp"]
        )
        expiration_time = timezone.make_aware(expiration_time)

        data = {}
        data["user"] = UserSerializer(instance=user).data
        data["token"] = str(refresh.access_token)
        data["expiration_time"] = expiration_time
        response = Response(
            data,
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            "AUTH_TOKEN", str(refresh.access_token), expires=expiration_time
        )
        return response
    return Response(
        {"message": "Invalid login credentials"},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@extend_schema(
    responses={200: UserSerializer},
    tags=["Auth"],
    summary="Get user details from token",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request, version):
    return Response(
        UserSerializer(instance=request.user).data,
        status=status.HTTP_200_OK
    )
