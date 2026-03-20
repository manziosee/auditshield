import uuid
from django.conf import settings
from django.db import models
from core.models import TenantModel


class OnboardingTemplate(TenantModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    department = models.ForeignKey("employees.Department", null=True, blank=True, on_delete=models.SET_NULL)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "onboarding_templates"
        ordering = ["-is_default", "name"]

    def __str__(self):
        return self.name


class OnboardingTask(models.Model):
    class TaskType(models.TextChoices):
        DOCUMENT = "document", "Upload Document"
        FORM = "form", "Complete Form"
        TRAINING = "training", "Complete Training"
        SIGN = "sign", "Sign Document"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(OnboardingTemplate, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    task_type = models.CharField(max_length=20, choices=TaskType.choices, default=TaskType.OTHER)
    is_required = models.BooleanField(default=True)
    due_days = models.PositiveSmallIntegerField(default=7)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "onboarding_tasks"
        ordering = ["order"]

    def __str__(self):
        return self.title


class EmployeeOnboarding(TenantModel):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="onboardings")
    template = models.ForeignKey(OnboardingTemplate, on_delete=models.CASCADE)
    start_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    completion_percent = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "onboarding_employee_onboardings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee} — {self.template.name}"

    def recalculate_completion(self):
        total = self.task_completions.count()
        if total == 0:
            return
        done = self.task_completions.filter(completed=True).count()
        self.completion_percent = int((done / total) * 100)
        if self.completion_percent == 100:
            self.status = self.Status.COMPLETED
        elif self.completion_percent > 0:
            self.status = self.Status.IN_PROGRESS
        self.save(update_fields=["completion_percent", "status"])


class OnboardingTaskCompletion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    onboarding = models.ForeignKey(EmployeeOnboarding, on_delete=models.CASCADE, related_name="task_completions")
    task = models.ForeignKey(OnboardingTask, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "onboarding_task_completions"
        unique_together = ["onboarding", "task"]
