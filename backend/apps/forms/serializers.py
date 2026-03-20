from rest_framework import serializers
from .models import FormTemplate, FormField, FormSubmission


class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = ["id", "label", "field_type", "is_required", "options", "order", "placeholder", "help_text"]


class FormTemplateSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = FormTemplate
        fields = ["id", "title", "description", "category", "is_active", "created_by", "fields", "submission_count", "created_at"]
        read_only_fields = ["created_by"]

    def get_submission_count(self, obj):
        return obj.submissions.count()


class FormSubmissionSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    template_title = serializers.SerializerMethodField()

    class Meta:
        model = FormSubmission
        fields = ["id", "template", "template_title", "employee", "employee_name", "submitted_by", "data", "submitted_at", "status"]
        read_only_fields = ["submitted_by", "submitted_at"]

    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return None

    def get_template_title(self, obj):
        return obj.template.title
