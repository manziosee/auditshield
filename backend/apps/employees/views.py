import io
import pandas as pd
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Employee, Department
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer,
    DepartmentSerializer, BulkImportSerializer,
)


class TenantQuerysetMixin:
    """Automatically scopes querysets to the current company."""
    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.company)


class DepartmentViewSet(TenantQuerysetMixin, ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


class EmployeeViewSet(TenantQuerysetMixin, ModelViewSet):
    queryset = Employee.objects.select_related("department").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["employment_status", "contract_type", "department", "is_active"]
    search_fields = ["first_name", "last_name", "employee_number", "email", "job_title"]
    ordering_fields = ["hire_date", "last_name", "employee_number"]
    ordering = ["last_name"]

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    def perform_create(self, serializer):
        company = self.request.user.company
        # Check subscription employee limit
        count = Employee.objects.filter(company=company, is_active=True).count()
        if count >= company.employee_limit:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f"Employee limit ({company.employee_limit}) reached for your plan. Please upgrade."
            )
        serializer.save(company=company)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def bulk_import(self, request):
        """Import employees from Excel/CSV."""
        serializer = BulkImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data["file"]
        try:
            if file.name.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file, engine="openpyxl")
        except Exception as e:
            return Response({"detail": f"Could not parse file: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        required_cols = {"first_name", "last_name", "job_title", "hire_date", "contract_type"}
        if not required_cols.issubset(set(df.columns.str.lower())):
            return Response(
                {"detail": f"Missing required columns: {required_cols}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company = request.user.company
        created, errors = [], []
        for i, row in df.iterrows():
            try:
                emp = Employee.objects.create(
                    company=company,
                    employee_number=row.get("employee_number") or f"EMP-{i+1:04d}",
                    first_name=str(row["first_name"]).strip(),
                    last_name=str(row["last_name"]).strip(),
                    job_title=str(row["job_title"]).strip(),
                    hire_date=pd.to_datetime(row["hire_date"]).date(),
                    contract_type=str(row["contract_type"]).lower(),
                    email=row.get("email", ""),
                    phone=row.get("phone", ""),
                )
                created.append(str(emp.id))
            except Exception as e:
                errors.append({"row": i + 2, "error": str(e)})

        return Response({"created": len(created), "errors": errors}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def export(self, request):
        """Export all employees to Excel."""
        employees = self.get_queryset().values(
            "employee_number", "first_name", "last_name", "job_title",
            "employment_status", "contract_type", "hire_date", "email",
            "phone", "rssb_number", "tin_number",
        )
        df = pd.DataFrame(list(employees))
        buf = io.BytesIO()
        df.to_excel(buf, index=False)
        buf.seek(0)

        from django.http import HttpResponse
        response = HttpResponse(
            buf.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="employees.xlsx"'
        return response
