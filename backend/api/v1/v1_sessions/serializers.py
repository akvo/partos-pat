from django.utils import timezone
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field

from api.v1.v1_sessions.constants import SectorTypes
from api.v1.v1_sessions.models import PATSession, Organization
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomListField,
    CustomJSONField,
    CustomDateField,
)


class OrganizationFormSerializer(serializers.Serializer):
    name = CustomCharField()
    acronym = CustomCharField()

    class Meta:
        fields = ["name", "acronym"]


class OrganizationListSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_name(self, instance: Organization):
        return instance.organization_name

    class Meta:
        model = Organization
        fields = ["id", "name", "acronym"]


class UserFacilitatortSerializer(serializers.ModelSerializer):

    class Meta:
        model = SystemUser
        fields = ["id", "full_name"]


class SessionCreatedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    session_name = serializers.CharField()
    join_code = serializers.CharField()
    is_published = serializers.BooleanField()

    class Meta:
        fields = [
            "id",
            "session_name",
            "join_code",
            "is_published",
        ]


class SessionListSerializer(serializers.ModelSerializer):
    facilitator = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    organizations = serializers.SerializerMethodField()

    @extend_schema_field(UserFacilitatortSerializer())
    def get_facilitator(self, instance: PATSession):
        return UserFacilitatortSerializer(
            instance=instance.user
        ).data

    @extend_schema_field(OpenApiTypes.STR)
    def get_sector(self, instance: PATSession):
        return SectorTypes.FieldStr[instance.sector]

    @extend_schema_field(OrganizationListSerializer(many=True))
    def get_organizations(self, instance: PATSession):
        return OrganizationListSerializer(
            instance=instance.session_organization.all(), many=True
        ).data

    class Meta:
        model = PATSession
        fields = [
            "id",
            "session_name",
            "facilitator",
            "countries",
            "sector",
            "other_sector",
            "date",
            "context",
            "organizations",
            "join_code",
            "is_published",
            "created_at",
            "updated_at",
            "closed_at",
        ]


class CreateSessionSerializer(serializers.Serializer):
    session_name = CustomCharField()
    countries = CustomJSONField()
    sector = CustomChoiceField(choices=SectorTypes.FieldStr)
    other_sector = CustomCharField(required=False)
    date = CustomDateField()
    context = CustomCharField()
    organizations = CustomListField(
        child=OrganizationFormSerializer(),
        required=True,
    )

    def validate_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError(
                "The date must be today or later."
            )
        return value

    def create(self, validated_data):
        organizations = validated_data.pop("organizations")
        name = validated_data.pop("session_name")
        pat_session = PATSession.objects.create_session(
            owner=self.context.get("user"),
            name=name,
            **validated_data
        )
        org_items = []
        for org in organizations:
            org_item = Organization.objects.create(
                session=pat_session,
                organization_name=org["name"],
                acronym=org["acronym"]
            )
            org_items.append(org_item)
        return pat_session

    # Override to_representation
    # to return the created session with related organizations
    def to_representation(self, instance):
        # Use the PATSessionSerializer to represent the instance
        return SessionListSerializer(instance).data

    class Meta:
        fields = [
            "session_name",
            "countries",
            "sector",
            "other_sector",
            "date",
            "context",
            "organizations",
        ]
