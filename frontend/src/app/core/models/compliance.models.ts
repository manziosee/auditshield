export type ComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'exempt' | 'not_applicable';

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  authority: string;
  icon: string;
  order: number;
}

export interface ComplianceRequirement {
  id: string;
  category: string;
  category_name: string;
  title: string;
  description: string;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  deadline_day: number | null;
  is_mandatory: boolean;
  penalty_description: string;
}

export interface ComplianceRecord {
  id: string;
  requirement: string;
  requirement_title: string;
  requirement_frequency: string;
  category_name: string;
  authority: string;
  status: ComplianceStatus;
  period_start: string;
  period_end: string;
  due_date: string;
  completed_date: string | null;
  notes: string;
  is_overdue: boolean;
  created_at: string;
}

export interface ComplianceDashboard {
  score: number;
  compliant: number;
  pending: number;
  overdue: number;
  total: number;
}
