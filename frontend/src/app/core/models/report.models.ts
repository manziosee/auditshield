export type ReportType =
  | 'audit_readiness'
  | 'employee_summary'
  | 'compliance_status'
  | 'payroll_summary'
  | 'document_inventory'
  | 'rra_filing'
  | 'rssb_filing';

export interface Report {
  id: string;
  title: string;
  report_type: ReportType;
  generated_by: string | null;
  generated_by_name: string;
  period_start: string | null;
  period_end: string | null;
  is_ready: boolean;
  parameters: Record<string, unknown>;
  created_at: string;
}
