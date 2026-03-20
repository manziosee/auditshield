from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CertificationType, EmployeeCertification
from .serializers import CertificationTypeSerializer, EmployeeCertificationSerializer


class CertificationTypeViewSet(viewsets.ModelViewSet):
    serializer_class = CertificationTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CertificationType.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class EmployeeCertificationViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeCertificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmployeeCertification.objects.filter(
            company=self.request.user.company
        ).select_related("employee", "certification_type", "document")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    @action(detail=False, methods=["get"])
    def expiring(self, request):
        """Certifications expiring within the next 30 days."""
        from datetime import date, timedelta
        cutoff = date.today() + timedelta(days=30)
        qs = self.get_queryset().filter(expiry_date__lte=cutoff, expiry_date__gte=date.today())
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def missing(self, request):
        """Employees missing mandatory certifications."""
        from apps.employees.models import Employee
        mandatory_types = CertificationType.objects.filter(
            company=request.user.company, is_mandatory=True
        )
        employees = Employee.objects.filter(company=request.user.company, is_active=True)
        result = []
        for emp in employees:
            emp_cert_type_ids = emp.certifications.filter(
                company=request.user.company, status__in=["valid", "expiring_soon"]
            ).values_list("certification_type_id", flat=True)
            missing = mandatory_types.exclude(id__in=emp_cert_type_ids)
            if missing.exists():
                result.append({
                    "employee_id": str(emp.id),
                    "employee_name": f"{emp.first_name} {emp.last_name}",
                    "missing_certifications": list(missing.values("id", "name")),
                })
        return Response(result)
