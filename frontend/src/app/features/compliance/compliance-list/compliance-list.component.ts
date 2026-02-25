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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ComplianceRecord, ComplianceDashboard, ComplianceStatus } from '../../../core/models/compliance.models';
import { PaginatedResponse } from '../../../core/models/api.models';

@Component({
  selector: 'as-compliance-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatMenuModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule, MatDividerModule, MatDialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Compliance Tracker</h2>
          <p class="subtitle">RRA, RSSB &amp; Labour law obligations</p>
        </div>
      </div>

      <!-- Score cards -->
      @if (dashboard()) {
        <div class="score-row">
          <mat-card class="score-card score-main">
            <div class="score-circle" [class]="scoreClass(dashboard()!.score)">
              <span class="score-num">{{ dashboard()!.score }}</span>
              <span class="score-label">/ 100</span>
            </div>
            <p class="score-title">Compliance Score</p>
          </mat-card>
          <mat-card class="score-card">
            <mat-icon class="sc-icon icon-success">check_circle</mat-icon>
            <div class="sc-body">
              <span class="sc-num">{{ dashboard()!.compliant }}</span>
              <span class="sc-label">Compliant</span>
            </div>
          </mat-card>
          <mat-card class="score-card">
            <mat-icon class="sc-icon icon-warning">schedule</mat-icon>
            <div class="sc-body">
              <span class="sc-num">{{ dashboard()!.pending }}</span>
              <span class="sc-label">Pending</span>
            </div>
          </mat-card>
          <mat-card class="score-card">
            <mat-icon class="sc-icon icon-danger">error</mat-icon>
            <div class="sc-body">
              <span class="sc-num">{{ dashboard()!.overdue }}</span>
              <span class="sc-label">Overdue</span>
            </div>
          </mat-card>
          <mat-card class="score-card">
            <mat-icon class="sc-icon icon-neutral">list_alt</mat-icon>
            <div class="sc-body">
              <span class="sc-num">{{ dashboard()!.total }}</span>
              <span class="sc-label">Total</span>
            </div>
          </mat-card>
        </div>
      }

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search requirements</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Requirement title…" />
            <mat-icon matPrefix>search</mat-icon>
            @if (searchQuery) {
              <button mat-icon-button matSuffix type="button" (click)="searchQuery=''; onSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadRecords()">
              <mat-option value="">All</mat-option>
              <mat-option value="compliant">Compliant</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="overdue">Overdue</mat-option>
              <mat-option value="exempt">Exempt</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Authority</mat-label>
            <mat-select [(ngModel)]="authorityFilter" (ngModelChange)="loadRecords()">
              <mat-option value="">All</mat-option>
              <mat-option value="RRA">RRA</mat-option>
              <mat-option value="RSSB">RSSB</mat-option>
              <mat-option value="Labour">Labour</mat-option>
              <mat-option value="RDB">RDB</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="records()">
            <ng-container matColumnDef="authority">
              <th mat-header-cell *matHeaderCellDef>Authority</th>
              <td mat-cell *matCellDef="let r">
                <span class="authority-badge" [class]="authorityClass(r.authority)">{{ r.authority }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="requirement">
              <th mat-header-cell *matHeaderCellDef>Requirement</th>
              <td mat-cell *matCellDef="let r">
                <div class="req-name">{{ r.requirement_title }}</div>
                <div class="req-sub">{{ r.category_name }} · {{ formatFreq(r.requirement_frequency) }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef>Period</th>
              <td mat-cell *matCellDef="let r">
                <span class="text-sm">{{ r.period_start | date:'MMM y' }} – {{ r.period_end | date:'MMM y' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="due_date">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let r">
                <span [class.text-danger]="r.is_overdue" [class.text-warn]="!r.is_overdue && isDueSoon(r.due_date)">
                  {{ r.due_date | date:'mediumDate' }}
                  @if (r.is_overdue) { <span class="days-tag"> (Overdue)</span> }
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [class]="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="completed_date">
              <th mat-header-cell *matHeaderCellDef>Completed</th>
              <td mat-cell *matCellDef="let r">
                {{ r.completed_date ? (r.completed_date | date:'mediumDate') : '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="markStatus(r, 'compliant')">
                    <mat-icon>check_circle</mat-icon> Mark Compliant
                  </button>
                  <button mat-menu-item (click)="markStatus(r, 'pending')">
                    <mat-icon>schedule</mat-icon> Mark Pending
                  </button>
                  <button mat-menu-item (click)="markStatus(r, 'exempt')">
                    <mat-icon>block</mat-icon> Mark Exempt
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
        @if (!loading() && records().length === 0) {
          <div class="empty-state">
            <mat-icon>assignment_turned_in</mat-icon>
            <h3>No compliance records found</h3>
            <p>{{ hasFilters() ? 'Adjust your filters.' : 'Records will appear once requirements are configured.' }}</p>
          </div>
        }
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[10,25,50]"
          (page)="onPageChange($event)" showFirstLastButtons />
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    /* Score row */
    .score-row { display:grid; grid-template-columns:auto 1fr 1fr 1fr 1fr; gap:16px; }
    .score-card { padding:20px !important; display:flex; align-items:center; gap:16px; }
    .score-main { flex-direction:column; align-items:center; justify-content:center; min-width:130px; }
    .score-circle { display:flex; align-items:baseline; gap:4px; }
    .score-num { font-size:2.5rem; font-weight:800; }
    .score-label { font-size:1rem; color:#64748b; }
    .score-title { margin:4px 0 0; font-size:0.8rem; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
    .score-circle.green .score-num { color:#16a34a; }
    .score-circle.amber .score-num { color:#d97706; }
    .score-circle.red .score-num { color:#dc2626; }
    .sc-icon { font-size:2rem; height:2rem; width:2rem; }
    .sc-body { display:flex; flex-direction:column; }
    .sc-num { font-size:1.6rem; font-weight:700; color:#1e293b; }
    .sc-label { font-size:0.75rem; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
    .icon-success { color:#16a34a; }
    .icon-warning { color:#d97706; }
    .icon-danger { color:#dc2626; }
    .icon-neutral { color:#8b5cf6; }
    /* Filters */
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-field { flex:1; min-width:220px; }
    /* Table */
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .req-name { font-weight:500; font-size:0.875rem; }
    .req-sub { font-size:0.75rem; color:#64748b; }
    .text-sm { font-size:0.8rem; color:#64748b; }
    .authority-badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700; letter-spacing:0.05em; }
    .auth-rra { background:#fef9c3; color:#854d0e; }
    .auth-rssb { background:#dbeafe; color:#1e40af; }
    .auth-labour { background:#dcfce7; color:#14532d; }
    .auth-rdb { background:#f3e8ff; color:#6b21a8; }
    .auth-other { background:#f1f5f9; color:#475569; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-success { background:#dcfce7; color:#16a34a; }
    .chip-warning { background:#fef9c3; color:#a16207; }
    .chip-danger { background:#fee2e2; color:#dc2626; }
    .chip-neutral { background:#f1f5f9; color:#475569; }
    .chip-info { background:#dbeafe; color:#1d4ed8; }
    .text-danger { color:#dc2626; }
    .text-warn { color:#f59e0b; }
    .days-tag { font-size:0.75rem; }
    .empty-state { text-align:center; padding:48px 24px; color:#64748b; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:#1e293b; }
    .empty-state p { margin:0; }
    @media(max-width:900px){ .score-row{grid-template-columns:1fr 1fr;} }
    @media(max-width:600px){ .score-row{grid-template-columns:1fr 1fr;} }
  `],
})
export class ComplianceListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  records = signal<ComplianceRecord[]>([]);
  dashboard = signal<ComplianceDashboard | null>(null);
  total = signal(0);
  loading = signal(false);

  columns = ['authority', 'requirement', 'period', 'due_date', 'status', 'completed_date', 'actions'];
  pageSize = 25;
  currentPage = 1;
  searchQuery = '';
  statusFilter = '';
  authorityFilter = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadDashboard();
    this.loadRecords();
  }

  loadDashboard(): void {
    this.api.get<ComplianceDashboard>('compliance/dashboard/').subscribe({
      next: (d) => this.dashboard.set(d),
    });
  }

  loadRecords(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { page: this.currentPage, page_size: this.pageSize };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.statusFilter) params['status'] = this.statusFilter;
    if (this.authorityFilter) params['authority'] = this.authorityFilter;

    this.api.getPaginated<ComplianceRecord>('compliance/records/', params).subscribe({
      next: (res) => { this.records.set(res.results); this.total.set(res.count); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load compliance records.'); },
    });
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadRecords(); }, 350);
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1; this.pageSize = e.pageSize; this.loadRecords();
  }

  hasFilters(): boolean { return !!(this.searchQuery || this.statusFilter || this.authorityFilter); }

  markStatus(record: ComplianceRecord, status: ComplianceStatus): void {
    this.api.patch<ComplianceRecord>(`compliance/records/${record.id}/`, { status }).subscribe({
      next: () => {
        this.notify.success(`Marked as ${this.statusLabel(status)}.`);
        this.loadRecords();
        this.loadDashboard();
      },
      error: () => this.notify.error('Failed to update status.'),
    });
  }

  isDueSoon(dateStr: string): boolean {
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 14;
  }

  scoreClass(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 50) return 'amber';
    return 'red';
  }

  authorityClass(auth: string): string {
    const map: Record<string, string> = { RRA: 'auth-rra', RSSB: 'auth-rssb', Labour: 'auth-labour', RDB: 'auth-rdb' };
    return map[auth] ?? 'auth-other';
  }

  statusClass(s: ComplianceStatus): string {
    const map: Record<ComplianceStatus, string> = {
      compliant: 'chip chip-success', pending: 'chip chip-warning',
      overdue: 'chip chip-danger', exempt: 'chip chip-neutral', not_applicable: 'chip chip-info',
    };
    return map[s] ?? 'chip chip-neutral';
  }

  statusLabel(s: ComplianceStatus): string {
    const map: Record<ComplianceStatus, string> = {
      compliant: 'Compliant', pending: 'Pending', overdue: 'Overdue',
      exempt: 'Exempt', not_applicable: 'N/A',
    };
    return map[s] ?? s;
  }

  formatFreq(f: string): string {
    const map: Record<string, string> = {
      one_time: 'One-time', monthly: 'Monthly', quarterly: 'Quarterly',
      annually: 'Annual', as_needed: 'As needed',
    };
    return map[f] ?? f;
  }
}
