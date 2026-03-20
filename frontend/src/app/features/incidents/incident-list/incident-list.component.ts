import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

interface Incident {
  id: string;
  title: string;
  incident_type: string;
  severity: Severity;
  status: IncidentStatus;
  reported_at: string;
  assigned_to_name: string;
  description: string;
}

interface IncidentStats {
  open: number;
  investigating: number;
  resolved: number;
  critical: number;
}

@Component({
  selector: 'as-incident-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule,
    MatSelectModule, MatFormFieldModule, MatMenuModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Incident & Violation Log</h2>
          <p class="subtitle">Track and resolve compliance incidents</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> Report Incident
        </button>
      </div>

      @if (showCreate()) {
        <div class="create-panel">
          <h3 class="create-panel-title">Report Incident</h3>
          <div class="create-form">
            <mat-form-field appearance="outline" class="create-field create-field--full">
              <mat-label>Incident Title</mat-label>
              <input matInput [value]="newIncTitle()" (input)="newIncTitle.set($any($event.target).value)" placeholder="Brief summary of the incident">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Type</mat-label>
              <mat-select [value]="newIncType()" (valueChange)="newIncType.set($event)">
                <mat-option value="data_breach">Data Breach</mat-option>
                <mat-option value="policy_violation">Policy Violation</mat-option>
                <mat-option value="safety">Safety</mat-option>
                <mat-option value="financial">Financial</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Severity</mat-label>
              <mat-select [value]="newIncSeverity()" (valueChange)="newIncSeverity.set($event)">
                <mat-option value="critical">Critical</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="low">Low</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Incident Date</mat-label>
              <input matInput type="date" [value]="newIncDate()" (input)="newIncDate.set($any($event.target).value)">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field create-field--full">
              <mat-label>Description</mat-label>
              <textarea matInput rows="3" [value]="newIncDesc()" (input)="newIncDesc.set($any($event.target).value)" placeholder="Describe what happened..."></textarea>
            </mat-form-field>
          </div>
          <div class="create-actions">
            <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
            <button mat-raised-button class="btn-brand" (click)="reportIncident()" [disabled]="creating() || !newIncTitle().trim()">
              <mat-icon>warning</mat-icon> {{ creating() ? 'Submitting...' : 'Submit Report' }}
            </button>
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#f59e0b">folder_open</mat-icon>
          <div class="stat-body">
            <span class="stat-num amber">{{ stats().open }}</span>
            <span class="stat-label">Open</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#3b82f6">search</mat-icon>
          <div class="stat-body">
            <span class="stat-num blue">{{ stats().investigating }}</span>
            <span class="stat-label">Investigating</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#22c55e">check_circle</mat-icon>
          <div class="stat-body">
            <span class="stat-num green">{{ stats().resolved }}</span>
            <span class="stat-label">Resolved</span>
          </div>
        </mat-card>
        <mat-card class="stat-card stat-card--critical">
          <mat-icon class="stat-icon" style="color:#dc2626">priority_high</mat-icon>
          <div class="stat-body">
            <span class="stat-num red">{{ stats().critical }}</span>
            <span class="stat-label">Critical</span>
          </div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="open">Open</mat-option>
              <mat-option value="investigating">Investigating</mat-option>
              <mat-option value="resolved">Resolved</mat-option>
              <mat-option value="closed">Closed</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Severity</mat-label>
            <mat-select [(ngModel)]="severityFilter" (ngModelChange)="applyFilters()">
              <mat-option value="">All Severities</mat-option>
              <mat-option value="critical">Critical</mat-option>
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="low">Low</mat-option>
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
          <table mat-table [dataSource]="filtered()">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Incident</th>
              <td mat-cell *matCellDef="let i">
                <div class="inc-title">{{ i.title }}</div>
                <div class="inc-desc">{{ i.description | slice:0:80 }}{{ i.description?.length > 80 ? '…' : '' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let i">
                <span class="type-chip">{{ i.incident_type }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let i">
                <span class="sev-badge" [class]="severityClass(i.severity)">{{ i.severity | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let i">
                <span class="chip" [class]="statusChipClass(i.status)">{{ i.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let i">{{ i.reported_at | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="assigned">
              <th mat-header-cell *matHeaderCellDef>Assigned To</th>
              <td mat-cell *matCellDef="let i">{{ i.assigned_to_name || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let i" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/incidents', i.id]"><mat-icon>visibility</mat-icon> View</button>
                  <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" [routerLink]="['/incidents', row.id]" class="clickable-row"></tr>
          </table>
        </div>
        @if (!loading() && filtered().length === 0) {
          <div class="empty-state">
            <mat-icon>warning_amber</mat-icon>
            <h3>No incidents found</h3>
            <p>No incidents match your current filters.</p>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .stat-card { padding:18px 20px !important; display:flex; align-items:center; gap:14px; }
    .stat-card--critical { border-left:3px solid #dc2626 !important; }
    .stat-icon { font-size:2rem; height:2rem; width:2rem; }
    .stat-body { display:flex; flex-direction:column; }
    .stat-num { font-size:1.6rem; font-weight:700; color:var(--text-primary); }
    .stat-num.amber { color:#d97706; }
    .stat-num.blue { color:#3b82f6; }
    .stat-num.green { color:#16a34a; }
    .stat-num.red { color:#dc2626; }
    .stat-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; min-height:100px; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .inc-title { font-weight:600; font-size:0.875rem; }
    .inc-desc { font-size:0.75rem; color:var(--text-muted); }
    .type-chip { background:rgba(34,197,94,0.08); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500; }
    .sev-badge { display:inline-block; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; }
    .sev-critical { background:rgba(239,68,68,0.12); color:#f87171; }
    .sev-high { background:#ffedd5; color:#ea580c; }
    .sev-medium { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .sev-low { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .chip-blue { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-neutral { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover td { background:var(--surface-2) !important; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:768px) { .stats-row { grid-template-columns:repeat(2,1fr); } }
    .create-panel { background:var(--surface-1); border:1px solid var(--brand); border-radius:16px; padding:24px; animation:slideDown 0.2s ease; }
    .create-panel-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:600; color:var(--text-primary); margin:0 0 16px; }
    .create-form { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .create-field { width:100%; }
    .create-field--full { grid-column:1/-1; }
    .create-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  `],
})
export class IncidentListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  incidents      = signal<Incident[]>([]);
  loading        = signal(false);
  statusFilter   = '';
  severityFilter = '';
  stats          = signal<IncidentStats>({ open: 0, investigating: 0, resolved: 0, critical: 0 });
  showCreate     = signal(false);
  creating       = signal(false);
  newIncTitle    = signal('');
  newIncType     = signal('');
  newIncSeverity = signal('medium');
  newIncDate     = signal('');
  newIncDesc     = signal('');

  filtered = computed(() => {
    let list = this.incidents();
    if (this.statusFilter)   list = list.filter(i => i.status === this.statusFilter);
    if (this.severityFilter) list = list.filter(i => i.severity === this.severityFilter);
    return list;
  });

  columns = ['title', 'type', 'severity', 'status', 'date', 'assigned', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Incident[] } | Incident[]>('incidents/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Incident[] }).results ?? [];
        this.incidents.set(list);
        this.stats.set({
          open: list.filter(i => i.status === 'open').length,
          investigating: list.filter(i => i.status === 'investigating').length,
          resolved: list.filter(i => i.status === 'resolved').length,
          critical: list.filter(i => i.severity === 'critical').length,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load incidents.'); },
    });
  }

  applyFilters(): void { /* computed() re-evaluates automatically */ }

  reportIncident(): void {
    if (!this.newIncTitle().trim()) return;
    this.creating.set(true);
    this.api.post('incidents/', {
      title: this.newIncTitle(),
      incident_type: this.newIncType() || 'other',
      severity: this.newIncSeverity() || 'medium',
      incident_date: this.newIncDate() || null,
      description: this.newIncDesc(),
    }).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newIncTitle.set('');
        this.newIncType.set('');
        this.newIncSeverity.set('medium');
        this.newIncDate.set('');
        this.newIncDesc.set('');
        this.creating.set(false);
        this.load();
        this.notify.success('Incident reported.');
      },
      error: () => { this.creating.set(false); this.notify.error('Failed to report incident.'); },
    });
  }

  severityClass(s: Severity): string {
    const map: Record<Severity, string> = {
      critical: 'sev-badge sev-critical', high: 'sev-badge sev-high',
      medium: 'sev-badge sev-medium', low: 'sev-badge sev-low',
    };
    return map[s] ?? 'sev-badge';
  }

  statusChipClass(s: IncidentStatus): string {
    const map: Record<IncidentStatus, string> = {
      open: 'chip chip-amber', investigating: 'chip chip-blue',
      resolved: 'chip chip-green', closed: 'chip chip-neutral',
    };
    return map[s] ?? 'chip';
  }
}
