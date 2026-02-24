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
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter,
    OpenApiExample,
)
from drf_spectacular.types import OpenApiTypes

from .models import Employee, Department
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer,
    DepartmentSerializer, BulkImportSerializer,
)


class TenantQuerysetMixin:
    """Automatically scopes querysets to the current company."""
    def get_queryset(self):
        return self.queryset.filter(company=self.request.user.company)


@extend_schema_view(
    list=extend_schema(
        tags=["departments"],
        summary="List departments",
        description="Returns all departments within the authenticated user's company.",
    ),
    create=extend_schema(
        tags=["departments"],
        summary="Create a department",
    ),
    retrieve=extend_schema(
        tags=["departments"],
        summary="Get a department",
    ),
    update=extend_schema(
        tags=["departments"],
        summary="Update a department",
    ),
    partial_update=extend_schema(
        tags=["departments"],
        summary="Partially update a department",
    ),
    destroy=extend_schema(
        tags=["departments"],
        summary="Delete a department",
    ),
)
class DepartmentViewSet(TenantQuerysetMixin, ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)


@extend_schema_view(
    list=extend_schema(
        tags=["employees"],
        summary="List employees",
        description=(
            "Returns a paginated list of employees. Supports filtering, searching, and ordering.\n\n"
            "**Filters**: `employment_status`, `contract_type`, `department`, `is_active`\n"
            "**Search**: `first_name`, `last_name`, `employee_number`, `email`, `job_title`\n"
            "**Order by**: `hire_date`, `last_name`, `employee_number`"
        ),
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR, description="Search employees by name, number, email, or title"),
            OpenApiParameter("employment_status", OpenApiTypes.STR, description="Filter by status: active, on_leave, probation, terminated, resigned"),
            OpenApiParameter("contract_type", OpenApiTypes.STR, description="Filter by contract: permanent, fixed_term, internship, consultant, part_time"),
            OpenApiParameter("department", OpenApiTypes.UUID, description="Filter by department UUID"),
            OpenApiParameter("is_active", OpenApiTypes.BOOL, description="Filter active employees"),
            OpenApiParameter("ordering", OpenApiTypes.STR, description="Sort by: hire_date, last_name, employee_number (prefix - for desc)"),
        ],
    ),
    create=extend_schema(
        tags=["employees"],
        summary="Create an employee",
        description=(
            "Creates a new employee. The company is automatically set from the authenticated user.\n\n"
            "Will reject if your subscription's employee limit is reached."
        ),
    ),
    retrieve=extend_schema(
        tags=["employees"],
        summary="Get employee detail",
        description="Returns full employee profile including sensitive statutory fields (RSSB, TIN).",
    ),
    update=extend_schema(
        tags=["employees"],
        summary="Update employee",
    ),
    partial_update=extend_schema(
        tags=["employees"],
        summary="Partially update employee",
    ),
    destroy=extend_schema(
        tags=["employees"],
        summary="Delete employee",
        description="Permanently deletes the employee record and all associated documents.",
    ),
)
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
        count = Employee.objects.filter(company=company, is_active=True).count()
        if count >= company.employee_limit:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f"Employee limit ({company.employee_limit}) reached for your plan. Please upgrade."
            )
        serializer.save(company=company)

    @extend_schema(
        tags=["employees"],
        summary="Bulk import employees from Excel/CSV",
        description=(
            "Upload an Excel (`.xlsx`) or CSV file to import employees in bulk.\n\n"
            "**Required columns**: `first_name`, `last_name`, `job_title`, `hire_date`, `contract_type`\n\n"
            "**Optional columns**: `employee_number`, `email`, `phone`\n\n"
            "Returns a count of created records and any per-row errors."
        ),
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"},
                },
                "required": ["file"],
            }
        },
        responses={
            201: OpenApiResponse(
                description="Import completed. Returns `created` count and `errors` list.",
                examples=[
                    OpenApiExample(
                        "Success",
                        value={"created": 42, "errors": []},
                        response_only=True,
                    ),
                    OpenApiExample(
                        "Partial failure",
                        value={"created": 40, "errors": [{"row": 5, "error": "Invalid hire_date format"}]},
                        response_only=True,
                    ),
                ],
            ),
            400: OpenApiResponse(description="File parse error or missing required columns"),
        },
    )
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

    @extend_schema(
        tags=["employees"],
        summary="Export employees to Excel",
        description=(
            "Downloads all employees in the company as an Excel workbook (`.xlsx`).\n\n"
            "Includes: employee number, name, job title, status, contract type, "
            "hire date, email, phone, RSSB number, TIN number."
        ),
        responses={
            200: OpenApiResponse(
                description="Excel file download",
                response=bytes,
            ),
        },
    )
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
