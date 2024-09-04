from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from uuid import uuid4

from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.constants import Gender, AccountPurpose
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomBooleanField,
    CustomEmailField,
)


class UserRoleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    value = serializers.CharField()


class RegisterSerializer(serializers.ModelSerializer):
    name = CustomCharField()
    gender = CustomChoiceField(choices=Gender.FieldStr)
    country = CustomCharField()
    account_purpose = CustomChoiceField(choices=AccountPurpose.FieldStr)
    email = CustomEmailField()
    password = CustomCharField()
    confirm_password = CustomCharField()
    agreement = CustomBooleanField()

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
        if len(names) > 1:
            validated_data["last_name"] = names[1]
        user = super(RegisterSerializer, self).create(validated_data)
        user.set_password(validated_data["password"])
        user.verification_token = uuid4()
        user.save()
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
