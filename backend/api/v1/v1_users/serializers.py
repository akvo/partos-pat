import re
import os
import json
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from partos_pat.settings import BASE_DIR
from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.constants import Gender
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomBooleanField,
    CustomEmailField,
)


def load_json(file_name: str):
    file_path = os.path.join(BASE_DIR, "i18n", f"{file_name}.json")
    if not os.path.exists(file_path):
        return None
    with open(file_path, "r", encoding="utf-8") as file:
        json_data = json.load(file)
    return json_data


countries_data = load_json(file_name="countries")
transl_en_data = load_json(file_name="en")


class RegisterSerializer(serializers.ModelSerializer):
    full_name = CustomCharField()
    country = CustomCharField()
    email = CustomEmailField()
    password = CustomCharField()
    confirm_password = CustomCharField()
    agreement = CustomBooleanField(default=False)

    def validate_agreement(self, value):
        if not value:
            raise serializers.ValidationError("checkAgreementRequired")
        return value

    def validate_password(self, value):
        criteria = re.compile(
            r"^(?=.*[a-z])(?=.*\d)(?=.*[A-Z])(?=.*^\S*$)(?=.{8,})"
        )
        if not criteria.match(value):
            raise serializers.ValidationError("False Password Criteria")
        return value

    def validate_confirm_password(self, value):
        # Access the initial data for password
        password = self.initial_data.get("password")
        if password != value:
            raise serializers.ValidationError(
                "Confirm password and password are not same"
            )
        return value

    def validate_email(self, value):
        if SystemUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("agreement")
        validated_data.pop("confirm_password")
        user = SystemUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            country=validated_data["country"],
        )
        return user

    class Meta:
        model = SystemUser
        fields = [
            "full_name",
            "country",
            "email",
            "password",
            "confirm_password",
            "agreement",
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemUser
        fields = [
            "id",
            "full_name",
            "email",
            "gender",
            "country",
            "is_superuser",
        ]


class ManageUserSerializer(UserSerializer):
    full_name = CustomCharField(required=False)
    country = CustomCharField(required=False)
    email = CustomEmailField(required=False)
    is_superuser = CustomBooleanField(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = SystemUser
        fields = [
            "id",
            "full_name",
            "email",
            "gender",
            "country",
            "is_superuser",
        ]

    # def create(self, validated_data):
    #     instance = super().create_user(validated_data)
    #     return instance

    def update(self, instance, validated_data):
        instance.is_superuser = validated_data.get(
            "is_superuser", instance.is_superuser
        )
        instance.save()
        return instance


class UpdateUserSerializer(serializers.ModelSerializer):
    full_name = CustomCharField()
    gender = CustomChoiceField(
        choices=Gender.FieldStr,
        required=False,
        allow_null=True,
    )
    country = CustomCharField()

    class Meta:
        model = SystemUser
        fields = [
            "full_name",
            "gender",
            "country",
        ]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        if not SystemUser.objects.filter(verification_code=value).exists():
            raise serializers.ValidationError("Invalid token")
        return value


class LoginSerializer(serializers.Serializer):
    email = CustomEmailField()
    password = CustomCharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = CustomEmailField()

    def validate_email(self, value):
        if not SystemUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User not found")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    password = CustomCharField()
    confirm_password = CustomCharField()

    def validate_confirm_password(self, value):
        password = self.initial_data.get("password")
        if password != value:
            raise serializers.ValidationError(
                "Confirm password and password are not same"
            )
        return value

    def validate_password(self, value):
        criteria = re.compile(
            r"^(?=.*[a-z])(?=.*\d)(?=.*[A-Z])(?=.*^\S*$)(?=.{8,})"
        )
        if not criteria.match(value):
            raise serializers.ValidationError("False Password Criteria")
        return value


class VerifyPasswordTokenSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        if not SystemUser.objects.filter(reset_password_code=value).exists():
            raise serializers.ValidationError("Invalid token")
        return value


class UserStatisticsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_users_last_30_days = serializers.IntegerField()

    class Meta:
        fields = [
            "total_users",
            "total_users_last_30_days",
        ]


class ExportUserSerializer(serializers.ModelSerializer):
    gender = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    admin = serializers.SerializerMethodField()
    verified = serializers.SerializerMethodField()
    date_joined = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_gender(self, instance: SystemUser):
        if instance.gender in Gender.FieldStr:
            return Gender.FieldStr[instance.gender]
        return instance.gender

    @extend_schema_field(OpenApiTypes.STR)
    def get_country(self, instance: SystemUser):
        if not countries_data:
            return instance.country
        cl = list(filter(
            lambda c: c["alpha-2"] == instance.country,
            countries_data,
        ))
        country = cl[0]["name"] if len(cl) == 1 else instance.country
        return country

    @extend_schema_field(OpenApiTypes.STR)
    def get_admin(self, instance: SystemUser):
        return "Yes" if instance.is_superuser else "No"

    @extend_schema_field(OpenApiTypes.STR)
    def get_verified(self, instance: SystemUser):
        return "Yes" if instance.is_verified else "No"

    @extend_schema_field(OpenApiTypes.STR)
    def get_date_joined(self, instance: SystemUser):
        return instance.date_joined.strftime("%Y-%m-%d")

    class Meta:
        model = SystemUser
        fields = [
            "id",
            "date_joined",
            "full_name",
            "email",
            "gender",
            "country",
            "admin",
            "verified",
        ]
