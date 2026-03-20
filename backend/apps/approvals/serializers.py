from rest_framework import serializers
from .models import ApprovalWorkflow, ApprovalStep, ApprovalRequest, ApprovalDecision


class ApprovalStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalStep
        fields = ["id", "order", "approver_role", "label"]


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    steps = ApprovalStepSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalWorkflow
        fields = ["id", "name", "description", "workflow_type", "is_active", "steps", "created_at"]


class ApprovalDecisionSerializer(serializers.ModelSerializer):
    approver_name = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalDecision
        fields = ["id", "step", "approver", "approver_name", "decision", "comments", "decided_at"]
        read_only_fields = ["approver", "decided_at"]

    def get_approver_name(self, obj):
        return obj.approver.get_full_name() or obj.approver.email


class ApprovalRequestSerializer(serializers.ModelSerializer):
    decisions = ApprovalDecisionSerializer(many=True, read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    workflow_name = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRequest
        fields = [
            "id", "workflow", "workflow_name", "title", "object_type", "object_id",
            "status", "requested_by", "requested_by_name", "current_step",
            "decisions", "created_at"
        ]
        read_only_fields = ["requested_by", "status", "current_step"]

    def get_requested_by_name(self, obj):
        return obj.requested_by.get_full_name() or obj.requested_by.email

    def get_workflow_name(self, obj):
        return obj.workflow.name
