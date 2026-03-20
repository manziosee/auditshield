from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ApprovalWorkflow, ApprovalRequest, ApprovalDecision, ApprovalStep
from .serializers import ApprovalWorkflowSerializer, ApprovalRequestSerializer, ApprovalDecisionSerializer


class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ApprovalWorkflow.objects.filter(
            company=self.request.user.company
        ).prefetch_related("steps")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ApprovalRequest.objects.filter(
            company=self.request.user.company
        ).select_related("workflow", "requested_by").prefetch_related("decisions")
        stat = self.request.query_params.get("status")
        if stat:
            qs = qs.filter(status=stat)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, requested_by=self.request.user)

    @action(detail=True, methods=["post"])
    def decide(self, request, pk=None):
        approval_request = self.get_object()
        if approval_request.status != "pending":
            return Response({"detail": "Request is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)

        decision_value = request.data.get("decision")
        comments = request.data.get("comments", "")
        if decision_value not in ["approved", "rejected"]:
            return Response({"detail": "decision must be 'approved' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

        # Get current step
        steps = approval_request.workflow.steps.order_by("order")
        current_step = steps.filter(order=approval_request.current_step).first()
        if not current_step:
            return Response({"detail": "No step found for current order."}, status=status.HTTP_400_BAD_REQUEST)

        ApprovalDecision.objects.create(
            request=approval_request,
            step=current_step,
            approver=request.user,
            decision=decision_value,
            comments=comments,
        )

        if decision_value == "rejected":
            approval_request.status = "rejected"
            approval_request.save(update_fields=["status"])
            return Response({"detail": "Request rejected.", "status": "rejected"})

        # Advance to next step or complete
        next_step = steps.filter(order__gt=approval_request.current_step).first()
        if next_step:
            approval_request.current_step = next_step.order
            approval_request.save(update_fields=["current_step"])
            return Response({"detail": f"Approved step {current_step.order}. Moved to step {next_step.order}.", "status": "pending"})
        else:
            approval_request.status = "approved"
            approval_request.save(update_fields=["status"])
            return Response({"detail": "All steps approved. Request fully approved.", "status": "approved"})
