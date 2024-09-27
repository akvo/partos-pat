from django.utils import timezone
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from api.v1.v1_sessions.constants import SectorTypes
from api.v1.v1_sessions.models import (
    PATSession,
    Organization,
    Participant,
    Decision,
)
from api.v1.v1_users.models import SystemUser
from utils.custom_serializer_fields import (
    CustomCharField,
    CustomChoiceField,
    CustomListField,
    CustomJSONField,
    CustomDateField,
    CustomPrimaryKeyRelatedField,
    CustomBooleanField,
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


class SessionSerializer(serializers.ModelSerializer):
    facilitator = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    organizations = serializers.SerializerMethodField()

    @extend_schema_field(UserFacilitatortSerializer())
    def get_facilitator(self, instance: PATSession):
        return UserFacilitatortSerializer(instance=instance.user).data

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
            "notes",
            "summary",
            "created_at",
            "updated_at",
            "closed_at",
        ]


class SessionListSerializer(serializers.ModelSerializer):
    facilitator = serializers.SerializerMethodField()

    @extend_schema_field(UserFacilitatortSerializer())
    def get_facilitator(self, instance: PATSession):
        return UserFacilitatortSerializer(instance=instance.user).data

    class Meta:
        model = PATSession
        fields = [
            "id",
            "session_name",
            "facilitator",
            "date",
            "context",
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
                acronym=org["acronym"],
            )
            org_items.append(org_item)
        return pat_session

    # Override to_representation
    # to return the created session with related organizations
    def to_representation(self, instance):
        # Use the PATSessionSerializer to represent the instance
        return SessionSerializer(instance).data

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
    notes = CustomCharField(required=False)

    class Meta:
        model = PATSession
        fields = ["summary", "notes"]

    def update(self, instance, validated_data):
        # Update the fields of the instance
        instance = super().update(instance, validated_data)

        # Save the updated instance
        instance.save()
        return instance

    def to_representation(self, instance):
        return SessionSerializer(instance).data


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
        ).queryset = PATSession.objects.filter(
            closed_at__isnull=True
        ).all()
        self.fields.get(
            "organization_id"
        ).queryset = Organization.objects.all()

    class Meta:
        fields = ["role", "session_id", "organization_id"]

    def validate_session_id(self, pat_session):
        user = self.context.get("user")
        if pat_session.user == user:
            raise serializers.ValidationError("invalidJoinOwner")
        exists = user.user_participant.filter(session=pat_session)
        if exists:
            raise serializers.ValidationError("invalidJoinExists")
        return pat_session

    def create(self, validated_data):
        participant = Participant.objects.create(
            user=self.context.get("user"),
            session=validated_data["session_id"],
            organization=validated_data["organization_id"],
            role=validated_data["role"],
        )
        return participant


class DecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decision
        fields = ["id", "session_id", "name", "agree", "created_at"]


class BaseDecisionSerializer(serializers.Serializer):
    session_id = CustomPrimaryKeyRelatedField(
        queryset=PATSession.objects.none()
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get("session_id").queryset = PATSession.objects.filter(
            closed_at__isnull=True
        ).all()

    def validate_session_id(self, pat_session):
        user = self.context.get("user")
        if pat_session.user != user:
            raise serializers.ValidationError(
                "You are not the owner"
            )
        return pat_session

    def to_representation(self, instance):
        return DecisionSerializer(instance=instance, many=True).data


class DecisionCreateSerializer(serializers.Serializer):
    name = CustomCharField()

    class Meta:
        fields = ["name"]


class DecisionUpdateSerializer(serializers.Serializer):
    id = CustomPrimaryKeyRelatedField(
        queryset=Decision.objects.none()
    )
    agree = CustomBooleanField()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get(
            "id"
        ).queryset = Decision.objects.all()

    class Meta:
        fields = ["id", "agree"]

    def update(self, instance, validated_data):
        instance.agree = validated_data.get("agree", instance.agree)
        instance.save()
        return instance


class BulkDecisionCreateSerializer(BaseDecisionSerializer):
    decisions = CustomListField(
        child=DecisionCreateSerializer(),
        required=True,
    )

    class Meta:
        fields = ["session_id", "decisions"]

    def create(self, validated_data):
        decisions = []
        for decision in validated_data["decisions"]:
            d = Decision.objects.create(
                session=validated_data["session_id"],
                name=decision["name"]
            )
            decisions.append(d)
        return decisions


class BulkDecisionUpdateSerializer(BaseDecisionSerializer):
    decisions = CustomListField(
        child=DecisionUpdateSerializer(),
        required=True,
    )

    class Meta:
        fields = ["session_id", "decisions"]

    def update(self, instance, validated_data):
        updated_decisions = []
        for decision_data in validated_data["decisions"]:
            # Retrieve the existing decision instance
            decision_instance = decision_data["id"]

            # Update the instance with the new data
            serializer = DecisionUpdateSerializer(
                instance=decision_instance,
                data={
                    "id": decision_instance.id,
                    "agree": decision_data.get("agree")
                },
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # Append the updated decision to the list
            updated_decisions.append(decision_instance)

        return updated_decisions
