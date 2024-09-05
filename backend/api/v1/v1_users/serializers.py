from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field

from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.constants import Gender, AccountPurpose
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomBooleanField,
    CustomEmailField,
)


class RegisterSerializer(serializers.ModelSerializer):
    name = CustomCharField()
    gender = CustomChoiceField(choices=Gender.FieldStr)
    country = CustomCharField()
    account_purpose = CustomChoiceField(choices=AccountPurpose.FieldStr)
    email = CustomEmailField()
    password = CustomCharField()
    confirm_password = CustomCharField()
    agreement = CustomBooleanField(default=False)

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise ValidationError(
                {
                    "confirm_password": (
                        "Confirm password and password are not same"
                    )
                }
            )
        return attrs

    def validate_email(self, value):
        if SystemUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("agreement")
        validated_data.pop("confirm_password")
        name = validated_data.pop("name")
        names = name.split()
        validated_data["first_name"] = names[0]
        last_name = ""
        if len(names) > 1:
            last_name = names[1]
        user = SystemUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=last_name,
            gender=validated_data["gender"],
            country=validated_data["country"],
            account_purpose=validated_data["account_purpose"],
        )
        return user

    class Meta:
        model = SystemUser
        fields = [
            "name",
            "gender",
            "country",
            "account_purpose",
            "email",
            "password",
            "confirm_password",
            "agreement",
        ]


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_name(self, instance):
        return instance.get_full_name()

    @extend_schema_field(OpenApiTypes.INT)
    def get_last_login(self, instance):
        if instance.last_login:
            return instance.last_login.timestamp()
        return None

    class Meta:
        model = SystemUser
        fields = [
            "name",
            "gender",
            "country",
            "account_purpose",
            "email",
            "last_login",
        ]


class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        if not SystemUser.objects.filter(
            verification_token=value
        ).exists():
            raise serializers.ValidationError(
                "Invalid token"
            )
        return value
