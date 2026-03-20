from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Vendor, VendorDocument
from .serializers import VendorSerializer, VendorDocumentSerializer


class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Vendor.objects.filter(
            company=self.request.user.company
        ).prefetch_related("vendor_documents")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=True, methods=["get"], url_path="compliance-summary")
    def compliance_summary(self, request, pk=None):
        vendor = self.get_object()
        docs = vendor.vendor_documents.all()
        return Response({
            "vendor_id": str(vendor.id),
            "vendor_name": vendor.name,
            "compliance_score": vendor.compliance_score,
            "total_documents": docs.count(),
            "valid": docs.filter(status="valid").count(),
            "expiring_soon": docs.filter(status="expiring_soon").count(),
            "expired": docs.filter(status="expired").count(),
            "missing": docs.filter(status="missing").count(),
        })


class VendorDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = VendorDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VendorDocument.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
