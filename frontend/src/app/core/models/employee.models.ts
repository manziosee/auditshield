export type ContractType = 'permanent' | 'fixed_term' | 'internship' | 'consultant' | 'part_time';
export type EmploymentStatus = 'active' | 'on_leave' | 'probation' | 'terminated' | 'resigned';

export interface Department {
  id: string;
  name: string;
  description: string;
  employee_count: number;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  national_id: string;
  gender: 'M' | 'F' | 'O' | '';
  phone: string;
  email: string;
  address: string;
  photo: string | null;
  department: string | null;
  department_name: string;
  job_title: string;
  contract_type: ContractType;
  employment_status: EmploymentStatus;
  hire_date: string;
  contract_end_date: string | null;
  probation_end_date: string | null;
  gross_salary: string | null;
  currency: string;
  rssb_number: string;
  tin_number: string;
  is_active: boolean;
  compliance_score: number;
  created_at: string;
}
