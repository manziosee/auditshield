from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsCompanyAdmin, IsHROrAdmin

from .models import PayrollLineItem, PayrollRun, TaxRule
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

    @extend_schema(
        tags=["payroll"],
        summary="Variance check against previous run",
        description=(
            "Compares this payroll run's line items against the previous completed run. "
            "Flags:\n"
            "- **salary_spike**: gross salary change > 15%\n"
            "- **missing_from_run**: employee present in previous run but absent here\n"
            "- **new_employee**: employee present here but absent in previous run"
        ),
        responses={200: OpenApiResponse(description="Variance alert report")},
    )
    @action(detail=True, methods=["post"], url_path="variance-check")
    def variance_check(self, request, pk=None):
        run = self.get_object()

        # Find the previous completed/approved/paid run for this company
        prev_run = (
            PayrollRun.objects.filter(
                company=run.company,
                status__in=[
                    PayrollRun.Status.COMPLETED,
                    PayrollRun.Status.APPROVED,
                    PayrollRun.Status.PAID,
                ],
                period_start__lt=run.period_start,
            )
            .order_by("-period_start")
            .first()
        )

        if not prev_run:
            return Response({
                "run_id": str(run.id),
                "previous_run_id": None,
                "alerts": [],
                "alert_count": 0,
                "detail": "No previous completed run found for comparison.",
            })

        # Build employee → gross_salary maps
        current_items = {
            str(item.employee_id): item
            for item in run.line_items.select_related("employee")
        }
        prev_items = {
            str(item.employee_id): item
            for item in prev_run.line_items.select_related("employee")
        }

        alerts = []
        THRESHOLD = 0.15  # 15%

        # Check current run items against previous
        for emp_id, item in current_items.items():
            name = item.employee.full_name if hasattr(item.employee, "full_name") else str(item.employee_id)
            if emp_id in prev_items:
                prev_gross = float(prev_items[emp_id].gross_salary)
                curr_gross = float(item.gross_salary)
                if prev_gross > 0:
                    change_pct = round(((curr_gross - prev_gross) / prev_gross) * 100, 2)
                    if abs(change_pct) > THRESHOLD * 100:
                        alerts.append({
                            "employee_id": emp_id,
                            "name": name,
                            "alert_type": "salary_spike",
                            "previous": prev_gross,
                            "current": curr_gross,
                            "change_pct": change_pct,
                        })
            else:
                # New employee in this run
                alerts.append({
                    "employee_id": emp_id,
                    "name": name,
                    "alert_type": "new_employee",
                    "previous": None,
                    "current": float(item.gross_salary),
                    "change_pct": None,
                })

        # Employees in previous run but missing from current
        for emp_id, item in prev_items.items():
            if emp_id not in current_items:
                name = item.employee.full_name if hasattr(item.employee, "full_name") else str(item.employee_id)
                alerts.append({
                    "employee_id": emp_id,
                    "name": name,
                    "alert_type": "missing_from_run",
                    "previous": float(item.gross_salary),
                    "current": None,
                    "change_pct": None,
                })

        return Response({
            "run_id": str(run.id),
            "previous_run_id": str(prev_run.id),
            "alerts": alerts,
            "alert_count": len(alerts),
        })
