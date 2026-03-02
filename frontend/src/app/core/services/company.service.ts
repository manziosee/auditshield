import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Company {
  id: string;
  name: string;
  legal_name: string;
  registration_number: string;
  tax_id: string;
  company_type: string;
  country: string;
  country_name?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  subscription_plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyOnboarding {
  company_name: string;
  legal_name: string;
  registration_number: string;
  tax_id: string;
  company_type: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_password: string;
}

export interface CompanyExport {
  company: Company;
  employees: unknown[];
  documents: unknown[];
  compliance_records: unknown[];
  departments: unknown[];
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<Company> {
    return this.api.get<Company>('companies/me/');
  }

  updateProfile(data: Partial<Company>): Observable<Company> {
    return this.api.patch<Company>('companies/me/', data);
  }

  onboard(data: CompanyOnboarding): Observable<{ company: Company; user: unknown }> {
    return this.api.post('companies/onboard/', data);
  }

  register(data: CompanyOnboarding): Observable<{ company: Company; user: unknown }> {
    return this.api.post('auth/register/', data);
  }

  exportData(): Observable<CompanyExport> {
    return this.api.get<CompanyExport>('companies/export/');
  }
}
