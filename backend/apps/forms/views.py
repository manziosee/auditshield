from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FormTemplate, FormField, FormSubmission
from .serializers import FormTemplateSerializer, FormFieldSerializer, FormSubmissionSerializer


class FormTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = FormTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FormTemplate.objects.filter(
            company=self.request.user.company
        ).prefetch_related("fields")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="add-field")
    def add_field(self, request, pk=None):
        template = self.get_object()
        serializer = FormFieldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(template=template)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["get"])
    def responses(self, request, pk=None):
        template = self.get_object()
        submissions = template.submissions.all()
        return Response(FormSubmissionSerializer(submissions, many=True).data)


class FormSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = FormSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FormSubmission.objects.filter(
            company=self.request.user.company
        ).select_related("template", "employee")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, submitted_by=self.request.user)
