import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Report, ReportRequest } from '../models/report.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  list(params?: QueryParams): Observable<PaginatedResponse<Report>> {
    return this.api.getPaginated<Report>('reports/', params);
  }

  get(id: string): Observable<Report> {
    return this.api.get<Report>(`reports/${id}/`);
  }

  generate(data: ReportRequest): Observable<Report> {
    return this.api.post<Report>('reports/', data);
  }

  download(id: string): Observable<Blob> {
    return this.api.downloadBlob(`reports/${id}/download/`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`reports/${id}/`);
  }
}
