from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsSuperAdmin
from .models import Partner, PartnerBranding, PartnerCompany
from .serializers import PartnerSerializer, PartnerBrandingSerializer, PartnerCompanySerializer


class PartnerViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Partner.objects.prefetch_related("branding", "partner_companies")

    @action(detail=True, methods=["get", "put", "patch"])
    def branding(self, request, pk=None):
        partner = self.get_object()
        if request.method == "GET":
            try:
                b = partner.branding
            except PartnerBranding.DoesNotExist:
                return Response({})
            return Response(PartnerBrandingSerializer(b).data)
        branding, _ = PartnerBranding.objects.get_or_create(partner=partner)
        serializer = PartnerBrandingSerializer(branding, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def companies(self, request, pk=None):
        partner = self.get_object()
        links = partner.partner_companies.select_related("company")
        return Response(PartnerCompanySerializer(links, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[], url_path="by-slug/(?P<slug>[^/.]+)")
    def by_slug(self, request, slug=None):
        """Public endpoint — returns branding config by partner slug."""
        try:
            partner = Partner.objects.get(slug=slug, is_active=True)
            branding = partner.branding
            return Response(PartnerBrandingSerializer(branding).data)
        except (Partner.DoesNotExist, PartnerBranding.DoesNotExist):
            return Response({"primary_color": "#22c55e", "platform_name": "AuditShield"})
