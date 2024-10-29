import re
from rest_framework import serializers

from api.v1.v1_users.models import SystemUser
from api.v1.v1_users.constants import Gender, AccountPurpose
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomBooleanField,
    CustomEmailField,
)


class RegisterSerializer(serializers.ModelSerializer):
    full_name = CustomCharField()
    country = CustomCharField()
    account_purpose = CustomChoiceField(choices=AccountPurpose.FieldStr)
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
            account_purpose=validated_data["account_purpose"],
        )
        return user

    class Meta:
        model = SystemUser
        fields = [
            "full_name",
            "country",
            "account_purpose",
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
            "account_purpose",
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
            "account_purpose",
            "is_superuser",
        ]

    # def create(self, validated_data):
    #     instance = super().create_user(validated_data)
    #     return instance

    def update(self, instance, validated_data):
        instance.is_superuser = validated_data.get(
            "is_superuser",
            instance.is_superuser
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
    account_purpose = CustomChoiceField(choices=AccountPurpose.FieldStr)

    class Meta:
        model = SystemUser
        fields = [
            "full_name",
            "gender",
            "country",
            "account_purpose",
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
    total_users_per_account_purpose = serializers.DictField()

    class Meta:
        fields = [
            "total_users",
            "total_users_last_30_days",
            "total_users_per_account_purpose",
        ]
