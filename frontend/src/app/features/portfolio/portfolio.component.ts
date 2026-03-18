import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';

interface CompanyPortfolioItem {
  id: string;
  name: string;
  country: string;
  industry: string;
  compliance_score: number;
  employees_count: number;
  overdue_count: number;
  last_activity: string;
}

interface PortfolioResult {
  total_companies: number;
  avg_compliance_score: number;
  companies: CompanyPortfolioItem[];
}

@Component({
  selector: 'as-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTableModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Portfolio Overview</h2>
          <p class="subtitle">Multi-company compliance dashboard</p>
        </div>
        <button mat-stroked-button (click)="load()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48" />
          <p>Loading portfolio data…</p>
        </div>
      }

      @if (!loading() && result()) {
        <!-- Stats row -->
        <div class="stats-row">
          <mat-card class="stat-card">
            <mat-icon class="stat-icon icon-brand">corporate_fare</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ result()!.total_companies }}</span>
              <span class="stat-label">Total Companies</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon icon-success">verified</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ result()!.avg_compliance_score | number:'1.1-1' }}%</span>
              <span class="stat-label">Avg Compliance Score</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon icon-danger">report_problem</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ atRiskCount() }}</span>
              <span class="stat-label">Companies at Risk</span>
            </div>
          </mat-card>
        </div>

        <!-- Companies table -->
        <mat-card class="table-card">
          @if (result()!.companies.length === 0) {
            <div class="empty-state">
              <mat-icon>corporate_fare</mat-icon>
              <h3>No companies found</h3>
              <p>There are no companies in your portfolio yet.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table mat-table [dataSource]="result()!.companies">

                <!-- Company Name -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Company Name</th>
                  <td mat-cell *matCellDef="let c">
                    <div class="company-name-cell">
                      <div class="company-avatar">{{ c.name[0] }}</div>
                      <span class="company-name-text">{{ c.name }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Country -->
                <ng-container matColumnDef="country">
                  <th mat-header-cell *matHeaderCellDef>Country</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="text-secondary">{{ c.country }}</span>
                  </td>
                </ng-container>

                <!-- Industry -->
                <ng-container matColumnDef="industry">
                  <th mat-header-cell *matHeaderCellDef>Industry</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="industry-chip">{{ c.industry }}</span>
                  </td>
                </ng-container>

                <!-- Compliance Score -->
                <ng-container matColumnDef="compliance_score">
                  <th mat-header-cell *matHeaderCellDef>Compliance Score</th>
                  <td mat-cell *matCellDef="let c">
                    <div class="score-cell">
                      <div class="score-bar-wrap">
                        <div
                          class="score-bar-fill"
                          [class]="scoreBarClass(c.compliance_score)"
                          [style.width.%]="c.compliance_score"
                        ></div>
                      </div>
                      <span class="score-value" [class]="scoreTextClass(c.compliance_score)">
                        {{ c.compliance_score }}%
                      </span>
                    </div>
                  </td>
                </ng-container>

                <!-- Employees -->
                <ng-container matColumnDef="employees_count">
                  <th mat-header-cell *matHeaderCellDef>Employees</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="text-secondary">{{ c.employees_count }}</span>
                  </td>
                </ng-container>

                <!-- Overdue -->
                <ng-container matColumnDef="overdue_count">
                  <th mat-header-cell *matHeaderCellDef>Overdue</th>
                  <td mat-cell *matCellDef="let c">
                    @if (c.overdue_count > 0) {
                      <span class="overdue-badge">{{ c.overdue_count }}</span>
                    } @else {
                      <span class="text-success">0</span>
                    }
                  </td>
                </ng-container>

                <!-- Last Activity -->
                <ng-container matColumnDef="last_activity">
                  <th mat-header-cell *matHeaderCellDef>Last Activity</th>
                  <td mat-cell *matCellDef="let c">
                    <span class="text-secondary">{{ c.last_activity | date:'mediumDate' }}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns;"></tr>
              </table>
            </div>
          }
        </mat-card>
      }

      @if (!loading() && !result()) {
        <div class="empty-state">
          <mat-icon>corporate_fare</mat-icon>
          <h3>Could not load portfolio data</h3>
          <p>Please try again.</p>
          <button mat-raised-button color="primary" (click)="load()">
            <mat-icon>refresh</mat-icon> Retry
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 20px; }

    /* Header */
    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { margin: 0 0 2px; font-size: 1.5rem; font-weight: 700; }
    .subtitle { margin: 0; color: #64748b; font-size: 0.875rem; }

    /* Loading */
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px; padding: 80px 24px;
      color: #64748b;
    }

    /* Stats row */
    .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .stat-card { padding: 20px !important; display: flex; align-items: center; gap: 16px; }
    .stat-icon { font-size: 2rem; height: 2rem; width: 2rem; }
    .icon-brand   { color: #4f46e5; }
    .icon-success { color: #10b981; }
    .icon-danger  { color: #ef4444; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.7rem; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Table */
    .table-card { overflow: hidden; padding: 0 !important; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; }

    /* Company name cell */
    .company-name-cell { display: flex; align-items: center; gap: 10px; }
    .company-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: white; font-size: 0.85rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .company-name-text { font-weight: 600; font-size: 0.875rem; color: #1e293b; }

    .text-secondary { color: #64748b; font-size: 0.875rem; }
    .text-success { color: #10b981; font-weight: 600; }

    .industry-chip {
      display: inline-block; padding: 2px 10px; border-radius: 20px;
      background: #f1f5f9; color: #475569;
      font-size: 0.75rem; font-weight: 500;
    }

    /* Score column */
    .score-cell { display: flex; align-items: center; gap: 10px; min-width: 160px; }
    .score-bar-wrap {
      flex: 1; height: 8px; background: #e2e8f0;
      border-radius: 99px; overflow: hidden;
    }
    .score-bar-fill {
      height: 100%; border-radius: 99px;
      transition: width 0.5s ease;
    }
    .score-bar-fill.green  { background: #10b981; }
    .score-bar-fill.amber  { background: #f59e0b; }
    .score-bar-fill.red    { background: #ef4444; }
    .score-value { font-size: 0.8rem; font-weight: 700; flex-shrink: 0; width: 36px; text-align: right; }
    .score-value.text-green { color: #10b981; }
    .score-value.text-amber { color: #f59e0b; }
    .score-value.text-red   { color: #ef4444; }

    .overdue-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 24px; height: 24px; border-radius: 12px;
      background: #fee2e2; color: #ef4444;
      font-size: 0.75rem; font-weight: 700; padding: 0 6px;
    }

    /* Empty state */
    .empty-state { text-align: center; padding: 60px 24px; color: #64748b; }
    .empty-state mat-icon { font-size: 3rem; height: 3rem; width: 3rem; opacity: 0.35; display: block; margin: 0 auto 12px; }
    .empty-state h3 { margin: 0 0 8px; color: #1e293b; }
    .empty-state p { margin: 0 0 20px; }

    @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .stats-row { grid-template-columns: 1fr; } }
  `],
})
export class PortfolioComponent implements OnInit {
  private readonly api = inject(ApiService);

  result  = signal<PortfolioResult | null>(null);
  loading = signal(false);

  readonly columns = ['name', 'country', 'industry', 'compliance_score', 'employees_count', 'overdue_count', 'last_activity'];

  atRiskCount = computed(() =>
    this.result()?.companies.filter(c => c.compliance_score < 70).length ?? 0
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.get<PortfolioResult>('companies/portfolio/').subscribe({
      next: (res) => { this.result.set(res); this.loading.set(false); },
      error: ()  => { this.loading.set(false); },
    });
  }

  scoreBarClass(score: number): string {
    if (score >= 85) return 'green';
    if (score >= 70) return 'amber';
    return 'red';
  }

  scoreTextClass(score: number): string {
    if (score >= 85) return 'text-green';
    if (score >= 70) return 'text-amber';
    return 'text-red';
  }
}
