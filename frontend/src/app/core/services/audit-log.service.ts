import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuditLog } from '../models/audit-log.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(ApiService);

  list(params?: QueryParams): Observable<PaginatedResponse<AuditLog>> {
    return this.api.getPaginated<AuditLog>('audit-logs/', params);
  }
}
