import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Certification {
  id: string;
  employee_name: string;
  cert_type: string;
  issued_date: string;
  expiry_date: string;
  status: 'valid' | 'expired' | 'expiring_soon';
  days_remaining: number;
}

interface CertType {
  id: string;
  name: string;
  description: string;
  validity_months: number;
  cert_count: number;
}

@Component({
  selector: 'as-training-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatTableModule, MatMenuModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Training & Certifications</h2>
          <p class="subtitle">Track employee certifications and training records</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> Add Certification
        </button>
      </div>

      @if (showCreate()) {
        <div class="create-panel">
          <h3 class="create-panel-title">Add Certification</h3>
          <div class="create-form">
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Employee Name or Email</mat-label>
              <input matInput [value]="newEmployeeId()" (input)="newEmployeeId.set($any($event.target).value)" placeholder="Search employee...">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Certification Type</mat-label>
              <mat-select [value]="newCertTypeId()" (valueChange)="newCertTypeId.set($event)">
                @for (t of certTypes(); track t.id) {
                  <mat-option [value]="t.id">{{ t.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Issue Date</mat-label>
              <input matInput type="date" [value]="newIssueDate()" (input)="newIssueDate.set($any($event.target).value)">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Expiry Date</mat-label>
              <input matInput type="date" [value]="newExpiryDate()" (input)="newExpiryDate.set($any($event.target).value)">
            </mat-form-field>
          </div>
          <div class="create-actions">
            <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
            <button mat-raised-button class="btn-brand" (click)="addCertification()" [disabled]="creating() || !newEmployeeId().trim()">
              <mat-icon>workspace_premium</mat-icon> {{ creating() ? 'Saving...' : 'Add Certification' }}
            </button>
          </div>
        </div>
      }

      <mat-tab-group class="tabs" animationDuration="200ms">
        <!-- Certifications Tab -->
        <mat-tab label="Certifications">
          @if (loading()) {
            <div class="center-spin"><mat-spinner diameter="40" /></div>
          }
          @if (!loading()) {
            <div class="table-wrapper">
              <table mat-table [dataSource]="certs()">
                <ng-container matColumnDef="employee">
                  <th mat-header-cell *matHeaderCellDef>Employee</th>
                  <td mat-cell *matCellDef="let c">
                    <div class="emp-cell">
                      <div class="emp-dot">{{ c.employee_name[0] }}</div>
                      {{ c.employee_name }}
                    </div>
                  </td>
                </ng-container>
                <ng-container matColumnDef="cert_type">
                  <th mat-header-cell *matHeaderCellDef>Certification</th>
                  <td mat-cell *matCellDef="let c"><strong>{{ c.cert_type }}</strong></td>
                </ng-container>
                <ng-container matColumnDef="issued">
                  <th mat-header-cell *matHeaderCellDef>Issued</th>
                  <td mat-cell *matCellDef="let c">{{ c.issued_date | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="expiry">
                  <th mat-header-cell *matHeaderCellDef>Expiry</th>
                  <td mat-cell *matCellDef="let c">{{ c.expiry_date | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="chip" [class]="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let c" (click)="$event.stopPropagation()">
                    <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                      <button mat-menu-item><mat-icon>download</mat-icon> Download</button>
                      <button mat-menu-item class="danger-item"><mat-icon>delete</mat-icon> Delete</button>
                    </mat-menu>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="certColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: certColumns;"></tr>
              </table>
            </div>
          }
        </mat-tab>

        <!-- Types Tab -->
        <mat-tab label="Types">
          <div class="types-grid">
            @for (t of certTypes(); track t.id) {
              <mat-card class="type-card">
                <div class="type-icon-wrap"><mat-icon>workspace_premium</mat-icon></div>
                <div class="type-info">
                  <div class="type-name">{{ t.name }}</div>
                  <div class="type-desc">{{ t.description }}</div>
                  <div class="type-meta">
                    <span>{{ t.validity_months }} months validity</span>
                    <span class="cert-count-badge">{{ t.cert_count }} certs</span>
                  </div>
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Expiring Soon Tab -->
        <mat-tab label="Expiring Soon">
          <div class="expiring-list">
            @for (c of expiringSoon(); track c.id) {
              <mat-card class="expiring-card" [class]="urgencyClass(c.days_remaining)">
                <div class="exp-left">
                  <div class="emp-avatar">{{ initials(c.employee_name) }}</div>
                  <div>
                    <div class="exp-name">{{ c.employee_name }}</div>
                    <div class="exp-cert">{{ c.cert_type }}</div>
                  </div>
                </div>
                <div class="exp-right">
                  <div class="days-badge" [class]="daysBadgeClass(c.days_remaining)">
                    {{ c.days_remaining <= 0 ? 'Expired' : c.days_remaining + ' days left' }}
                  </div>
                  <div class="exp-date">{{ c.expiry_date | date:'mediumDate' }}</div>
                </div>
              </mat-card>
            }
            @empty {
              <div class="empty-state">
                <mat-icon>verified</mat-icon>
                <p>No certifications expiring soon</p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .tabs { background:var(--surface-1); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .emp-cell { display:flex; align-items:center; gap:8px; }
    .emp-dot { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .danger-item { color:#dc2626 !important; }
    .types-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px; padding:20px; }
    .type-card { padding:16px !important; display:flex; gap:12px; align-items:flex-start; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .type-icon-wrap { width:40px; height:40px; border-radius:10px; background:rgba(34,197,94,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .type-icon-wrap mat-icon { color:#22c55e; }
    .type-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .type-desc { font-size:0.78rem; color:var(--text-muted); margin:2px 0 8px; }
    .type-meta { display:flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--text-muted); }
    .cert-count-badge { background:rgba(34,197,94,0.1); color:#16a34a; padding:1px 8px; border-radius:10px; font-weight:500; }
    .expiring-list { display:flex; flex-direction:column; gap:10px; padding:20px; }
    .expiring-card { padding:14px 18px !important; display:flex; align-items:center; justify-content:space-between; border-radius:12px !important; border-left:4px solid !important; }
    .urgency-red { border-color:#dc2626 !important; }
    .urgency-amber { border-color:#d97706 !important; }
    .urgency-green { border-color:#22c55e !important; }
    .exp-left { display:flex; align-items:center; gap:12px; }
    .emp-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .exp-name { font-weight:600; font-size:0.875rem; color:var(--text-primary); }
    .exp-cert { font-size:0.78rem; color:var(--text-muted); }
    .exp-right { text-align:right; }
    .days-badge { font-size:0.85rem; font-weight:700; padding:3px 10px; border-radius:12px; }
    .days-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .days-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .days-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .exp-date { font-size:0.75rem; color:var(--text-muted); margin-top:4px; }
    .empty-state { text-align:center; padding:48px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 8px; }
    .create-panel { background:var(--surface-1); border:1px solid var(--brand); border-radius:16px; padding:24px; animation:slideDown 0.2s ease; }
    .create-panel-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:600; color:var(--text-primary); margin:0 0 16px; }
    .create-form { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .create-field { width:100%; }
    .create-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  `],
})
export class TrainingListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  certs        = signal<Certification[]>([]);
  certTypes    = signal<CertType[]>([]);
  expiringSoon = signal<Certification[]>([]);
  loading      = signal(false);
  showCreate   = signal(false);
  creating     = signal(false);
  newEmployeeId = signal('');
  newCertTypeId = signal('');
  newIssueDate  = signal('');
  newExpiryDate = signal('');

  certColumns = ['employee', 'cert_type', 'issued', 'expiry', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Certification[] } | Certification[]>('training/certifications/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Certification[] }).results ?? [];
        this.certs.set(list);
        this.expiringSoon.set(list.filter(c => c.status === 'expiring_soon' || c.status === 'expired').sort((a, b) => a.days_remaining - b.days_remaining));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load certifications.'); },
    });
    this.api.get<{ results: CertType[] } | CertType[]>('training/types/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: CertType[] }).results ?? [];
        this.certTypes.set(list);
      },
      error: () => {},
    });
  }

  addCertification(): void {
    if (!this.newEmployeeId().trim()) return;
    this.creating.set(true);
    this.api.post('training/certifications/', {
      employee_id: this.newEmployeeId(),
      cert_type_id: this.newCertTypeId() || null,
      issued_date: this.newIssueDate() || null,
      expiry_date: this.newExpiryDate() || null,
    }).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newEmployeeId.set('');
        this.newCertTypeId.set('');
        this.newIssueDate.set('');
        this.newExpiryDate.set('');
        this.creating.set(false);
        this.load();
        this.notify.success('Certification added.');
      },
      error: () => { this.creating.set(false); this.notify.error('Failed to add certification.'); },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = { valid: 'chip chip-green', expired: 'chip chip-red', expiring_soon: 'chip chip-amber' };
    return map[status] ?? 'chip';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { valid: 'Valid', expired: 'Expired', expiring_soon: 'Expiring Soon' };
    return map[status] ?? status;
  }

  urgencyClass(days: number): string {
    if (days <= 7) return 'urgency-red';
    if (days <= 30) return 'urgency-amber';
    return 'urgency-green';
  }

  daysBadgeClass(days: number): string {
    if (days <= 7) return 'days-badge days-red';
    if (days <= 30) return 'days-badge days-amber';
    return 'days-badge days-green';
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
