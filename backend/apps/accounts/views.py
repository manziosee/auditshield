from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample, OpenApiResponse

from .models import User
from .serializers import UserMeSerializer, UserCreateSerializer, ChangePasswordSerializer


class AuthRateThrottle(AnonRateThrottle):
    scope = "auth"


@extend_schema(
    tags=["auth"],
    summary="Obtain JWT token pair",
    description=(
        "Authenticate with email + password. Returns an **access** token (valid 30 min) "
        "and a **refresh** token (valid 7 days). Include the access token as "
        "`Authorization: Bearer <token>` on all subsequent requests."
    ),
    responses={
        200: OpenApiResponse(description="Token pair returned"),
        400: OpenApiResponse(description="Invalid credentials"),
        429: OpenApiResponse(description="Rate limit exceeded (5 requests/min)"),
    },
    examples=[
        OpenApiExample(
            "Login",
            value={"email": "admin@company.rw", "password": "S3cur3P@ssword"},
            request_only=True,
        ),
    ],
)
class LoginView(TokenObtainPairView):
    throttle_classes = [AuthRateThrottle]


@extend_schema(
    tags=["companies"],
    summary="Register company + admin account",
    description=(
        "One-step onboarding: creates a new **Company** tenant and its first "
        "admin **User** in a single atomic transaction. "
        "No authentication required — this is the entry point for new customers."
    ),
    responses={
        201: OpenApiResponse(description="Company and admin user created"),
        400: OpenApiResponse(description="Validation error"),
    },
)
class RegisterView(generics.CreateAPIView):
    """Self-registration (creates company-admin account + company in one step)."""
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]


@extend_schema_view(
    get=extend_schema(
        tags=["users"],
        summary="Get current user profile",
        description="Returns the authenticated user's full profile including role and company.",
    ),
    put=extend_schema(
        tags=["users"],
        summary="Update current user profile",
        description="Update first name, last name, phone, or avatar.",
    ),
    patch=extend_schema(
        tags=["users"],
        summary="Partially update current user profile",
    ),
)
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(
    tags=["auth"],
    summary="Change password",
    description=(
        "Change the current user's password. "
        "Requires the current password for verification. "
        "Clears the `must_change_password` flag on success."
    ),
    responses={
        200: OpenApiResponse(description="Password changed successfully"),
        400: OpenApiResponse(description="Current password incorrect or validation error"),
    },
)
class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])
        return Response({"detail": "Password changed successfully."})


@extend_schema(
    tags=["auth"],
    summary="Logout (blacklist refresh token)",
    description=(
        "Blacklists the provided refresh token, invalidating the session. "
        "The access token expires naturally after its lifetime."
    ),
    request={"application/json": {"type": "object", "properties": {"refresh": {"type": "string"}}}},
    responses={
        200: OpenApiResponse(description="Logged out"),
        400: OpenApiResponse(description="Invalid or missing refresh token"),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Logged out successfully."})
    except Exception:
        return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        tags=["users"],
        summary="List company users",
        description=(
            "Returns all users belonging to the authenticated user's company. "
            "Super admins see all users across all companies."
        ),
    ),
    post=extend_schema(
        tags=["users"],
        summary="Create a new user in this company",
        description="Create a new user account. Only company admins may do this.",
    ),
)
class UserListView(generics.ListCreateAPIView):
    """List/create users within the same company (admin only)."""
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.SUPER_ADMIN:
            return User.objects.all()
        return User.objects.filter(company=user.company)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserMeSerializer

    def perform_create(self, serializer):
        """Auto-assign the creating admin's company to the new user."""
        serializer.save(company=self.request.user.company)
