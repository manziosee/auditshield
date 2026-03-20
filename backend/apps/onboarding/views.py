from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import OnboardingTemplate, EmployeeOnboarding, OnboardingTaskCompletion
from .serializers import OnboardingTemplateSerializer, EmployeeOnboardingSerializer


class OnboardingTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = OnboardingTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OnboardingTemplate.objects.filter(
            company=self.request.user.company
        ).prefetch_related("tasks")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class EmployeeOnboardingViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeOnboardingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EmployeeOnboarding.objects.filter(
            company=self.request.user.company
        ).select_related("employee", "template").prefetch_related("task_completions__task")

    def perform_create(self, serializer):
        onboarding = serializer.save(company=self.request.user.company)
        # Auto-create task completions for all tasks in template
        for task in onboarding.template.tasks.all():
            OnboardingTaskCompletion.objects.create(onboarding=onboarding, task=task)

    @action(detail=True, methods=["post"], url_path="complete-task")
    def complete_task(self, request, pk=None):
        onboarding = self.get_object()
        task_id = request.data.get("task_id")
        notes = request.data.get("notes", "")
        if not task_id:
            return Response({"detail": "task_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        completion = onboarding.task_completions.filter(task_id=task_id).first()
        if not completion:
            return Response({"detail": "Task not found in this onboarding."}, status=status.HTTP_404_NOT_FOUND)
        completion.completed = True
        completion.completed_at = timezone.now()
        completion.completed_by = request.user
        completion.notes = notes
        completion.save()
        onboarding.recalculate_completion()
        return Response({"detail": "Task marked as complete.", "completion_percent": onboarding.completion_percent})
