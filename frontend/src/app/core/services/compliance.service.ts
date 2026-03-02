import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ComplianceRecord, ComplianceDashboard, ComplianceRequirement, ComplianceCategory } from '../models/compliance.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private readonly api = inject(ApiService);

  getDashboard(): Observable<ComplianceDashboard> {
    return this.api.get<ComplianceDashboard>('compliance/dashboard/');
  }

  listRecords(params?: QueryParams): Observable<PaginatedResponse<ComplianceRecord>> {
    return this.api.getPaginated<ComplianceRecord>('compliance/records/', params);
  }

  getRecord(id: string): Observable<ComplianceRecord> {
    return this.api.get<ComplianceRecord>(`compliance/records/${id}/`);
  }

  createRecord(data: Partial<ComplianceRecord>): Observable<ComplianceRecord> {
    return this.api.post<ComplianceRecord>('compliance/records/', data);
  }

  updateRecord(id: string, data: Partial<ComplianceRecord>): Observable<ComplianceRecord> {
    return this.api.patch<ComplianceRecord>(`compliance/records/${id}/`, data);
  }

  deleteRecord(id: string): Observable<void> {
    return this.api.delete<void>(`compliance/records/${id}/`);
  }

  listRequirements(params?: QueryParams): Observable<PaginatedResponse<ComplianceRequirement>> {
    return this.api.getPaginated<ComplianceRequirement>('compliance/requirements/', params);
  }

  listCategories(): Observable<ComplianceCategory[]> {
    return this.api.get<ComplianceCategory[]>('compliance/categories/');
  }
}
