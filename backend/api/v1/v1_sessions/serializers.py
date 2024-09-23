from django.utils import timezone
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from django.db.models import Count
from api.v1.v1_sessions.constants import SectorTypes
from api.v1.v1_sessions.models import (
    PATSession, Organization, Participant
)
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomListField,
    CustomJSONField,
    CustomDateField,
    CustomPrimaryKeyRelatedField,
)


class OrganizationFormSerializer(serializers.Serializer):
    name = CustomCharField()
    acronym = CustomCharField()

    class Meta:
        fields = ["name", "acronym"]


class OrganizationListSerializer(serializers.ModelSerializer):
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
    date = serializers.DateField()
    is_published = serializers.BooleanField()

    class Meta:
        fields = [
            "id",
            "session_name",
            "join_code",
            "date",
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
            "summary",
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


class UpdateSessionSerializer(serializers.ModelSerializer):
    summary = CustomCharField(required=False)

    class Meta:
        model = PATSession
        fields = ["summary"]

    def update(self, instance, validated_data):
        # Update the fields of the instance
        instance = super().update(instance, validated_data)

        # Check if there are any decisions with scores and
        # close the session
        if (
            instance.session_decision.annotate(
                participant_decision_count=Count("decision_participant")
            ).filter(participant_decision_count__gt=0).count()
        ):
            instance.set_closed()  # Custom method to close the session

        # Save the updated instance
        instance.save()
        return instance

    def to_representation(self, instance):
        return SessionListSerializer(instance).data


class JoinSessionSerializer(serializers.Serializer):
    role = CustomCharField()
    session_id = CustomPrimaryKeyRelatedField(
        queryset=PATSession.objects.none()
    )
    organization_id = CustomPrimaryKeyRelatedField(
        queryset=Organization.objects.none()
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get(
            "session_id"
        ).queryset = PATSession.objects.all()
        self.fields.get(
            "organization_id"
        ).queryset = Organization.objects.all()

    class Meta:
        fields = ["role", "session_id", "organization_id"]

    def validate_session_id(self, pat_session):
        user = self.context.get("user")
        if pat_session.user == user:
            raise serializers.ValidationError(
                "You are the owner and already part of the session."
            )
        exists = user.user_participant.filter(
            session=pat_session
        )
        if exists:
            raise serializers.ValidationError(
                "You have already joined."
            )
        return pat_session

    def create(self, validated_data):
        participant = Participant.objects.create(
            user=self.context.get("user"),
            session=validated_data["session_id"],
            organization=validated_data["organization_id"],
            role=validated_data["role"]
        )
        return participant
