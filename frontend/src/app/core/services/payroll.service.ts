import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse, QueryParams } from '../models/api.models';

export interface TaxRule {
  id: string;
  country: string;
  rule_type: string;
  name: string;
  description: string;
  calc_type: string;
  rate: string;
  threshold: string;
  cap: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
}

export interface PayrollRun {
  id: string;
  company: string;
  period_start: string;
  period_end: string;
  status: string;
  total_gross: string;
  total_deductions: string;
  total_net: string;
  employee_count: number;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollLineItem {
  id: string;
  payroll_run: string;
  employee: string;
  employee_name?: string;
  gross_salary: string;
  tax_deductions: string;
  other_deductions: string;
  net_salary: string;
  payslip_url?: string;
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly api = inject(ApiService);

  listRuns(params?: QueryParams): Observable<PaginatedResponse<PayrollRun>> {
    return this.api.getPaginated<PayrollRun>('payroll/runs/', params);
  }

  getRun(id: string): Observable<PayrollRun> {
    return this.api.get<PayrollRun>(`payroll/runs/${id}/`);
  }

  createRun(data: Partial<PayrollRun>): Observable<PayrollRun> {
    return this.api.post<PayrollRun>('payroll/runs/', data);
  }

  updateRun(id: string, data: Partial<PayrollRun>): Observable<PayrollRun> {
    return this.api.patch<PayrollRun>(`payroll/runs/${id}/`, data);
  }

  deleteRun(id: string): Observable<void> {
    return this.api.delete<void>(`payroll/runs/${id}/`);
  }

  approveRun(id: string): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(`payroll/runs/${id}/approve/`, {});
  }

  generatePayslips(id: string): Observable<{ message: string; count: number }> {
    return this.api.post(`payroll/runs/${id}/generate_payslips/`, {});
  }

  listTaxRules(params?: QueryParams): Observable<PaginatedResponse<TaxRule>> {
    return this.api.getPaginated<TaxRule>('payroll/tax-rules/', params);
  }

  getTaxRule(id: string): Observable<TaxRule> {
    return this.api.get<TaxRule>(`payroll/tax-rules/${id}/`);
  }
}
