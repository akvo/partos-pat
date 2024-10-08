from rest_framework.permissions import BasePermission
# from rest_framework.response import Response
# from rest_framework import status


class IsSuperuser(BasePermission):
    """
    Custom permission to allow only superusers access.
    """

    message = "You must be a superuser to access this resource."

    def has_permission(self, request, view):
        # Ensure the user is authenticated and is a superuser
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.is_superuser:
            return False
        return True
