from rest_framework import serializers
from .models import OnboardingTemplate, OnboardingTask, EmployeeOnboarding, OnboardingTaskCompletion


class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTask
        fields = ["id", "title", "description", "task_type", "is_required", "due_days", "order"]


class OnboardingTemplateSerializer(serializers.ModelSerializer):
    tasks = OnboardingTaskSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingTemplate
        fields = ["id", "name", "description", "department", "is_default", "tasks", "task_count", "created_at"]

    def get_task_count(self, obj):
        return obj.tasks.count()


class OnboardingTaskCompletionSerializer(serializers.ModelSerializer):
    task_title = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingTaskCompletion
        fields = ["id", "task", "task_title", "completed", "completed_at", "completed_by", "notes"]
        read_only_fields = ["completed_at", "completed_by"]

    def get_task_title(self, obj):
        return obj.task.title


class EmployeeOnboardingSerializer(serializers.ModelSerializer):
    task_completions = OnboardingTaskCompletionSerializer(many=True, read_only=True)
    employee_name = serializers.SerializerMethodField()
    template_name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeOnboarding
        fields = [
            "id", "employee", "employee_name", "template", "template_name",
            "start_date", "status", "completion_percent", "task_completions", "created_at"
        ]
        read_only_fields = ["status", "completion_percent"]

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_template_name(self, obj):
        return obj.template.name
