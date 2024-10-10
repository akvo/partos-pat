from datetime import datetime
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
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .permissions import IsSuperuser

from api.v1.v1_users.serializers import (
    RegisterSerializer,
    UserSerializer,
    VerifyTokenSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    VerifyPasswordTokenSerializer,
    ResetPasswordSerializer,
    UpdateUserSerializer,
    ManageUserSerializer,
)
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import validate_serializers_message
from utils.default_serializers import DefaultResponseSerializer
from utils.email_helper import send_email, EmailTypes
from utils.custom_pagination import Pagination


@extend_schema(
    request=RegisterSerializer,
    responses={201: UserSerializer, 400: DefaultResponseSerializer},
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

    email = serializer.validated_data['email']
    existing_user = SystemUser.objects_deleted.filter(email=email).first()

    if existing_user and existing_user.deleted_at:
        # If the user exists but is deleted, we'll restore and update it
        existing_user.restore()
        for attr, value in serializer.validated_data.items():
            setattr(existing_user, attr, value)
        existing_user.set_password(serializer.validated_data['password'])
        user = existing_user
    else:
        # If the user doesn't exist or isn't deleted, create a new one
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

    user.save()
    user_data = UserSerializer(instance=user).data
    response = Response(
        data=user_data,
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
            {"message": validate_serializers_message(serializer.errors)},
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
        expiration_time = datetime.fromtimestamp(refresh.access_token["exp"])
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
    responses={200: ForgotPasswordSerializer},
    tags=["Auth"],
    summary="Forgot password",
)
@api_view(["POST"])
def forgot_password(request, version):
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"message": "OK"},
            status=status.HTTP_200_OK,
        )
    email = serializer.validated_data["email"]
    user = SystemUser.objects.get(email=email)
    user.generate_reset_password_code()
    if not settings.TEST_ENV:
        send_email(
            type=EmailTypes.forgot_password,
            context={
                "send_to": [user.email],
                "name": user.full_name,
                "reset_password_code": user.reset_password_code,
            },
        )
    return Response(
        {"message": "OK"},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    responses={200: DefaultResponseSerializer},
    tags=["Auth"],
    summary="Verify password code",
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
def verify_password_code(request, version):
    serializer = VerifyPasswordTokenSerializer(data=request.GET)
    if not serializer.is_valid():
        return Response(
            {"message": validate_serializers_message(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    token = serializer.validated_data.get("token")
    user = SystemUser.objects.get(reset_password_code=token)
    if not user.is_reset_code_valid():
        return Response(
            {"message": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(
        {"message": "OK"},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    responses={200: DefaultResponseSerializer},
    tags=["Auth"],
    summary="Reset password",
    parameters=[
        OpenApiParameter(
            name="token",
            required=True,
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
        ),
    ],
)
@api_view(["POST"])
def reset_password(request, version):
    new_password = ResetPasswordSerializer(data=request.data)
    if not new_password.is_valid():
        return Response(
            {"message": validate_serializers_message(new_password.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = VerifyPasswordTokenSerializer(data=request.GET)
    if not serializer.is_valid():
        return Response(
            {"message": validate_serializers_message(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    token = serializer.validated_data.get("token")
    user = SystemUser.objects.get(reset_password_code=token)
    if not user.is_reset_code_valid():
        return Response(
            {"message": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user.set_password(new_password.validated_data["password"])
    user.reset_password_code = None
    user.reset_password_code_expiry = None
    user.save()
    return Response(
        {"message": "Password reset successfully"},
        status=status.HTTP_200_OK,
    )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserSerializer},
        tags=["Profile"],
        summary="Get user profile",
    )
    def get(self, request, version):
        return Response(
            UserSerializer(instance=request.user).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=UpdateUserSerializer,
        responses={200: UserSerializer, 400: DefaultResponseSerializer},
        tags=["Profile"],
        summary="Update user profile",
    )
    def put(self, request, version):
        serializer = UpdateUserSerializer(
            instance=request.user,
            data=request.data
        )
        if not serializer.is_valid():
            return Response(
                {"message": validate_serializers_message(serializer.errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()
        return Response(
            UserSerializer(instance=user).data, status=status.HTTP_200_OK
        )


@extend_schema(tags=["ManageUsers"])
class ManageUsersViewSet(ModelViewSet):
    serializer_class = ManageUserSerializer
    permission_classes = [IsAuthenticated, IsSuperuser]
    pagination_class = Pagination

    def get_queryset(self):
        queryset = SystemUser.objects.filter(
            deleted_at__isnull=True
        )
        name = self.request.query_params.get("name")
        if name:
            queryset = queryset.filter(
                full_name__icontains=name
            )
        return queryset.order_by("-id")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        current_user = self.request.user
        if current_user.id == instance.id:
            return Response(
                data={},
                status=status.HTTP_403_FORBIDDEN,
            )
        else:
            instance.soft_delete()
        return Response(
            UserSerializer(instance=instance).data,
            status=status.HTTP_200_OK
        )
