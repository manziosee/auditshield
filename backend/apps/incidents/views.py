from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Incident, IncidentUpdate
from .serializers import IncidentSerializer, IncidentUpdateSerializer


class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Incident.objects.filter(
            company=self.request.user.company
        ).prefetch_related("updates", "employees_involved")
        sev = self.request.query_params.get("severity")
        stat = self.request.query_params.get("status")
        if sev:
            qs = qs.filter(severity=sev)
        if stat:
            qs = qs.filter(status=stat)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, reported_by=self.request.user)

    @action(detail=True, methods=["post"])
    def updates(self, request, pk=None):
        incident = self.get_object()
        serializer = IncidentUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(incident=incident, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        corrective = request.data.get("corrective_action", incident.corrective_action)
        incident.status = Incident.Status.RESOLVED
        incident.resolved_at = timezone.now()
        incident.corrective_action = corrective
        incident.save(update_fields=["status", "resolved_at", "corrective_action"])
        return Response({"detail": "Incident marked as resolved.", "resolved_at": str(incident.resolved_at)})
