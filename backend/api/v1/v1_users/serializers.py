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
    gender = CustomChoiceField(choices=Gender.FieldStr)
    country = CustomCharField()
    account_purpose = CustomChoiceField(choices=AccountPurpose.FieldStr)
    email = CustomEmailField()
    password = CustomCharField()
    confirm_password = CustomCharField()
    agreement = CustomBooleanField(default=False)

    def validate_agreement(self, value):
        if not value:
            raise serializers.ValidationError(
                "checkAgreementRequired"
            )
        return value

    def validate_password(self, value):
        criteria = re.compile(
            r'^(?=.*[a-z])(?=.*\d)(?=.*[A-Z])(?=.*^\S*$)(?=.{8,})'
        )
        if not criteria.match(value):
            raise serializers.ValidationError(
                "False Password Criteria"
            )
        return value

    def validate_confirm_password(self, value):
        # Access the initial data for password
        password = self.initial_data.get('password')
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
            gender=validated_data["gender"],
            country=validated_data["country"],
            account_purpose=validated_data["account_purpose"],
        )
        return user

    class Meta:
        model = SystemUser
        fields = [
            "full_name",
            "gender",
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
        ]


class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate_token(self, value):
        if not SystemUser.objects.filter(
            verification_code=value
        ).exists():
            raise serializers.ValidationError(
                "Invalid token"
            )
        return value


class LoginSerializer(serializers.Serializer):
    email = CustomEmailField()
    password = CustomCharField()
