from django.db import models
from api.v1.v1_users.models import SystemUser
from api.v1.v1_sessions.constants import SectorTypes


class PATSession(models.Model):
    user_id = models.ForeignKey(
        to=SystemUser,
        on_delete=models.CASCADE,
        related_name="user_owner_session",
    )
    session_name = models.CharField(max_length=255)
    countries = models.TextField()
    sector = models.IntegerField(choices=SectorTypes.FieldStr.items())
    other_sector = models.CharField(max_length=100, null=True)
    date = models.DateField()
    context = models.TextField()
    summary = models.TextField(default=None, null=True)
    join_code = models.CharField(max_length=100, default=None, null=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=None, null=True)
    closed_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return self.session_name

    class Meta:
        db_table = "pat_sessions"


class Organization(models.Model):
    session_id = models.ForeignKey(
        to=PATSession,
        on_delete=models.DO_NOTHING,
        related_name="session_organization",
    )
    organization_name = models.CharField(max_length=255)
    acronym = models.CharField(max_length=50, default=None, null=True)

    def __str__(self):
        return self.organization_name

    class Meta:
        db_table = "organizations"


class Participant(models.Model):
    user_id = models.ForeignKey(
        to=SystemUser,
        on_delete=models.CASCADE,
        related_name="user_participant",
    )
    session_id = models.ForeignKey(
        to=PATSession,
        on_delete=models.DO_NOTHING,
        related_name="session_participant",
    )
    organization_id = models.ForeignKey(
        to=Organization,
        on_delete=models.DO_NOTHING,
        related_name="organization_participant",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user_id.email

    class Meta:
        db_table = "participants"


class Decision(models.Model):
    session_id = models.ForeignKey(
        to=PATSession,
        on_delete=models.DO_NOTHING,
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
    user_id = models.ForeignKey(
        to=SystemUser,
        on_delete=models.CASCADE,
        related_name="user_participant_decision",
    )
    decision_id = models.ForeignKey(
        to=Decision,
        on_delete=models.CASCADE,
        related_name="decision_participant",
    )
    score = models.IntegerField()
    updated_at = models.DateTimeField(default=None, null=True)
    closed_at = models.DateTimeField(default=None, null=True)

    def __str__(self):
        return f"{self.user_id.email} | {self.decision_id.name}"

    class Meta:
        db_table = "participant_decisions"
