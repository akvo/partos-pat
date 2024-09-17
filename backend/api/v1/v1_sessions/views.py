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
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from django.db.models import Q
from api.v1.v1_sessions.models import PATSession, Organization
from api.v1.v1_sessions.serializers import (
    CreateSessionSerializer,
    SessionListSerializer,
    SessionCreatedSerializer,
    UpdateSessionSerializer,
    OrganizationListSerializer,
)
from utils.custom_pagination import Pagination
from utils.custom_serializer_fields import validate_serializers_message


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
        ],
        summary="To get list of PAT Sessions",
    )
    def get(self, request, version):
        id = request.GET.get("id")
        code = request.GET.get("code")
        published = False if not request.GET.get("published") else True
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
                    data=None,
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(
                data=SessionListSerializer(instance=instance).data,
                status=status.HTTP_200_OK,
            )
        if code:
            instance = PATSession.objects.filter(
                (
                    Q(user=request.user) |
                    Q(session_participant__user=request.user)
                )
                & Q(join_code=code)
            ).first()
            if not instance:
                return Response(
                    data=None,
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(
                data=SessionListSerializer(instance=instance).data,
                status=status.HTTP_200_OK,
            )

        queryset = PATSession.objects.filter(
            (
                Q(user=request.user) |
                Q(session_participant__user=request.user)
            )
            & Q(is_published=published)
        ).order_by('-created_at').distinct()
        paginator = Pagination()
        if request.GET.get("page_size"):
            paginator.page_size = int(request.GET.get("page_size"))
        instance = paginator.paginate_queryset(queryset, request)
        response = paginator.get_paginated_response(
            SessionListSerializer(instance, many=True).data
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
        return Response(
            data=data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        request=UpdateSessionSerializer,
        responses={200: SessionListSerializer},
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
                    data=None,
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = UpdateSessionSerializer(
                instance,
                data=request.data,
                partial=True
            )
            if not serializer.is_valid():
                return Response(data=None, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(
                data=serializer.data,
                status=status.HTTP_200_OK,
            )
        return Response(
            data=None,
            status=status.HTTP_404_NOT_FOUND,
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
