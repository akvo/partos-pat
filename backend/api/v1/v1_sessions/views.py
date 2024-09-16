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
from api.v1.v1_sessions.models import PATSession
from api.v1.v1_sessions.serializers import (
    CreateSessionSerializer,
    SessionListSerializer,
    SessionCreatedSerializer,
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
                name="is_closed",
                required=False,
                default=False,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
            ),
        ],
        summary="To get list of PAT Sessions",
    )
    def get(self, request, version):
        queryset = PATSession.objects.filter(
            user=request.user,
        )
        is_closed = not request.GET.get("is_closed")
        queryset = queryset.filter(
            closed_at__isnull=is_closed
        )
        paginator = Pagination()
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
