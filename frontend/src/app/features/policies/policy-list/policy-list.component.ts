import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

type PolicyStatus = 'draft' | 'active' | 'archived';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  status: PolicyStatus;
  requires_acknowledgment: boolean;
  ack_count: number;
  total_employees: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'as-policy-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatMenuModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Policy Management</h2>
          <p class="subtitle">Manage company policies and track acknowledgments</p>
        </div>
        <button mat-raised-button class="btn-brand">
          <mat-icon>add</mat-icon> New Policy
        </button>
      </div>

      <!-- Status filter chips -->
      <div class="filter-chips">
        @for (f of filters; track f.value) {
          <button class="filter-chip" [class.active]="statusFilter() === f.value" (click)="statusFilter.set(f.value)">
            {{ f.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="40" /></div>
      }

      <div class="policies-grid">
        @for (policy of filtered(); track policy.id) {
          <mat-card class="policy-card" [class]="'policy-card--' + policy.status">
            <div class="card-top">
              <span class="category-badge">{{ policy.category }}</span>
              <span class="version-badge">v{{ policy.version }}</span>
              @if (policy.requires_acknowledgment) {
                <span class="ack-chip"><mat-icon class="ack-icon">how_to_reg</mat-icon>Requires Ack</span>
              }
              <span class="status-badge" [class]="statusClass(policy.status)">{{ policy.status | titlecase }}</span>
            </div>
            <h3 class="policy-title">{{ policy.title }}</h3>
            @if (policy.requires_acknowledgment) {
              <div class="ack-section">
                <div class="ack-label">
                  <span>Acknowledgments</span>
                  <span class="ack-fraction">{{ policy.ack_count }}/{{ policy.total_employees }}</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="ackPercent(policy)" class="ack-bar" />
              </div>
            }
            <div class="card-actions">
              <button mat-stroked-button class="action-btn" [routerLink]="['/policies', policy.id]">
                <mat-icon>visibility</mat-icon> View
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                @if (policy.status === 'draft') {
                  <button mat-menu-item (click)="publish(policy)"><mat-icon>publish</mat-icon> Publish</button>
                }
                @if (policy.status === 'active') {
                  <button mat-menu-item (click)="archive(policy)"><mat-icon>archive</mat-icon> Archive</button>
                }
                <button mat-menu-item [routerLink]="['/policies', policy.id]" [queryParams]="{tab:'acks'}">
                  <mat-icon>how_to_reg</mat-icon> View Acknowledgments
                </button>
              </mat-menu>
            </div>
          </mat-card>
        }
        @empty {
          @if (!loading()) {
            <div class="empty-state">
              <mat-icon>policy</mat-icon>
              <h3>No policies found</h3>
              <p>Create your first policy to get started.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
    .filter-chips { display:flex; gap:8px; flex-wrap:wrap; }
    .filter-chip { padding:6px 16px; border-radius:20px; border:1px solid var(--border-color); background:transparent; color:var(--text-secondary); font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.15s; font-family:'Plus Jakarta Sans',sans-serif; }
    .filter-chip:hover { border-color:#22c55e; color:#22c55e; }
    .filter-chip.active { background:rgba(34,197,94,0.12); border-color:#22c55e; color:#16a34a; font-weight:600; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .policies-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
    .policy-card { padding:20px !important; border-radius:16px !important; border:1px solid var(--border-color) !important; background:var(--surface-1) !important; display:flex; flex-direction:column; gap:12px; }
    .policy-card--draft { border-left:4px solid #d97706 !important; }
    .policy-card--active { border-left:4px solid #22c55e !important; }
    .policy-card--archived { border-left:4px solid #6b7280 !important; opacity:0.7; }
    .card-top { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .category-badge { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .version-badge { background:rgba(0,0,0,0.08); color:var(--text-secondary); padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:500; }
    .ack-chip { display:flex; align-items:center; gap:3px; background:rgba(59,130,246,0.1); color:#1d4ed8; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:500; }
    .ack-icon { font-size:0.85rem; height:0.85rem; width:0.85rem; }
    .status-badge { margin-left:auto; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .status-draft { background:#fef9c3; color:#a16207; }
    .status-active { background:#dcfce7; color:#16a34a; }
    .status-archived { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .policy-title { margin:0; font-size:1rem; font-weight:700; font-family:'Outfit',sans-serif; color:var(--text-primary); line-height:1.3; }
    .ack-section { display:flex; flex-direction:column; gap:6px; }
    .ack-label { display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); }
    .ack-fraction { font-weight:600; color:#22c55e; }
    .ack-bar { border-radius:4px; }
    .card-actions { display:flex; align-items:center; gap:8px; margin-top:auto; }
    .action-btn { font-size:0.8rem !important; color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .empty-state { grid-column:1/-1; text-align:center; padding:60px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:600px) { .policies-grid { grid-template-columns:1fr; } }
  `],
})
export class PolicyListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  policies     = signal<Policy[]>([]);
  loading      = signal(false);
  statusFilter = signal<string>('');

  filters = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ];

  filtered = computed(() => {
    const f = this.statusFilter();
    return f ? this.policies().filter(p => p.status === f) : this.policies();
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Policy[] } | Policy[]>('policies/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Policy[] }).results ?? [];
        this.policies.set(list);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load policies.'); },
    });
  }

  publish(policy: Policy): void {
    this.api.patch(`policies/${policy.id}/`, { status: 'active' }).subscribe({
      next: () => { this.notify.success('Policy published.'); this.load(); },
      error: () => this.notify.error('Failed to publish policy.'),
    });
  }

  archive(policy: Policy): void {
    this.api.patch(`policies/${policy.id}/`, { status: 'archived' }).subscribe({
      next: () => { this.notify.success('Policy archived.'); this.load(); },
      error: () => this.notify.error('Failed to archive policy.'),
    });
  }

  ackPercent(policy: Policy): number {
    if (!policy.total_employees) return 0;
    return Math.round((policy.ack_count / policy.total_employees) * 100);
  }

  statusClass(status: PolicyStatus): string {
    const map: Record<PolicyStatus, string> = {
      draft: 'status-badge status-draft',
      active: 'status-badge status-active',
      archived: 'status-badge status-archived',
    };
    return map[status] ?? 'status-badge';
  }
}
