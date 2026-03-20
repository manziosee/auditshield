import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Acknowledgment {
  id: string;
  employee_name: string;
  acknowledged_at: string;
  ip_address: string;
}

interface PolicyDetail {
  id: string;
  title: string;
  category: string;
  version: string;
  status: string;
  content: string;
  requires_acknowledgment: boolean;
  already_acknowledged: boolean;
  ack_count: number;
  total_employees: number;
  acknowledgments: Acknowledgment[];
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'as-policy-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="48" /></div>
      }
      @if (!loading() && policy()) {
        <div class="page-header">
          <div>
            <div class="breadcrumb">Policies / {{ policy()!.category }}</div>
            <h2 class="page-title">{{ policy()!.title }}</h2>
            <div class="header-meta">
              <span class="version-badge">v{{ policy()!.version }}</span>
              <span class="status-badge" [class]="statusClass(policy()!.status)">{{ policy()!.status | titlecase }}</span>
              <span class="updated-at">Updated {{ policy()!.updated_at | date:'mediumDate' }}</span>
            </div>
          </div>
          @if (policy()!.requires_acknowledgment && !policy()!.already_acknowledged) {
            <button mat-raised-button class="btn-brand" (click)="acknowledge()" [disabled]="acknowledging()">
              @if (acknowledging()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
              @else { <mat-icon>how_to_reg</mat-icon> }
              Acknowledge Policy
            </button>
          }
          @if (policy()!.already_acknowledged) {
            <div class="acked-badge">
              <mat-icon>verified</mat-icon> Already Acknowledged
            </div>
          }
        </div>

        <mat-tab-group class="tabs" animationDuration="200ms">
          <mat-tab label="Policy Content">
            <mat-card class="content-card">
              <pre class="policy-content">{{ policy()!.content }}</pre>
            </mat-card>
          </mat-tab>

          @if (policy()!.requires_acknowledgment) {
            <mat-tab label="Acknowledgments ({{ policy()!.ack_count }})">
              <mat-card class="ack-card">
                <div class="ack-summary">
                  <div class="ack-progress-text">{{ policy()!.ack_count }} of {{ policy()!.total_employees }} employees have acknowledged</div>
                </div>
                <div class="table-wrapper">
                  <table mat-table [dataSource]="policy()!.acknowledgments">
                    <ng-container matColumnDef="employee">
                      <th mat-header-cell *matHeaderCellDef>Employee</th>
                      <td mat-cell *matCellDef="let a">
                        <div class="emp-cell">
                          <div class="emp-dot">{{ a.employee_name[0] }}</div>
                          {{ a.employee_name }}
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let a">{{ a.acknowledged_at | date:'medium' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="ip">
                      <th mat-header-cell *matHeaderCellDef>IP Address</th>
                      <td mat-cell *matCellDef="let a">
                        <code class="ip-code">{{ a.ip_address || '—' }}</code>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="ackColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: ackColumns;"></tr>
                  </table>
                </div>
              </mat-card>
            </mat-tab>
          }
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; max-width:960px; }
    .center-spin { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; }
    .breadcrumb { font-size:0.78rem; color:var(--text-muted); margin-bottom:6px; }
    .page-title { margin:0 0 8px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .header-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .version-badge { background:rgba(0,0,0,0.08); color:var(--text-secondary); padding:2px 8px; border-radius:10px; font-size:0.75rem; }
    .status-badge { padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600; }
    .status-active { background:#dcfce7; color:#16a34a; }
    .status-draft { background:#fef9c3; color:#a16207; }
    .status-archived { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .updated-at { font-size:0.75rem; color:var(--text-muted); }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
    .acked-badge { display:flex; align-items:center; gap:6px; background:#dcfce7; color:#16a34a; padding:8px 16px; border-radius:10px; font-weight:600; font-size:0.875rem; }
    .acked-badge mat-icon { font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .tabs { background:var(--surface-1); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; }
    .content-card { padding:28px !important; margin:20px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .policy-content { font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; color:var(--text-secondary); line-height:1.8; white-space:pre-wrap; margin:0; }
    .ack-card { padding:20px !important; margin:20px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .ack-summary { margin-bottom:16px; }
    .ack-progress-text { font-size:0.9rem; color:var(--text-secondary); font-weight:500; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .emp-cell { display:flex; align-items:center; gap:8px; }
    .emp-dot { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color:#052e16; font-size:0.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .ip-code { font-family:monospace; font-size:0.8rem; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; }
  `],
})
export class PolicyDetailComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  policy       = signal<PolicyDetail | null>(null);
  loading      = signal(false);
  acknowledging = signal(false);

  ackColumns = ['employee', 'date', 'ip'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<PolicyDetail>(`policies/${id}/`).subscribe({
      next: (res) => { this.policy.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load policy.'); },
    });
  }

  acknowledge(): void {
    if (!this.policy()) return;
    const id = this.policy()!.id;
    this.acknowledging.set(true);
    this.api.post(`policies/${id}/acknowledge/`, {}).subscribe({
      next: () => {
        this.notify.success('Policy acknowledged successfully.');
        this.acknowledging.set(false);
        this.load(id);
      },
      error: () => { this.acknowledging.set(false); this.notify.error('Failed to acknowledge.'); },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'status-badge status-active', draft: 'status-badge status-draft', archived: 'status-badge status-archived',
    };
    return map[status] ?? 'status-badge';
  }
}
