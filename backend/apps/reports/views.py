from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.http import HttpResponse

from .models import Report
from .serializers import ReportSerializer
from .tasks import generate_report


class ReportViewSet(ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return Report.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        report = serializer.save(
            company=self.request.user.company,
            generated_by=self.request.user,
        )
        # Trigger async PDF generation
        generate_report.delay(str(report.id))

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        report = self.get_object()
        if not report.is_ready or not report.file:
            return Response({"detail": "Report is still being generated."}, status=status.HTTP_202_ACCEPTED)

        response = HttpResponse(report.file.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{report.title}.pdf"'
        return response
