import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface ApprovalRequest {
  id: string;
  title: string;
  request_type: string;
  requested_by_name: string;
  requested_by_avatar?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  trigger_type: string;
  steps_count: number;
  is_active: boolean;
}

@Component({
  selector: 'as-approval-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Approval Workflows</h2>
          <p class="subtitle">Review and manage approval requests</p>
        </div>
        @if (pendingCount() > 0) {
          <div class="pending-badge">
            <mat-icon>pending_actions</mat-icon>
            {{ pendingCount() }} pending
          </div>
        }
      </div>

      <mat-tab-group class="tabs" animationDuration="200ms">
        <!-- Pending Tab -->
        <mat-tab [label]="'Pending (' + pendingCount() + ')'">
          @if (loading()) {
            <div class="center-spin"><mat-spinner diameter="40" /></div>
          }
          <div class="pending-list">
            @for (req of pending(); track req.id) {
              <mat-card class="approval-card">
                <div class="card-top">
                  <div class="req-avatar">{{ initials(req.requested_by_name) }}</div>
                  <div class="req-info">
                    <div class="req-title">{{ req.title }}</div>
                    <div class="req-meta">
                      <span class="type-chip">{{ req.request_type }}</span>
                      <span class="req-by">by {{ req.requested_by_name }}</span>
                      <span class="req-date">{{ req.created_at | date:'mediumDate' }}</span>
                    </div>
                    @if (req.notes) {
                      <div class="req-notes">"{{ req.notes }}"</div>
                    }
                  </div>
                </div>
                <div class="card-actions">
                  <button mat-raised-button class="btn-approve" (click)="approve(req)" [disabled]="actioning()">
                    <mat-icon>check</mat-icon> Approve
                  </button>
                  <button mat-stroked-button class="btn-reject" (click)="reject(req)" [disabled]="actioning()">
                    <mat-icon>close</mat-icon> Reject
                  </button>
                </div>
              </mat-card>
            }
            @empty {
              @if (!loading()) {
                <div class="empty-state">
                  <mat-icon>task_alt</mat-icon>
                  <h3>All caught up!</h3>
                  <p>No pending approvals require your action.</p>
                </div>
              }
            }
          </div>
        </mat-tab>

        <!-- All Requests Tab -->
        <mat-tab label="All Requests">
          <div class="table-wrapper">
            <table mat-table [dataSource]="all()">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Request</th>
                <td mat-cell *matCellDef="let r">
                  <div class="req-name-cell">{{ r.title }}</div>
                  <div class="req-type-cell">{{ r.request_type }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="requester">
                <th mat-header-cell *matHeaderCellDef>Requested By</th>
                <td mat-cell *matCellDef="let r">{{ r.requested_by_name }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.created_at | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="chip" [class]="statusClass(r.status)">{{ r.status | titlecase }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="allColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: allColumns;"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- Workflows Tab -->
        <mat-tab label="Workflows">
          <div class="workflows-list">
            @for (wf of workflows(); track wf.id) {
              <mat-card class="workflow-card">
                <div class="wf-icon"><mat-icon>account_tree</mat-icon></div>
                <div class="wf-info">
                  <div class="wf-name">{{ wf.name }}</div>
                  <div class="wf-meta">
                    <span>Triggered by: {{ wf.trigger_type }}</span>
                    <span>{{ wf.steps_count }} steps</span>
                  </div>
                </div>
                <div class="wf-toggle">
                  <span class="active-badge" [class.inactive]="!wf.is_active">
                    {{ wf.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </mat-card>
            }
            @empty {
              <div class="empty-state">
                <mat-icon>account_tree</mat-icon>
                <p>No workflows configured</p>
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
    .pending-badge { display:flex; align-items:center; gap:6px; background:rgba(234,179,8,0.12); color:#fbbf24; padding:8px 16px; border-radius:10px; font-weight:700; font-size:0.875rem; }
    .pending-badge mat-icon { font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .tabs { background:var(--surface-1); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .pending-list { display:flex; flex-direction:column; gap:12px; padding:20px; }
    .approval-card { padding:20px !important; border-radius:12px !important; border:1px solid var(--border-color) !important; display:flex; flex-direction:column; gap:14px; }
    .card-top { display:flex; gap:14px; }
    .req-avatar { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .req-info { flex:1; }
    .req-title { font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:6px; }
    .req-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .type-chip { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .req-by { font-size:0.8rem; color:var(--text-secondary); }
    .req-date { font-size:0.78rem; color:var(--text-muted); }
    .req-notes { font-size:0.8rem; color:var(--text-muted); margin-top:6px; font-style:italic; }
    .card-actions { display:flex; gap:10px; }
    .btn-approve { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .btn-reject { color:#dc2626 !important; border-color:#dc2626 !important; }
    .table-wrapper { overflow-x:auto; padding:0 8px; }
    table { width:100%; }
    .req-name-cell { font-weight:600; font-size:0.875rem; }
    .req-type-cell { font-size:0.75rem; color:var(--text-muted); }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-neutral { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .workflows-list { display:flex; flex-direction:column; gap:10px; padding:20px; }
    .workflow-card { padding:16px 20px !important; display:flex; align-items:center; gap:14px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .wf-icon { width:40px; height:40px; border-radius:10px; background:rgba(34,197,94,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .wf-icon mat-icon { color:#22c55e; }
    .wf-info { flex:1; }
    .wf-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .wf-meta { display:flex; gap:12px; font-size:0.78rem; color:var(--text-muted); margin-top:2px; }
    .active-badge { background:rgba(34,197,94,0.12); color:#4ade80; padding:3px 10px; border-radius:10px; font-size:0.75rem; font-weight:600; }
    .active-badge.inactive { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .empty-state { text-align:center; padding:48px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 8px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
  `],
})
export class ApprovalListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  all       = signal<ApprovalRequest[]>([]);
  pending   = signal<ApprovalRequest[]>([]);
  workflows = signal<ApprovalWorkflow[]>([]);
  loading   = signal(false);
  actioning = signal(false);

  allColumns = ['title', 'requester', 'date', 'status'];

  pendingCount(): number { return this.pending().length; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: ApprovalRequest[] } | ApprovalRequest[]>('approvals/requests/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: ApprovalRequest[] }).results ?? [];
        this.all.set(list);
        this.pending.set(list.filter(r => r.status === 'pending'));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load approvals.'); },
    });
    this.api.get<{ results: ApprovalWorkflow[] } | ApprovalWorkflow[]>('approvals/workflows/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: ApprovalWorkflow[] }).results ?? [];
        this.workflows.set(list);
      },
      error: () => {},
    });
  }

  approve(req: ApprovalRequest): void {
    this.actioning.set(true);
    this.api.post(`approvals/requests/${req.id}/approve/`, {}).subscribe({
      next: () => {
        this.pending.update(items => items.filter(i => i.id !== req.id));
        this.all.update(items => items.map(i => i.id === req.id ? { ...i, status: 'approved' as const } : i));
        this.actioning.set(false);
        this.notify.success('Request approved.');
      },
      error: () => { this.actioning.set(false); this.notify.error('Failed to approve.'); },
    });
  }

  reject(req: ApprovalRequest): void {
    this.actioning.set(true);
    this.api.post(`approvals/requests/${req.id}/reject/`, {}).subscribe({
      next: () => {
        this.pending.update(items => items.filter(i => i.id !== req.id));
        this.all.update(items => items.map(i => i.id === req.id ? { ...i, status: 'rejected' as const } : i));
        this.actioning.set(false);
        this.notify.success('Decision recorded.');
      },
      error: () => { this.actioning.set(false); this.notify.error('Failed to reject.'); },
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'chip chip-amber', approved: 'chip chip-green',
      rejected: 'chip chip-red', cancelled: 'chip chip-neutral',
    };
    return map[status] ?? 'chip';
  }
}
