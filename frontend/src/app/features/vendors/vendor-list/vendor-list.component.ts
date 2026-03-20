import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Vendor {
  id: string;
  name: string;
  vendor_type: string;
  contact_name: string;
  contact_email: string;
  compliance_score: number;
  status: 'active' | 'suspended' | 'pending';
}

interface VendorStats {
  total: number;
  active: number;
  suspended: number;
  avg_score: number;
}

@Component({
  selector: 'as-vendor-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatMenuModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Vendors & Contractors</h2>
          <p class="subtitle">Manage vendor compliance and documentation</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> Add Vendor
        </button>
      </div>

      @if (showCreate()) {
        <div class="create-panel">
          <h3 class="create-panel-title">Add Vendor</h3>
          <div class="create-form">
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Vendor Name</mat-label>
              <input matInput [value]="newVendorName()" (input)="newVendorName.set($any($event.target).value)" placeholder="e.g. Acme Corp">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Vendor Type</mat-label>
              <mat-select [value]="newVendorType()" (valueChange)="newVendorType.set($event)">
                <mat-option value="supplier">Supplier</mat-option>
                <mat-option value="contractor">Contractor</mat-option>
                <mat-option value="consultant">Consultant</mat-option>
                <mat-option value="service_provider">Service Provider</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Contact Name</mat-label>
              <input matInput [value]="newContactName()" (input)="newContactName.set($any($event.target).value)" placeholder="Primary contact">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Contact Email</mat-label>
              <input matInput type="email" [value]="newContactEmail()" (input)="newContactEmail.set($any($event.target).value)" placeholder="contact@vendor.com">
            </mat-form-field>
          </div>
          <div class="create-actions">
            <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
            <button mat-raised-button class="btn-brand" (click)="addVendor()" [disabled]="creating() || !newVendorName().trim()">
              <mat-icon>business_center</mat-icon> {{ creating() ? 'Saving...' : 'Add Vendor' }}
            </button>
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#22c55e">business_center</mat-icon>
          <div class="stat-body">
            <span class="stat-num">{{ stats().total }}</span>
            <span class="stat-label">Total Vendors</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#16a34a">check_circle</mat-icon>
          <div class="stat-body">
            <span class="stat-num green">{{ stats().active }}</span>
            <span class="stat-label">Active</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon" style="color:#dc2626">block</mat-icon>
          <div class="stat-body">
            <span class="stat-num red">{{ stats().suspended }}</span>
            <span class="stat-label">Suspended</span>
          </div>
        </mat-card>
        <mat-card class="stat-card score-card">
          <div class="score-meter">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
              <circle cx="28" cy="28" r="22" fill="none" [attr.stroke]="scoreColor(stats().avg_score)"
                stroke-width="6" stroke-linecap="round"
                [attr.stroke-dasharray]="'138.23'"
                [attr.stroke-dashoffset]="138.23 - (138.23 * stats().avg_score / 100)"
                transform="rotate(-90 28 28)"/>
            </svg>
            <div class="score-value">{{ stats().avg_score }}</div>
          </div>
          <div class="stat-body">
            <span class="stat-label">Avg Compliance Score</span>
          </div>
        </mat-card>
      </div>

      <!-- Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="vendors()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Vendor</th>
              <td mat-cell *matCellDef="let v">
                <div class="vendor-cell">
                  <div class="vendor-dot">{{ v.name[0] }}</div>
                  <div>
                    <div class="vendor-name">{{ v.name }}</div>
                    <div class="vendor-contact">{{ v.contact_email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let v">
                <span class="type-chip">{{ v.vendor_type }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let v">{{ v.contact_name }}</td>
            </ng-container>
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Compliance Score</th>
              <td mat-cell *matCellDef="let v">
                <div class="score-cell">
                  <span class="score-num" [style.color]="scoreColor(v.compliance_score)">{{ v.compliance_score }}</span>
                  <mat-progress-bar mode="determinate" [value]="v.compliance_score" [class]="scoreBarClass(v.compliance_score)" />
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="chip" [class]="statusClass(v.status)">{{ v.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/vendors', v.id]"><mat-icon>visibility</mat-icon> View</button>
                  <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                  <button mat-menu-item class="danger-item"><mat-icon>block</mat-icon> Suspend</button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" [routerLink]="['/vendors', row.id]" class="clickable-row"></tr>
          </table>
        </div>
        @if (!loading() && vendors().length === 0) {
          <div class="empty-state">
            <mat-icon>business_center</mat-icon>
            <h3>No vendors yet</h3>
            <p>Add your first vendor to start tracking compliance.</p>
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
    .score-card { gap:12px; }
    .stat-icon { font-size:2rem; height:2rem; width:2rem; }
    .stat-body { display:flex; flex-direction:column; }
    .stat-num { font-size:1.6rem; font-weight:700; color:var(--text-primary); }
    .stat-num.green { color:#16a34a; }
    .stat-num.red { color:#dc2626; }
    .stat-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .score-meter { position:relative; width:56px; height:56px; flex-shrink:0; }
    .score-value { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700; color:var(--text-primary); }
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .vendor-cell { display:flex; align-items:center; gap:10px; }
    .vendor-dot { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .vendor-name { font-weight:600; font-size:0.875rem; }
    .vendor-contact { font-size:0.75rem; color:var(--text-muted); }
    .type-chip { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500; }
    .score-cell { display:flex; align-items:center; gap:10px; min-width:140px; }
    .score-num { font-weight:700; font-size:0.9rem; min-width:28px; }
    mat-progress-bar { flex:1; border-radius:4px; }
    .score-green { --mdc-linear-progress-active-indicator-color:#22c55e; }
    .score-amber { --mdc-linear-progress-active-indicator-color:#d97706; }
    .score-red { --mdc-linear-progress-active-indicator-color:#dc2626; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover td { background:var(--surface-2) !important; }
    .danger-item { color:#dc2626 !important; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:768px) { .stats-row { grid-template-columns:repeat(2,1fr); } }
    .create-panel { background:var(--surface-1); border:1px solid var(--brand); border-radius:16px; padding:24px; animation:slideDown 0.2s ease; }
    .create-panel-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:600; color:var(--text-primary); margin:0 0 16px; }
    .create-form { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .create-field { width:100%; }
    .create-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  `],
})
export class VendorListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  vendors         = signal<Vendor[]>([]);
  loading         = signal(false);
  stats           = signal<VendorStats>({ total: 0, active: 0, suspended: 0, avg_score: 0 });
  showCreate      = signal(false);
  creating        = signal(false);
  newVendorName   = signal('');
  newVendorType   = signal('');
  newContactName  = signal('');
  newContactEmail = signal('');

  columns = ['name', 'type', 'contact', 'score', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Vendor[] } | Vendor[]>('vendors/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Vendor[] }).results ?? [];
        this.vendors.set(list);
        const scores = list.map(v => v.compliance_score);
        this.stats.set({
          total: list.length,
          active: list.filter(v => v.status === 'active').length,
          suspended: list.filter(v => v.status === 'suspended').length,
          avg_score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load vendors.'); },
    });
  }

  addVendor(): void {
    if (!this.newVendorName().trim()) return;
    this.creating.set(true);
    this.api.post('vendors/', {
      name: this.newVendorName(),
      vendor_type: this.newVendorType() || 'other',
      contact_name: this.newContactName(),
      contact_email: this.newContactEmail(),
    }).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newVendorName.set('');
        this.newVendorType.set('');
        this.newContactName.set('');
        this.newContactEmail.set('');
        this.creating.set(false);
        this.load();
        this.notify.success('Vendor added.');
      },
      error: () => { this.creating.set(false); this.notify.error('Failed to add vendor.'); },
    });
  }

  scoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  scoreBarClass(score: number): string {
    if (score >= 80) return 'score-green';
    if (score >= 60) return 'score-amber';
    return 'score-red';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'chip chip-green', suspended: 'chip chip-red', pending: 'chip chip-amber',
    };
    return map[status] ?? 'chip';
  }
}
