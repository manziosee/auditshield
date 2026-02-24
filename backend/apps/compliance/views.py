from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ComplianceRecord, ComplianceRequirement
from .utils import get_company_compliance_score
from .serializers import ComplianceRecordSerializer, RequirementSerializer


class ComplianceDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_company_compliance_score(request.user.company)
        return Response(data)


class ComplianceRecordListView(generics.ListCreateAPIView):
    serializer_class = ComplianceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ComplianceRecord.objects.filter(company=request.user.company).select_related("requirement")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class ComplianceRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ComplianceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ComplianceRecord.objects.filter(company=self.request.user.company)


class RequirementListView(generics.ListAPIView):
    queryset = ComplianceRequirement.objects.select_related("category").all()
    serializer_class = RequirementSerializer
    permission_classes = [IsAuthenticated]
