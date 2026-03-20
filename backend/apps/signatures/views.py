from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SignatureRequest, SignatureRequestSigner
from .serializers import SignatureRequestSerializer, SignatureRequestSignerSerializer


class SignatureRequestViewSet(viewsets.ModelViewSet):
    serializer_class = SignatureRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SignatureRequest.objects.filter(
            company=self.request.user.company
        ).select_related("document", "created_by").prefetch_related("signers__employee")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def add_signer(self, request, pk=None):
        signature_request = self.get_object()
        serializer = SignatureRequestSignerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(request=signature_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def sign(self, request, pk=None):
        signature_request = self.get_object()
        signature_data = request.data.get("signature_data", "")
        if not signature_data:
            return Response({"detail": "signature_data is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Find this user's employee record and their signer entry
        try:
            employee = request.user.employee_profile
        except Exception:
            return Response({"detail": "No employee profile linked to this user."}, status=status.HTTP_400_BAD_REQUEST)

        signer = signature_request.signers.filter(employee=employee, status="pending").first()
        if not signer:
            return Response({"detail": "No pending signature found for your account."}, status=status.HTTP_400_BAD_REQUEST)

        ip = request.META.get("REMOTE_ADDR")
        signer.signature_data = signature_data
        signer.signed_at = timezone.now()
        signer.ip_address = ip
        signer.status = "signed"
        signer.save()

        signature_request.update_status()
        return Response({"detail": "Document signed successfully.", "status": signature_request.status})
