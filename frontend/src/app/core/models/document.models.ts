export type DocumentType =
  | 'employment_contract' | 'contract_amendment' | 'nda'
  | 'tax_filing' | 'social_security_declaration' | 'payroll_tax_return' | 'vat_return'
  | 'tax_clearance' | 'operating_license' | 'insurance_certificate' | 'financial_statement'
  | 'payslip' | 'warning_letter' | 'leave_form' | 'termination_letter'
  | 'business_registration' | 'audit_report' | 'other';

export type DocumentStatus = 'pending' | 'active' | 'expired' | 'archived';

export interface Document {
  id: string;
  employee: string | null;
  employee_name: string;
  uploaded_by_name: string;
  title: string;
  document_type: DocumentType;
  file: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  description: string;
  tags: string[];
  status: DocumentStatus;
  expiry_date: string | null;
  issue_date: string | null;
  reference_number: string;
  ocr_processed: boolean;
  is_encrypted: boolean;
  checksum: string;
  is_expired: boolean;
  days_until_expiry: number | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface DocumentUpload {
  title: string;
  document_type: DocumentType;
  employee?: string;
  description?: string;
  tags?: string[];
  expiry_date?: string;
  issue_date?: string;
  reference_number?: string;
  period_start?: string;
  period_end?: string;
  file: File;
}
