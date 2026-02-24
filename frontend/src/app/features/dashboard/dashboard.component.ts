import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface DashboardStats {
  employee_count: number;
  document_count: number;
  expired_docs: number;
  compliance_score: number;
  pending_compliance: number;
  overdue_compliance: number;
}

@Component({
  selector: 'as-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule,
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome banner -->
      <div class="welcome-banner">
        <div>
          <h2>Good morning, {{ auth.user()?.first_name }} 👋</h2>
          <p>{{ auth.user()?.company_name }} — Here's your compliance overview</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/reports">
          <mat-icon>assessment</mat-icon> Generate Audit Report
        </button>
      </div>

      <!-- KPI cards -->
      <div class="kpi-grid">
        @for (kpi of kpiCards(); track kpi.label) {
          <mat-card class="kpi-card" [class.kpi-danger]="kpi.danger" [class.kpi-warning]="kpi.warning">
            <div class="kpi-icon" [style.background]="kpi.color">
              <mat-icon>{{ kpi.icon }}</mat-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
          </mat-card>
        }
      </div>

      <!-- Compliance score -->
      <div class="two-col">
        <mat-card class="compliance-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>verified</mat-icon>
            <mat-card-title>Compliance Score</mat-card-title>
            <mat-card-subtitle>Overall regulatory status</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="score-display">
              <div class="score-ring" [class.score-good]="stats().compliance_score >= 80" [class.score-warn]="stats().compliance_score >= 50 && stats().compliance_score < 80" [class.score-bad]="stats().compliance_score < 50">
                <span class="score-number">{{ stats().compliance_score }}%</span>
              </div>
              <div class="score-legend">
                <div class="legend-item">
                  <mat-icon style="color:#22c55e">check_circle</mat-icon>
                  <span>Compliant items</span>
                </div>
                <div class="legend-item">
                  <mat-icon style="color:#f59e0b">warning</mat-icon>
                  <span>{{ stats().pending_compliance }} pending</span>
                </div>
                <div class="legend-item">
                  <mat-icon style="color:#ef4444">error</mat-icon>
                  <span>{{ stats().overdue_compliance }} overdue</span>
                </div>
              </div>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="stats().compliance_score"
              [color]="stats().compliance_score >= 80 ? 'primary' : stats().compliance_score >= 50 ? 'accent' : 'warn'"
            />
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/compliance">View Details</button>
          </mat-card-actions>
        </mat-card>

        <!-- Quick actions -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>bolt</mat-icon>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              @for (action of quickActions; track action.label) {
                <button mat-stroked-button [routerLink]="action.route" class="quick-action-btn">
                  <mat-icon>{{ action.icon }}</mat-icon>
                  {{ action.label }}
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 24px; }
    .welcome-banner { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 24px 28px; border-radius: 16px; }
    .welcome-banner h2 { margin: 0 0 4px; font-size: 1.4rem; font-weight: 700; }
    .welcome-banner p { margin: 0; opacity: 0.85; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .kpi-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; }
    .kpi-danger { border-left: 4px solid #ef4444; }
    .kpi-warning { border-left: 4px solid #f59e0b; }
    .kpi-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon mat-icon { color: white; font-size: 1.6rem; }
    .kpi-value { font-size: 2rem; font-weight: 700; line-height: 1; }
    .kpi-label { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .welcome-banner { flex-direction: column; gap: 16px; } }
    .score-display { display: flex; align-items: center; gap: 32px; margin: 16px 0; }
    .score-ring { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 8px solid; flex-shrink: 0; }
    .score-good { border-color: #22c55e; }
    .score-warn { border-color: #f59e0b; }
    .score-bad { border-color: #ef4444; }
    .score-number { font-size: 1.5rem; font-weight: 700; }
    .score-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; }
    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
    .quick-action-btn { justify-content: flex-start; gap: 8px; }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly stats = signal<DashboardStats>({
    employee_count: 0,
    document_count: 0,
    expired_docs: 0,
    compliance_score: 0,
    pending_compliance: 0,
    overdue_compliance: 0,
  });

  readonly quickActions = [
    { label: 'Add Employee', icon: 'person_add', route: '/employees/new' },
    { label: 'Upload Document', icon: 'upload_file', route: '/documents/upload' },
    { label: 'View Compliance', icon: 'checklist', route: '/compliance' },
    { label: 'Generate Report', icon: 'description', route: '/reports/new' },
  ];

  kpiCards() {
    const s = this.stats();
    return [
      { label: 'Active Employees', value: s.employee_count, icon: 'group', color: '#3b82f6' },
      { label: 'Total Documents', value: s.document_count, icon: 'folder', color: '#8b5cf6' },
      { label: 'Expired Documents', value: s.expired_docs, icon: 'error_outline', color: '#ef4444', danger: s.expired_docs > 0 },
      { label: 'Overdue Compliance', value: s.overdue_compliance, icon: 'warning', color: '#f59e0b', warning: s.overdue_compliance > 0 },
    ];
  }

  ngOnInit(): void {
    this.api.get<{ score: number; compliant: number; pending: number; overdue: number; total: number }>('compliance/dashboard/').subscribe({
      next: (res) => this.stats.update((s) => ({
        ...s,
        compliance_score: res.score,
        pending_compliance: res.pending,
        overdue_compliance: res.overdue,
      })),
    });
  }
}
