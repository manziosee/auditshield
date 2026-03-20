from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Integration
from .serializers import IntegrationSerializer, INTEGRATION_CATALOG


class IntegrationViewSet(viewsets.ModelViewSet):
    serializer_class = IntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Integration.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=["get"])
    def available(self, request):
        """List all supported integration types with metadata."""
        company_integrations = {
            i.integration_type: i for i in self.get_queryset()
        }
        result = []
        for key, meta in INTEGRATION_CATALOG.items():
            existing = company_integrations.get(key)
            result.append({
                "type": key,
                "name": meta["name"],
                "description": meta["description"],
                "icon": meta["icon"],
                "config_fields": meta["config_fields"],
                "is_connected": existing is not None and existing.is_active,
                "integration_id": str(existing.id) if existing else None,
                "last_sync_at": existing.last_sync_at if existing else None,
                "sync_status": existing.sync_status if existing else "idle",
            })
        return Response(result)

    @action(detail=True, methods=["post"])
    def sync(self, request, pk=None):
        integration = self.get_object()
        from .tasks import sync_integration
        sync_integration.delay(str(integration.id))
        integration.sync_status = "syncing"
        integration.save(update_fields=["sync_status"])
        return Response({"detail": f"Sync started for {integration.get_integration_type_display()}."})
