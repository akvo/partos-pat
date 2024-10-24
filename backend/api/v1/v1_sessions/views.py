from datetime import timedelta
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
    OpenApiParameter,
)
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.db.models.functions import Coalesce
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.generics import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, DateField
from django.db.models.functions import TruncMonth, ExtractYear
from django.conf import settings
from api.v1.v1_sessions.models import (
    PATSession,
    Organization,
    ParticipantComment,
    Decision,
    Participant,
)
from api.v1.v1_sessions.serializers import (
    CreateSessionSerializer,
    SessionListSerializer,
    SessionSerializer,
    SessionCreatedSerializer,
    UpdateSessionSerializer,
    OrganizationListSerializer,
    JoinSessionSerializer,
    JoinOrganizationsSerializer,
    SessionDetailsSerializer,
    DecisionSerializer,
    DecisionListSerializer,
    BulkDecisionCreateSerializer,
    BulkDecisionUpdateSerializer,
    BulkParticipantDecisionSerializer,
    ParticipantDecisionSerializer,
    ParticipantCommentSerializer,
    ParticipantSerializer,
    TotalSessionPerMonthSerializer,
    TotalSessionCompletedSerializer,
    TotalSessionPerLast3YearsSerializer,
)
from utils.custom_pagination import Pagination
from utils.custom_serializer_fields import validate_serializers_message
from utils.default_serializers import DefaultResponseSerializer
from utils.email_helper import send_email, EmailTypes
from api.v1.v1_users.permissions import IsSuperuser
from api.v1.v1_sessions.constants import RoleTypes
from collections import defaultdict


class PATSessionAddListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            (200, "application/json"): inline_serializer(
                "DataList",
                fields={
                    "current": serializers.IntegerField(),
                    "total": serializers.IntegerField(),
                    "total_page": serializers.IntegerField(),
                    "data": SessionListSerializer(many=True),
                },
            )
        },
        tags=["Session"],
        parameters=[
            OpenApiParameter(
                name="page",
                required=True,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="id",
                required=False,
                default=None,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="code",
                required=False,
                default=None,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="page_size",
                required=False,
                default=None,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="published",
                required=False,
                default=False,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="search",
                required=False,
                default=None,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="role",
                required=False,
                enum=RoleTypes.FieldStr.keys(),
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
        ],
        summary="To get list of PAT Sessions",
    )
    def get(self, request, version):
        id = request.GET.get("id")
        code = request.GET.get("code")
        published_param = request.GET.get("published")
        role_param = request.GET.get("role")
        search_param = request.GET.get("search")

        published = False
        if published_param is not None:
            published = published_param.lower() in ["true", "1"]
        if id:
            instance = PATSession.objects.filter(
                (
                    Q(user=request.user) |
                    Q(session_participant__user=request.user)
                )
                & Q(pk=id)
            ).first()
            if not instance:
                return Response(
                    data={},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(
                data=SessionDetailsSerializer(
                    instance=instance,
                    context={
                        "user": request.user
                    }
                ).data,
                status=status.HTTP_200_OK,
            )
        if code:
            instance = PATSession.objects.filter(
                join_code=code,
                closed_at__isnull=True
            ).first()
            if not instance:
                return Response(
                    {
                        "details": {
                            "join_code": ["invalidJoinCode"]
                        }
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                data=JoinOrganizationsSerializer(
                    instance=instance
                ).data,
                status=status.HTTP_200_OK,
            )

        queryset = PATSession.objects.filter(
            is_published=published
        )
        if published:
            if role_param:
                role = int(role_param)
                if role == RoleTypes.facilitated:
                    queryset = queryset.filter(
                        user=request.user
                    )
                elif role == RoleTypes.participated:
                    queryset = queryset.filter(
                        session_participant__user=request.user,
                        session_participant__session_deleted_at__isnull=True
                    )
            else:
                queryset = queryset.filter(
                    Q(user=request.user) |
                    Q(
                        session_participant__user=request.user,
                        session_participant__session_deleted_at__isnull=True
                    )
                )
        else:
            queryset = queryset.filter(
                Q(user=request.user) |
                Q(session_participant__user=request.user)
            )
        if search_param:
            queryset = queryset.filter(
                Q(session_name__icontains=search_param) |
                Q(context__icontains=search_param)
            )
        queryset = queryset.annotate(last_updated_at=Coalesce(
            "closed_at", "updated_at", "created_at"
        ))
        queryset = queryset.order_by("-last_updated_at").distinct()
        paginator = Pagination()
        if request.GET.get("page_size"):
            paginator.page_size = int(request.GET.get("page_size"))
        instance = paginator.paginate_queryset(queryset, request)
        response = paginator.get_paginated_response(
            SessionListSerializer(
                instance,
                many=True,
                context={"user": request.user}
            ).data
        )
        return response

    @extend_schema(
        request=CreateSessionSerializer,
        responses={201: SessionCreatedSerializer},
        tags=["Session"],
        summary="Submit PAT Session data",
    )
    def post(self, request, version):
        serializer = CreateSessionSerializer(
            data=request.data, context={
                "user": request.user
            }
        )
        if not serializer.is_valid():
            return Response(
                {
                    "message": validate_serializers_message(serializer.errors),
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        data = SessionCreatedSerializer(instance=serializer.data).data
        if not settings.TEST_ENV:
            send_email(
                type=EmailTypes.session_created,
                context={
                    "send_to": [request.user.email],
                    "name": request.user.full_name,
                    "session_name": data["session_name"],
                    "date": data["date"],
                    "join_code": data["join_code"],
                },
            )
        return Response(
            data=data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        request=UpdateSessionSerializer,
        responses={200: SessionSerializer},
        tags=["Session"],
        parameters=[
            OpenApiParameter(
                name="id",
                required=False,
                default=None,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
        ],
        summary="Submit PAT Session data",
    )
    def put(self, request, version):
        id = request.GET.get("id")
        if id:
            instance = PATSession.objects.filter(
                pk=id,
                user=request.user
            ).first()
            if not instance:
                return Response(
                    data={},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = UpdateSessionSerializer(
                instance,
                data=request.data,
                partial=True
            )
            if not serializer.is_valid():
                return Response(data={}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(
                data=serializer.data,
                status=status.HTTP_200_OK,
            )
        return Response(
            data={},
            status=status.HTTP_404_NOT_FOUND,
        )

    @extend_schema(
        request=None,
        responses={200: SessionSerializer},
        tags=["Session"],
        parameters=[
            OpenApiParameter(
                name="id",
                required=True,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
        ],
        summary="Delete PAT Session",
    )
    def delete(self, request, version):
        id = request.GET.get("id")
        instance = get_object_or_404(PATSession, pk=id)
        if instance.user.id != request.user.id:
            participant = instance.session_participant.filter(
                user=request.user
            ).first()
            if not participant:
                return Response(
                    data={},
                    status=status.HTTP_403_FORBIDDEN,
                )
            participant.session_deleted_at = timezone.now()
            participant.save()
        if instance.user.id == request.user.id:
            instance.soft_delete()
        serializer = SessionSerializer(instance)
        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )


@extend_schema(
    responses={200: OrganizationListSerializer(many=True)},
    tags=["Session"],
    parameters=[
        OpenApiParameter(
            name="page",
            required=True,
            type=OpenApiTypes.NUMBER,
            location=OpenApiParameter.QUERY,
        ),
        OpenApiParameter(
            name="search",
            required=False,
            default=None,
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
        ),
    ],
    summary="Get orgnizations list",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def organization_list(request, version):
    queryset = Organization.objects.order_by("organization_name")
    search = request.GET.get("search")
    if search:
        queryset = queryset.filter(
            Q(organization_name__icontains=search) |
            Q(acronym__icontains=search)
        )
    paginator = Pagination()
    instance = paginator.paginate_queryset(queryset, request)
    response = paginator.get_paginated_response(
        OrganizationListSerializer(instance, many=True).data
    )
    return response


@extend_schema(
    request=JoinSessionSerializer,
    responses={201: DefaultResponseSerializer},
    tags=["Participants"],
    summary="Join PAT Session",
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def participant_join_session(request, version):
    serializer = JoinSessionSerializer(
        data=request.data, context={
            "user": request.user
        }
    )
    if not serializer.is_valid():
        return Response(
            {
                "message": validate_serializers_message(serializer.errors),
                "details": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer.save()
    return Response({"message": "Ok"}, status=status.HTTP_201_CREATED)


class BulkDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: DecisionListSerializer(many=True)},
        parameters=[
            OpenApiParameter(
                name="session_id",
                required=True,
                default=None,
                type=OpenApiTypes.NUMBER,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="agree",
                required=False,
                default=None,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="desired",
                required=False,
                default=None,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
            ),
        ],
        tags=["Decisions"],
        summary="Get all session decisions",
    )
    def get(self, request, version):
        session_id = int(request.GET.get("session_id"))
        pat_session = get_object_or_404(PATSession, pk=session_id)
        decisions = pat_session.session_decision.all()
        if request.GET.get("agree") in ["true", "false", "1", "0"]:
            agreed = request.GET.get("agree") in ["true", "1"]
            decisions = pat_session.session_decision.filter(
                agree=agreed
            ).all()
        is_desired = False
        if request.GET.get("desired") in ["true", "1"]:
            is_desired = True

        serializer = DecisionListSerializer(
            instance=decisions,
            many=True,
            context={
                "desired": is_desired
            }
        )
        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        request=BulkDecisionCreateSerializer,
        responses={201: DecisionSerializer(many=True)},
        tags=["Decisions"],
        summary="Bulk create session decisions",
    )
    def post(self, request, version):
        serializer = BulkDecisionCreateSerializer(
            data=request.data,
            context={
                "user": request.user
            }
        )
        if not serializer.is_valid():
            return Response(
                {
                    "message": validate_serializers_message(serializer.errors),
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_decisions = serializer.save()
        return Response(
            serializer.to_representation(created_decisions),
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        request=BulkDecisionUpdateSerializer,
        responses={200: DecisionSerializer(many=True)},
        tags=["Decisions"],
        summary="Bulk update session decisions",
    )
    def put(self, request, version):
        serializer = BulkDecisionUpdateSerializer(
            data=request.data,
            context={
                "user": request.user
            }
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": validate_serializers_message(serializer.errors),
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        updated_decisions = serializer.update(
            instance=None,
            validated_data=serializer.validated_data
        )
        return Response(
            serializer.to_representation(updated_decisions),
            status=status.HTTP_200_OK
        )


class BulkParticipantDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=BulkParticipantDecisionSerializer,
        responses={201: ParticipantDecisionSerializer(many=True)},
        tags=["ParticipantDecisions"],
        summary="Bulk create participant decision scores",
    )
    def post(self, request, version):
        serializer = BulkParticipantDecisionSerializer(
            data=request.data,
            context={
                "user": request.user
            }
        )
        if not serializer.is_valid():
            return Response(
                {
                    "message": validate_serializers_message(serializer.errors),
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.save()
        return Response(
            data=data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        request=BulkParticipantDecisionSerializer,
        responses={200: ParticipantDecisionSerializer(many=True)},
        tags=["ParticipantDecisions"],
        summary="Bulk update participant decision scores",
    )
    def put(self, request, version):
        serializer = BulkParticipantDecisionSerializer(
            data=request.data,
            context={
                "user": request.user
            }
        )

        if not serializer.is_valid():
            return Response(
                {
                    "message": validate_serializers_message(serializer.errors),
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.update(
            instance=None,
            validated_data=serializer.validated_data
        )
        return Response(
            data=data,
            status=status.HTTP_200_OK
        )


@extend_schema(tags=["ParticipantComments"])
class ParticipantCommentViewSet(ModelViewSet):
    serializer_class = ParticipantCommentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination

    def get_queryset(self):
        queryset = ParticipantComment.objects.order_by("-id")

        session_id = self.kwargs.get('session_id')
        if session_id:
            queryset = ParticipantComment.objects.filter(
                session_id=session_id,
            ).order_by("-id")
        return queryset


@extend_schema(
    responses={200: DecisionSerializer},
    tags=["Decisions"],
    summary="Delete PAT's decision",
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_decision(request, decision_id, version):
    decision = get_object_or_404(Decision, pk=decision_id)
    if (
        decision.session.user.id != request.user.id
    ):
        return Response(
            data={},
            status=status.HTTP_403_FORBIDDEN,
        )
    decision.delete()
    data = DecisionSerializer(instance=decision).data
    return Response(data=data, status=status.HTTP_200_OK)


@extend_schema(
    responses={200: ParticipantSerializer(many=True)},
    tags=["Participants"],
    summary="Get participants list",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def participant_list(request, session_id, version):
    queryset = Participant.objects.filter(session_id=session_id)
    serializer = ParticipantSerializer(queryset, many=True)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    responses={200: TotalSessionPerMonthSerializer(many=True)},
    tags=["Statistics"],
    summary="Get total sessions per month",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperuser])
def total_session_per_month(request, version):
    queryset = PATSession.objects.all()
    total_sessions_per_month = queryset.annotate(
        month=TruncMonth(
            "created_at", output_field=DateField()
        )
    ).values("month").annotate(
        total_sessions=Count("id")
    ).order_by("month")

    serializer = TotalSessionPerMonthSerializer(
        instance=total_sessions_per_month,
        many=True
    )
    return Response(
        data=serializer.data,
        status=status.HTTP_200_OK
    )


@extend_schema(
    responses={200: TotalSessionCompletedSerializer},
    tags=["Statistics"],
    summary="Get total sessions completed",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperuser])
def total_session_completed(request, version):
    total_completed = PATSession.objects.filter(
        closed_at__isnull=False
    ).count()
    total_completed_last_30_days = PATSession.objects.filter(
        closed_at__isnull=False,
        closed_at__gte=timezone.now() - timedelta(days=30)
    ).count()
    return Response(
        data={
            "total_completed": total_completed,
            "total_completed_last_30_days": total_completed_last_30_days
        },
        status=status.HTTP_200_OK
    )


@extend_schema(
    responses={200: TotalSessionPerLast3YearsSerializer(many=True)},
    tags=["Statistics"],
    summary="Get total sessions per last 3 years",
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSuperuser])
def total_session_per_last_3_years(request, version):
    queryset = PATSession.objects.all()
    current_year = timezone.now().year
    three_years_ago = current_year - 2

    dataset = queryset.filter(created_at__year__gte=three_years_ago) \
        .annotate(
            month=TruncMonth("created_at"),
            year=ExtractYear("created_at")
        ).values("year", "month") \
        .annotate(total_sessions=Count("id")) \
        .order_by("year", "month")

    years_data = defaultdict(lambda: {"year": 0, "total_sessions": [0] * 12})

    for entry in dataset:
        year = entry["year"]
        month = entry["month"].month - 1  # Adjust to 0-based index
        total = entry["total_sessions"]

        years_data[year]["year"] = year
        years_data[year]["total_sessions"][month] = total

    result = sorted(years_data.values(), key=lambda x: x["year"])

    serializer = TotalSessionPerLast3YearsSerializer(instance=result, many=True)
    return Response(
        data=serializer.data,
        status=status.HTTP_200_OK
    )
