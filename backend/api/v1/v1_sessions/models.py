from django.db import models
from django.utils import timezone

from api.v1.v1_users.models import SystemUser
from api.v1.v1_sessions.constants import SessionPurpose
from utils.custom_manager import PATSessionManager
from utils.soft_deletes_model import SoftDeletes


class PATSession(SoftDeletes):
    user = models.ForeignKey(
        to=SystemUser,
        on_delete=models.PROTECT,
        related_name="user_owner_session",
    )
    session_name = models.CharField(max_length=255)
    countries = models.JSONField()
    purpose = models.IntegerField(
        choices=SessionPurpose.FieldStr.items(),
        default=None,
        null=True,
    )
    other_purpose = models.CharField(max_length=100, null=True)
    date = models.DateField()
    context = models.TextField()
    summary = models.TextField(default=None, null=True)
    notes = models.TextField(default=None, null=True)
    join_code = models.CharField(max_length=100, unique=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, null=True)
    closed_at = models.DateTimeField(default=None, null=True)

    REQUIRED_FIELDS = [
        "session_name", "countries", "purpose", "date", "context"
    ]

    objects = PATSessionManager()

    def set_closed(self, closed_at=None):
        if not closed_at:
            closed_at = timezone.now()
        self.closed_at = closed_at
        self.is_published = True
        self.save()

    def __str__(self):
        return self.session_name

    class Meta:
        db_table = "pat_sessions"
        verbose_name = "PAT Session"
        verbose_name_plural = "PAT Sessions"


class Organization(models.Model):
    session = models.ForeignKey(
        to=PATSession,
        on_delete=models.CASCADE,
        related_name="session_organization",
    )
    organization_name = models.CharField(max_length=255)
    acronym = models.CharField(max_length=25, default=None, null=True)

    def __str__(self):
        return self.organization_name

    class Meta:
        db_table = "organizations"


class Participant(models.Model):
    user = models.ForeignKey(
        to=SystemUser,
        on_delete=models.CASCADE,
        related_name="user_participant",
    )
    session = models.ForeignKey(
        to=PATSession,
        on_delete=models.CASCADE,
        related_name="session_participant",
    )
    organization = models.ForeignKey(
        to=Organization,
        on_delete=models.CASCADE,
        related_name="organization_participant",
    )
    role = models.CharField(
        max_length=100, default=None, null=True
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    # Delete session from participant view
    session_deleted_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return self.user.email

    class Meta:
        db_table = "participants"


class Decision(models.Model):
    session = models.ForeignKey(
        to=PATSession,
        on_delete=models.CASCADE,
        related_name="session_decision",
    )
    name = models.CharField(max_length=255)
    agree = models.BooleanField(default=None, null=True)
    notes = models.TextField(default=None, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "decisions"


class ParticipantDecision(models.Model):
    organization = models.ForeignKey(
        to=Organization,
        on_delete=models.CASCADE,
        related_name="organization_participant_decision",
        default=None
    )
    decision = models.ForeignKey(
        to=Decision,
        on_delete=models.CASCADE,
        related_name="decision_participant",
    )
    score = models.IntegerField()
    desired = models.BooleanField(default=None, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return f"{self.organization.acronym} | {self.decision.name}"

    class Meta:
        db_table = "participant_decisions"


class ParticipantComment(models.Model):
    session = models.ForeignKey(
        to=PATSession,
        on_delete=models.CASCADE,
        related_name="session_participant_comment",
    )
    user = models.ForeignKey(
        to=SystemUser,
        on_delete=models.CASCADE,
        related_name="user_participant_comment",
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return f"{self.user.email} | {self.comment}"

    class Meta:
        db_table = "participant_comments"
