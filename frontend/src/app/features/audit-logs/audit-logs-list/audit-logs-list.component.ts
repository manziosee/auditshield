import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuditLog } from '../../../core/models/audit-log.models';

@Component({
  selector: 'as-audit-logs-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Audit Trail</h2>
          <p class="subtitle">Immutable activity log — {{ total() }} entries</p>
        </div>
        <div class="header-note">
          <mat-icon>lock</mat-icon>
          <span>Read-only — entries cannot be modified or deleted</span>
        </div>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Filter by user or path</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="email, /api/path…" />
            <mat-icon matPrefix>search</mat-icon>
            @if (searchQuery) {
              <button mat-icon-button matSuffix type="button" (click)="searchQuery=''; onSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Method</mat-label>
            <mat-select [(ngModel)]="methodFilter" (ngModelChange)="loadLogs()">
              <mat-option value="">All Methods</mat-option>
              <mat-option value="POST">POST</mat-option>
              <mat-option value="PUT">PUT</mat-option>
              <mat-option value="PATCH">PATCH</mat-option>
              <mat-option value="DELETE">DELETE</mat-option>
              <mat-option value="GET">GET</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadLogs()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="2xx">Success (2xx)</mat-option>
              <mat-option value="4xx">Client Error (4xx)</mat-option>
              <mat-option value="5xx">Server Error (5xx)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="logs()">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Timestamp</th>
              <td mat-cell *matCellDef="let log">
                <span class="mono ts-text">{{ log.created_at | date:'medium' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let log">
                <div class="user-cell">
                  <span class="user-email">{{ log.user_email || 'Anonymous' }}</span>
                  <span class="ip-text mono">{{ log.ip_address || '' }}</span>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let log">
                <span class="method-badge" [class]="methodClass(log.method)">{{ log.method }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="path">
              <th mat-header-cell *matHeaderCellDef>Path</th>
              <td mat-cell *matCellDef="let log">
                <span class="mono path-text" [matTooltip]="log.path">{{ truncatePath(log.path) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status_code">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let log">
                <span class="status-code" [class]="statusCodeClass(log.status_code)">{{ log.status_code }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>Duration</th>
              <td mat-cell *matCellDef="let log">
                <span class="duration-text" [class.duration-slow]="log.duration_ms > 500">{{ log.duration_ms }}ms</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
        @if (!loading() && logs().length === 0) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <h3>No audit log entries</h3>
            <p>Activity will appear here as users interact with the system.</p>
          </div>
        }
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[25,50,100]"
          (page)="onPageChange($event)" showFirstLastButtons />
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }

    /* ── Header ─────────────────────────────────────────────────────────────── */
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; color:var(--text-primary); }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .header-note {
      display:flex; align-items:center; gap:6px;
      font-size:0.8rem; color:var(--text-muted);
      background:var(--surface-hover);
      padding:8px 14px; border-radius:8px;
      border:1px solid var(--border-color);
      flex-shrink:0;
    }
    .header-note mat-icon { font-size:16px; height:16px; width:16px; }

    /* ── Filters ─────────────────────────────────────────────────────────────── */
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-field { flex:1; min-width:220px; }

    /* ── Table ───────────────────────────────────────────────────────────────── */
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      background:color-mix(in srgb, var(--surface-card) 88%, transparent);
      backdrop-filter:blur(2px); z-index:10;
    }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }

    .mono { font-family:monospace; }
    .ts-text { font-size:0.8rem; color:var(--text-secondary); }

    .user-cell { display:flex; flex-direction:column; }
    .user-email { font-size:0.875rem; font-weight:500; color:var(--text-primary); }
    .ip-text { font-size:0.7rem; color:var(--text-faint); margin-top:2px; }

    /* Method badges — all use CSS variables for dark mode compat */
    .method-badge {
      display:inline-block; padding:3px 8px; border-radius:5px;
      font-size:0.7rem; font-weight:700; font-family:monospace; letter-spacing:0.03em;
    }
    .method-get     { background:var(--info-bg);    color:var(--info);    }
    .method-post    { background:var(--success-bg); color:var(--success); }
    .method-put,
    .method-patch   { background:var(--warning-bg); color:var(--warning); }
    .method-delete  { background:var(--danger-bg);  color:var(--danger);  }
    .method-default { background:var(--surface-hover); color:var(--text-muted); }

    /* Path */
    .path-text {
      font-size:0.8rem; color:var(--text-secondary);
      max-width:280px; display:inline-block;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      vertical-align:middle;
    }

    /* Status code badges */
    .status-code {
      display:inline-block; padding:3px 8px; border-radius:5px;
      font-size:0.8rem; font-weight:700; font-family:monospace;
    }
    .status-2xx   { background:var(--success-bg); color:var(--success); }
    .status-3xx   { background:var(--info-bg);    color:var(--info);    }
    .status-4xx   { background:var(--warning-bg); color:var(--warning); }
    .status-5xx   { background:var(--danger-bg);  color:var(--danger);  }
    .status-other { background:var(--surface-hover); color:var(--text-muted); }

    /* Duration */
    .duration-text { font-size:0.8rem; color:var(--text-muted); }
    .duration-slow { color:var(--warning); font-weight:600; }

    /* Empty state */
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); font-size:1rem; }
    .empty-state p { margin:0; }
  `],
})
export class AuditLogsListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  logs = signal<AuditLog[]>([]);
  total = signal(0);
  loading = signal(false);

  columns = ['timestamp', 'user', 'method', 'path', 'status_code', 'duration'];
  pageSize = 25;
  currentPage = 1;
  searchQuery = '';
  methodFilter = '';
  statusFilter = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void { this.loadLogs(); }

  loadLogs(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { page: this.currentPage, page_size: this.pageSize };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.methodFilter) params['method'] = this.methodFilter;
    if (this.statusFilter === '2xx') params['status_range'] = '2xx';
    if (this.statusFilter === '4xx') params['status_range'] = '4xx';
    if (this.statusFilter === '5xx') params['status_range'] = '5xx';

    this.api.getPaginated<AuditLog>('audit-logs/', params).subscribe({
      next: (res) => { this.logs.set(res.results); this.total.set(res.count); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load audit logs.'); },
    });
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadLogs(); }, 350);
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1; this.pageSize = e.pageSize; this.loadLogs();
  }

  methodClass(method: string): string {
    const map: Record<string, string> = {
      GET: 'method-get', POST: 'method-post',
      PUT: 'method-put', PATCH: 'method-patch', DELETE: 'method-delete',
    };
    return map[method] ?? 'method-default';
  }

  statusCodeClass(code: number): string {
    if (code >= 200 && code < 300) return 'status-2xx';
    if (code >= 300 && code < 400) return 'status-3xx';
    if (code >= 400 && code < 500) return 'status-4xx';
    if (code >= 500) return 'status-5xx';
    return 'status-other';
  }

  truncatePath(path: string): string {
    return path?.length > 50 ? path.slice(0, 47) + '…' : path;
  }
}
