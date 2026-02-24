"""
Custom GraphQL context — attaches the Django request so JWT auth works
transparently with Strawberry resolvers.
"""
from strawberry.django.views import AsyncGraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser


class AuthenticatedGraphQLView(AsyncGraphQLView):
    """
    Overrides get_context to resolve the JWT Bearer token from the
    Authorization header and attach the authenticated user to context,
    exactly like DRF's JWTAuthentication does for REST endpoints.
    """
    async def get_context(self, request, response):
        ctx = await super().get_context(request, response)

        # Attempt JWT authentication
        jwt_auth = JWTAuthentication()
        try:
            result = jwt_auth.authenticate(request)
            if result is not None:
                user, token = result
                request.user = user
        except Exception:
            request.user = AnonymousUser()

        return ctx
