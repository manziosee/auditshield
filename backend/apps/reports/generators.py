"""
PDF report generation using WeasyPrint + Django templates.
"""
import io
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from weasyprint import HTML


def build_report_pdf(report):
    """Render HTML template and save as PDF to the report.file field."""
    from apps.compliance.utils import get_company_compliance_score
    from apps.employees.models import Employee
    from apps.documents.models import Document

    company = report.company
    context = {
        "report": report,
        "company": company,
        "compliance": get_company_compliance_score(company),
        "employee_count": Employee.objects.filter(company=company, is_active=True).count(),
        "document_count": Document.objects.filter(company=company).count(),
        "expired_docs": Document.objects.filter(company=company, status=Document.Status.EXPIRED).count(),
        "employees": Employee.objects.filter(company=company, is_active=True).select_related("department"),
        "compliance_records": [],
    }

    if report.report_type == "audit_readiness":
        template_name = "reports/audit_readiness.html"
    elif report.report_type == "employee_summary":
        template_name = "reports/employee_summary.html"
    else:
        template_name = "reports/generic.html"

    html_string = render_to_string(template_name, context)
    pdf_bytes = HTML(string=html_string, base_url="/").write_pdf()

    filename = f"{report.report_type}_{report.id}.pdf"
    report.file.save(filename, ContentFile(pdf_bytes), save=False)
