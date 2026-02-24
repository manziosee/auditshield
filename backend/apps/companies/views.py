from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from .models import Company
from .serializers import CompanySerializer, CompanyOnboardingSerializer


class OnboardingView(generics.GenericAPIView):
    """
    Single endpoint to register a new company and its admin user.
    Called from the public sign-up flow.
    """
    serializer_class = CompanyOnboardingSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # Create company
        company = Company.objects.create(
            name=d["company_name"],
            company_type=d["company_type"],
            tin_number=d.get("tin_number", ""),
            rssb_number=d.get("rssb_number", ""),
            email=d["company_email"],
            phone=d["company_phone"],
            district=d.get("district", ""),
        )

        # Create admin user
        admin = User.objects.create_user(
            email=d["admin_email"],
            password=d["admin_password"],
            first_name=d["admin_first_name"],
            last_name=d["admin_last_name"],
            role=User.Role.COMPANY_ADMIN,
            company=company,
            must_change_password=False,
        )

        return Response({
            "detail": "Company registered successfully.",
            "company_id": str(company.id),
            "user_id": str(admin.id),
        }, status=status.HTTP_201_CREATED)


class CompanyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.company
