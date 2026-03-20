from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Policy, PolicyAcknowledgment
from .serializers import PolicySerializer, PolicyAcknowledgmentSerializer


class PolicyViewSet(viewsets.ModelViewSet):
    serializer_class = PolicySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Policy.objects.filter(company=self.request.user.company)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        policy = self.get_object()
        if policy.status == Policy.Status.ACTIVE:
            return Response({"detail": "Policy is already published."}, status=status.HTTP_400_BAD_REQUEST)
        policy.status = Policy.Status.ACTIVE
        policy.published_at = timezone.now()
        if policy.status == Policy.Status.ARCHIVED:
            policy.version += 1
        policy.save(update_fields=["status", "published_at", "version"])
        return Response(PolicySerializer(policy).data)

    @action(detail=True, methods=["get"], url_path="acknowledgment-status")
    def acknowledgment_status(self, request, pk=None):
        policy = self.get_object()
        from apps.employees.models import Employee
        total_employees = Employee.objects.filter(company=request.user.company, is_active=True).count()
        acknowledged = policy.acknowledgments.count()
        return Response({
            "total_employees": total_employees,
            "acknowledged": acknowledged,
            "pending": total_employees - acknowledged,
            "percent": round((acknowledged / total_employees * 100) if total_employees else 0, 1),
            "acknowledgments": PolicyAcknowledgmentSerializer(policy.acknowledgments.all(), many=True).data,
        })

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        policy = self.get_object()
        try:
            employee = request.user.employee_profile
        except Exception:
            return Response({"detail": "No employee profile linked to your account."}, status=status.HTTP_400_BAD_REQUEST)
        ack, created = PolicyAcknowledgment.objects.get_or_create(
            policy=policy,
            employee=employee,
            defaults={"company": request.user.company, "ip_address": request.META.get("REMOTE_ADDR")}
        )
        if not created:
            return Response({"detail": "You have already acknowledged this policy."}, status=status.HTTP_409_CONFLICT)
        return Response({"detail": "Policy acknowledged.", "acknowledged_at": str(ack.acknowledged_at)})
