from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsCompanyAdmin, IsHROrAdmin

from .models import PayrollRun, TaxRule
from .serializers import PayrollRunSerializer, TaxRuleSerializer
from .tasks import generate_payslip, process_payroll_run


class TaxRuleViewSet(viewsets.ReadOnlyModelViewSet):
    """Tax rules for the company's country (read-only — managed by platform admin)."""
    serializer_class = TaxRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        company = self.request.user.company
        if company and hasattr(company, "country") and company.country:
            return TaxRule.objects.filter(country=company.country, is_active=True)
        return TaxRule.objects.none()


class PayrollRunViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollRunSerializer
    permission_classes = [permissions.IsAuthenticated, IsHROrAdmin]

    def get_queryset(self):
        return PayrollRun.objects.filter(
            company=self.request.user.company
        ).prefetch_related("line_items__employee")

    def perform_create(self, serializer):
        run = serializer.save(
            company=self.request.user.company,
            processed_by=self.request.user,
        )
        process_payroll_run.delay(str(run.id))

    @action(detail=True, methods=["post"], permission_classes=[IsCompanyAdmin])
    def approve(self, request, pk=None):
        run = self.get_object()
        if run.status != PayrollRun.Status.COMPLETED:
            return Response(
                {"detail": "Only completed runs can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        run.status = PayrollRun.Status.APPROVED
        run.approved_by = request.user
        run.save(update_fields=["status", "approved_by"])
        return Response({"status": "approved"})

    @action(detail=True, methods=["post"])
    def generate_payslips(self, request, pk=None):
        run = self.get_object()
        if run.status not in (PayrollRun.Status.APPROVED, PayrollRun.Status.PAID):
            return Response(
                {"detail": "Payslips can only be generated for approved runs."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for item in run.line_items.filter(is_payslip_generated=False):
            generate_payslip.delay(str(item.id))
        return Response({"status": "payslip generation queued"})
