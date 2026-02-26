def get_employee_compliance_score(employee) -> int:
    """
    Returns 0-100 compliance score for an employee based on required documents present.
    Required: Employment Contract, Social Insurance Number, Tax Identifier, Payslip (latest).
    """
    score = 0
    weights = {
        "has_contract": 40,
        "has_social_insurance": 20,
        "has_tax_id": 20,
        "has_payslip": 20,
    }
    from apps.documents.models import Document
    docs = employee.documents.filter(status=Document.Status.ACTIVE).values_list("document_type", flat=True)

    if Document.DocumentType.EMPLOYMENT_CONTRACT in docs:
        score += weights["has_contract"]
    if employee.social_insurance_number:
        score += weights["has_social_insurance"]
    if employee.tax_identifier:
        score += weights["has_tax_id"]
    if Document.DocumentType.PAYSLIP in docs:
        score += weights["has_payslip"]

    return score


def get_company_compliance_score(company) -> dict:
    """Returns overall compliance dashboard data for a company."""
    from .models import ComplianceRecord
    records = ComplianceRecord.objects.filter(company=company)
    total = records.count()
    if total == 0:
        return {"score": 0, "compliant": 0, "pending": 0, "overdue": 0, "total": 0}

    compliant = records.filter(status=ComplianceRecord.ComplianceStatus.COMPLIANT).count()
    overdue = records.filter(status=ComplianceRecord.ComplianceStatus.OVERDUE).count()
    pending = records.filter(status=ComplianceRecord.ComplianceStatus.PENDING).count()
    score = int((compliant / total) * 100)

    return {"score": score, "compliant": compliant, "pending": pending, "overdue": overdue, "total": total}
