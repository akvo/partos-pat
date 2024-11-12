from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from api.v1.v1_sessions.constants import SectorTypes
from api.v1.v1_sessions.models import (
    PATSession,
    Organization,
    Participant,
    Decision,
    ParticipantDecision,
    ParticipantComment,
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
    CustomIntegerField,
)


class OrganizationFormSerializer(serializers.Serializer):
    id = CustomPrimaryKeyRelatedField(
        queryset=Organization.objects.none(),
        required=False,
        allow_null=True,
    )
    name = CustomCharField()
    acronym = CustomCharField()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get(
            "id"
        ).queryset = Organization.objects.all()

    class Meta:
        fields = ["id", "name", "acronym"]


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


class SessionDetailsSerializer(SessionSerializer):
    is_owner = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_owner(self, instance: PATSession):
        current_user = self.context.get("user")
        return instance.user.id == current_user.id

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
            "is_owner",
        ]


class JoinOrganizationsSerializer(serializers.ModelSerializer):
    organizations = serializers.SerializerMethodField()

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
            "organizations",
            "join_code",
        ]


class SessionListSerializer(serializers.ModelSerializer):
    facilitator = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    @extend_schema_field(UserFacilitatortSerializer())
    def get_facilitator(self, instance: PATSession):
        return UserFacilitatortSerializer(instance=instance.user).data

    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_owner(self, instance: PATSession):
        current_user = self.context.get("user")
        return instance.user.id == current_user.id

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
            "is_owner",
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
        organizations = validated_data.pop("organizations", [])
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
    session_name = CustomCharField(required=False)
    countries = CustomJSONField(required=False)
    sector = CustomChoiceField(
        choices=SectorTypes.FieldStr,
        required=False
    )
    other_sector = CustomCharField(required=False)
    date = CustomDateField(required=False)
    context = CustomCharField(required=False)
    organizations = CustomListField(
        child=OrganizationFormSerializer(),
        required=False,
    )
    summary = CustomCharField(required=False)
    notes = CustomCharField(required=False)
    context = CustomCharField(required=False)
    is_published = CustomBooleanField(
        required=False,
        allow_null=True,
    )

    def validate_date(self, value):
        today = timezone.now().date()
        if value < today:
            raise serializers.ValidationError(
                "The date must be today or later."
            )
        return value

    class Meta:
        model = PATSession
        fields = [
            "session_name",
            "countries",
            "sector",
            "other_sector",
            "date",
            "context",
            "organizations",
            "summary",
            "notes",
            "context",
            "is_published"
        ]

    def update(self, instance, validated_data):
        # Update the fields of the instance
        instance = super().update(instance, validated_data)

        organizations = validated_data.pop("organizations", [])
        for org in organizations:
            if org.get("id"):
                instance_org = org["id"]
                instance_org.organization_name = org["name"]
                instance_org.acronym = org["acronym"]
                instance_org.save()
            else:
                Organization.objects.create(
                    session=instance,
                    organization_name=org["name"],
                    acronym=org["acronym"],
                )

        if validated_data.get("is_published"):
            total_scores = instance.session_decision \
                .annotate(
                    participant_decision_count=Count("decision_participant")
                ).filter(participant_decision_count__gt=0) \
                .count()
            if total_scores:
                instance.set_closed()

        # Save the updated instance
        instance.updated_at = timezone.now()
        instance.save()
        return instance

    # def to_representation(self, instance):
    #     return SessionSerializer(instance).data


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


class ParticipantScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipantDecision
        fields = ["id", "organization_id", "score", "desired"]


class DecisionListSerializer(serializers.ModelSerializer):
    scores = serializers.SerializerMethodField()

    @extend_schema_field(ParticipantScoreSerializer(many=True))
    def get_scores(self, instance: Decision):
        queryset = instance.decision_participant
        if self.context.get("desired"):
            queryset = queryset.filter(
                Q(desired__isnull=True) | Q(desired=True)
            )
        queryset = queryset.all()
        return ParticipantScoreSerializer(
            instance=queryset,
            many=True
        ).data

    class Meta:
        model = Decision
        fields = [
            "id", "name", "notes", "agree", "scores"
        ]


class DecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decision
        fields = ["id", "session_id", "name", "notes", "agree"]


class BaseSessionFormSerializer(serializers.Serializer):
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


class DecisionCreateSerializer(serializers.Serializer):
    name = CustomCharField()

    class Meta:
        fields = ["name"]


class DecisionUpdateSerializer(serializers.Serializer):
    id = CustomPrimaryKeyRelatedField(
        queryset=Decision.objects.none()
    )
    name = CustomCharField(required=False)
    notes = CustomCharField(required=False)
    agree = CustomBooleanField(
        required=False,
        allow_null=True,
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get(
            "id"
        ).queryset = Decision.objects.all()

    class Meta:
        fields = ["id", "name", "notes", "agree"]

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.agree = validated_data.get("agree", instance.agree)
        instance.notes = validated_data.get("notes", instance.notes)
        instance.session.updated_at = timezone.now()
        instance.session.save()
        instance.updated_at = timezone.now()
        instance.save()
        if instance.agree is False:
            for score in instance.decision_participant.filter(
                desired__isnull=True
            ).all():
                score.desired = False
                score.save()
        return instance


class BulkDecisionCreateSerializer(BaseSessionFormSerializer):
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

    def to_representation(self, instance):
        return DecisionSerializer(instance=instance, many=True).data


class BulkDecisionUpdateSerializer(BaseSessionFormSerializer):
    decisions = CustomListField(
        child=DecisionUpdateSerializer(),
        required=True,
    )

    class Meta:
        fields = ["session_id", "decisions"]

    def update(self, instance, validated_data):
        updated_decisions = []
        for decision_data in validated_data["decisions"]:
            decision_instance = decision_data["id"]
            decision_data["id"] = decision_instance.id
            serializer = DecisionUpdateSerializer(
                instance=decision_instance,
                data=decision_data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            updated_decisions.append(decision_instance)

        return updated_decisions

    def to_representation(self, instance):
        return DecisionSerializer(instance=instance, many=True).data


class ParticipantDecisionSerializer(serializers.ModelSerializer):
    id = CustomPrimaryKeyRelatedField(
        queryset=ParticipantDecision.objects.none(),
        required=False,
        allow_null=True,
    )
    organization_id = CustomPrimaryKeyRelatedField(
        queryset=Organization.objects.none()
    )
    decision_id = CustomPrimaryKeyRelatedField(
        queryset=Decision.objects.none()
    )
    score = CustomIntegerField()
    desired = CustomBooleanField(
        required=False,
        allow_null=True,
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.fields.get(
            "id"
        ).queryset = ParticipantDecision.objects.all()

        self.fields.get(
            "organization_id"
        ).queryset = Organization.objects.all()

        self.fields.get(
            "decision_id"
        ).queryset = Decision.objects.all()

    class Meta:
        model = ParticipantDecision
        fields = [
            "id", "organization_id", "decision_id", "score", "desired"
        ]

    def create(self, validated_data):
        organization = validated_data.pop("organization_id")
        decision = validated_data.pop("decision_id")
        instance = ParticipantDecision.objects.create(
            organization=organization,
            decision=decision,
            **validated_data
        )
        return instance

    def update(self, instance, validated_data):
        instance.score = validated_data.get("score", instance.score)
        instance.desired = validated_data.get("desired", instance.desired)

        instance.decision.session.updated_at = timezone.now()
        instance.decision.session.save()

        instance.updated_at = timezone.now()
        instance.save()
        return instance


class BulkParticipantDecisionSerializer(BaseSessionFormSerializer):
    scores = CustomListField(
        child=ParticipantDecisionSerializer(),
        required=True,
    )

    class Meta:
        fields = ["session_id", "scores"]

    def create(self, validated_data):
        serializer = ParticipantDecisionSerializer(
            data=[
                {
                    "organization_id": v["organization_id"].id,
                    "decision_id": v["decision_id"].id,
                    "score": v["score"],
                    "desired": v.get("desired"),
                }
                for v in validated_data["scores"]
            ],
            many=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return serializer.data

    def update(self, instance, validated_data):
        instances = []
        for v in validated_data["scores"]:
            serializer = ParticipantDecisionSerializer(
                instance=v["id"],
                data={
                    "organization_id": v["organization_id"].id,
                    "decision_id": v["decision_id"].id,
                    "score": v["score"],
                    "desired": v.get("desired"),
                    "id": v["id"].id
                },
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            instances.append(v["id"])
        return ParticipantDecisionSerializer(
            instance=instances, many=True
        ).data


class ParticipantCommentSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_fullname(self, instance: ParticipantComment):
        return instance.user.full_name

    @extend_schema_field(OpenApiTypes.STR)
    def get_organization_name(self, instance: ParticipantComment):
        participant = Participant.objects.filter(
            user=instance.user,
            session=instance.session
        ).first()
        if not participant:
            return None
        return participant.organization.organization_name

    class Meta:
        model = ParticipantComment
        fields = [
            "id", "user_id", "fullname", "organization_name",
            "session_id", "comment"
        ]

    def create(self, validated_data):
        user = self.context.get("request").user
        session_id = self.context.get("view").kwargs.get("session_id")

        try:
            session = PATSession.objects.get(id=session_id)
            total_score = session.session_decision.annotate(
                participant_decision_count=Count("decision_participant")
            ).filter(participant_decision_count__gt=0).count()
            if total_score == 0:
                raise serializers.ValidationError(
                    "Please complete the PAT scoring steps first"
                )
        except PATSession.DoesNotExist:
            raise serializers.ValidationError("Invalid session_id.")

        instance = ParticipantComment.objects.create(
            user=user,
            session_id=session_id,
            **validated_data
        )
        return instance

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


class ParticipantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    organization_acronym = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.STR)
    def get_full_name(self, instance: Participant):
        return instance.user.full_name

    @extend_schema_field(OpenApiTypes.STR)
    def get_email(self, instance: Participant):
        return instance.user.email

    @extend_schema_field(OpenApiTypes.STR)
    def get_organization_name(self, instance: Participant):
        return instance.organization.organization_name

    @extend_schema_field(OpenApiTypes.STR)
    def get_organization_acronym(self, instance: Participant):
        return instance.organization.acronym

    class Meta:
        model = Participant
        fields = [
            "id", "full_name", "email", "role", "organization_name",
            "organization_acronym", "organization_id"
        ]


class TotalSessionPerMonthSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    month = serializers.DateField()

    class Meta:
        fields = ["total_sessions", "month"]


class TotalSessionCompletedSerializer(serializers.Serializer):
    total_completed = serializers.IntegerField()
    total_completed_last_30_days = serializers.IntegerField()

    class Meta:
        fields = ["total_completed", "total_completed_last_30_days"]


class TotalSessionPerLast3YearsSerializer(serializers.Serializer):
    total_sessions = serializers.ListField()
    year = serializers.IntegerField()

    class Meta:
        fields = ["total_sessions", "year"]


class SessionStatisticsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    total_sessions_last_30_days = serializers.IntegerField()
    total_sessions_per_category = serializers.DictField()

    class Meta:
        fields = [
            "total_sessions",
            "total_sessions_last_30_days",
            "total_sessions_per_category",
        ]
