import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface EmployeeRisk {
  id: string;
  employee_name: string;
  department: string;
  risk_score: number;
  risk_level: RiskLevel;
  flags: string[];
}

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

@Component({
  selector: 'as-risk-scores',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule,
    MatProgressSpinnerModule, MatMenuModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Employee Risk Dashboard</h2>
          <p class="subtitle">Monitor employee compliance risk levels</p>
        </div>
        <button mat-stroked-button>
          <mat-icon>download</mat-icon> Export
        </button>
      </div>

      <!-- Risk Distribution Donut -->
      @if (distribution()) {
        <div class="dist-row">
          <mat-card class="donut-card">
            <div class="donut-title"><mat-icon>donut_large</mat-icon> Risk Distribution</div>
            <div class="donut-container">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <!-- Background circle -->
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="24"/>
                <!-- Segments (simplified donut) -->
                @for (seg of donutSegments(); track seg.level) {
                  <circle cx="90" cy="90" r="70" fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="24" stroke-linecap="butt"
                    [attr.stroke-dasharray]="seg.dashArray"
                    [attr.stroke-dashoffset]="seg.dashOffset"
                    transform="rotate(-90 90 90)"/>
                }
              </svg>
              <div class="donut-center">
                <div class="donut-total">{{ totalEmployees() }}</div>
                <div class="donut-label">Employees</div>
              </div>
            </div>
            <div class="donut-legend">
              @for (seg of donutSegments(); track seg.level) {
                <div class="legend-item">
                  <div class="legend-dot" [style.background]="seg.color"></div>
                  <span class="legend-level">{{ seg.level | titlecase }}</span>
                  <span class="legend-count">{{ seg.count }}</span>
                </div>
              }
            </div>
          </mat-card>
          <div class="risk-stats">
            <mat-card class="risk-stat-card critical-border">
              <mat-icon style="color:#dc2626">priority_high</mat-icon>
              <div>
                <div class="risk-stat-num red">{{ distribution()!.critical }}</div>
                <div class="risk-stat-label">Critical Risk</div>
              </div>
            </mat-card>
            <mat-card class="risk-stat-card high-border">
              <mat-icon style="color:#ea580c">warning</mat-icon>
              <div>
                <div class="risk-stat-num orange">{{ distribution()!.high }}</div>
                <div class="risk-stat-label">High Risk</div>
              </div>
            </mat-card>
            <mat-card class="risk-stat-card medium-border">
              <mat-icon style="color:#d97706">info</mat-icon>
              <div>
                <div class="risk-stat-num amber">{{ distribution()!.medium }}</div>
                <div class="risk-stat-label">Medium Risk</div>
              </div>
            </mat-card>
            <mat-card class="risk-stat-card low-border">
              <mat-icon style="color:#22c55e">check_circle</mat-icon>
              <div>
                <div class="risk-stat-num green">{{ distribution()!.low }}</div>
                <div class="risk-stat-label">Low Risk</div>
              </div>
            </mat-card>
          </div>
        </div>
      }

      <!-- Risk Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="employees()">
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let e">
                <div class="emp-cell">
                  <div class="emp-avatar" [style.background]="riskGradient(e.risk_level)">{{ (e.employee_name || '?')[0] }}</div>
                  <div>
                    <div class="emp-name">{{ e.employee_name }}</div>
                    <div class="emp-dept">{{ e.department }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Risk Score</th>
              <td mat-cell *matCellDef="let e">
                <div class="score-cell">
                  <span class="score-num" [style.color]="scoreColor(e.risk_score)">{{ e.risk_score }}</span>
                  <div class="score-bar-bg">
                    <div class="score-bar-fill" [style.width.%]="e.risk_score" [style.background]="scoreColor(e.risk_score)"></div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="level">
              <th mat-header-cell *matHeaderCellDef>Risk Level</th>
              <td mat-cell *matCellDef="let e">
                <span class="level-badge" [class]="levelClass(e.risk_level)">{{ e.risk_level | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="flags">
              <th mat-header-cell *matHeaderCellDef>Flags</th>
              <td mat-cell *matCellDef="let e">
                <div class="flags-row">
                  @for (flag of e.flags.slice(0,3); track flag) {
                    <span class="flag-chip" [matTooltip]="flag">{{ flag | slice:0:20 }}{{ flag.length > 20 ? '…' : '' }}</span>
                  }
                  @if (e.flags.length > 3) {
                    <span class="flag-more">+{{ e.flags.length - 3 }}</span>
                  }
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                <button mat-stroked-button class="review-btn">Review</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
        @if (!loading() && employees().length === 0) {
          <div class="empty-state">
            <mat-icon>security</mat-icon>
            <h3>No risk data available</h3>
            <p>Risk scores are calculated based on compliance activity.</p>
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
    .dist-row { display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:start; }
    .donut-card { padding:20px !important; display:flex; flex-direction:column; gap:16px; min-width:240px; }
    .donut-title { display:flex; align-items:center; gap:6px; font-size:0.9rem; font-weight:700; color:var(--text-primary); font-family:'Outfit',sans-serif; }
    .donut-title mat-icon { color:#22c55e; font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .donut-container { position:relative; width:180px; height:180px; margin:0 auto; }
    .donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .donut-total { font-size:2rem; font-weight:800; color:var(--text-primary); line-height:1; }
    .donut-label { font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .donut-legend { display:flex; flex-direction:column; gap:6px; }
    .legend-item { display:flex; align-items:center; gap:8px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .legend-level { font-size:0.8rem; color:var(--text-secondary); flex:1; }
    .legend-count { font-size:0.8rem; font-weight:700; color:var(--text-primary); }
    .risk-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
    .risk-stat-card { padding:18px !important; display:flex; align-items:center; gap:12px; border-left:4px solid !important; }
    .critical-border { border-color:#dc2626 !important; }
    .high-border { border-color:#ea580c !important; }
    .medium-border { border-color:#d97706 !important; }
    .low-border { border-color:#22c55e !important; }
    .risk-stat-num { font-size:1.6rem; font-weight:700; }
    .risk-stat-num.red { color:#dc2626; }
    .risk-stat-num.orange { color:#ea580c; }
    .risk-stat-num.amber { color:#d97706; }
    .risk-stat-num.green { color:#22c55e; }
    .risk-stat-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .emp-cell { display:flex; align-items:center; gap:10px; }
    .emp-avatar { width:36px; height:36px; border-radius:50%; color: var(--brand-mid); font-size:0.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .emp-name { font-weight:600; font-size:0.875rem; }
    .emp-dept { font-size:0.75rem; color:var(--text-muted); }
    .score-cell { display:flex; align-items:center; gap:10px; min-width:140px; }
    .score-num { font-weight:700; font-size:0.9rem; min-width:28px; }
    .score-bar-bg { flex:1; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; }
    .score-bar-fill { height:100%; border-radius:3px; transition:width 0.3s; }
    .level-badge { display:inline-block; padding:2px 8px; border-radius:8px; font-size:0.75rem; font-weight:700; }
    .level-low { background:rgba(34,197,94,0.12); color:#4ade80; }
    .level-medium { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .level-high { background:#ffedd5; color:#ea580c; }
    .level-critical { background:rgba(239,68,68,0.12); color:#f87171; }
    .flags-row { display:flex; flex-wrap:wrap; gap:4px; max-width:200px; }
    .flag-chip { background:rgba(0,0,0,0.08); color:var(--text-secondary); padding:1px 6px; border-radius:8px; font-size:0.72rem; }
    .flag-more { background:rgba(34,197,94,0.1); color:#16a34a; padding:1px 6px; border-radius:8px; font-size:0.72rem; font-weight:600; }
    .review-btn { font-size:0.78rem !important; color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:900px) { .dist-row { grid-template-columns:1fr; } .risk-stats { grid-template-columns:repeat(2,1fr); } }
  `],
})
export class RiskScoresComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  employees    = signal<EmployeeRisk[]>([]);
  distribution = signal<RiskDistribution | null>(null);
  loading      = signal(false);

  columns = ['employee', 'score', 'level', 'flags', 'action'];

  totalEmployees(): number {
    const d = this.distribution();
    if (!d) return 0;
    return d.low + d.medium + d.high + d.critical;
  }

  donutSegments(): Array<{ level: string; color: string; count: number; dashArray: string; dashOffset: string }> {
    const d = this.distribution();
    if (!d) return [];
    const total = this.totalEmployees();
    if (!total) return [];
    const circumference = 2 * Math.PI * 70;
    const levels = [
      { level: 'critical', color: '#dc2626', count: d.critical },
      { level: 'high',     color: '#ea580c', count: d.high },
      { level: 'medium',   color: '#d97706', count: d.medium },
      { level: 'low',      color: '#22c55e', count: d.low },
    ];
    let offset = 0;
    return levels.map(l => {
      const pct = l.count / total;
      const dash = circumference * pct;
      const gap = circumference - dash;
      const result = {
        ...l,
        dashArray: `${dash} ${gap}`,
        dashOffset: String(-offset),
      };
      offset += dash;
      return result;
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: EmployeeRisk[]; distribution: RiskDistribution }>('employees/risk-scores/').subscribe({
      next: (res) => {
        const raw = (res as { results: EmployeeRisk[] }).results ?? (Array.isArray(res) ? res : []);
        // Normalise: backend may return first_name/last_name instead of employee_name
        const list = (raw as any[]).map(e => ({
          ...e,
          employee_name: e.employee_name || `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() || 'Unknown',
          risk_level: e.risk_level || 'low',
          risk_score: e.risk_score ?? 0,
          department: e.department_name || e.department || '—',
          flags: Array.isArray(e.flags) ? e.flags : [],
        })) as EmployeeRisk[];
        this.employees.set(list);
        const dist = (res as { distribution?: RiskDistribution }).distribution;
        if (dist) {
          this.distribution.set(dist);
        } else {
          const empList = list as EmployeeRisk[];
          this.distribution.set({
            low: empList.filter(e => e.risk_level === 'low').length,
            medium: empList.filter(e => e.risk_level === 'medium').length,
            high: empList.filter(e => e.risk_level === 'high').length,
            critical: empList.filter(e => e.risk_level === 'critical').length,
          });
        }
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load risk data.'); },
    });
  }

  scoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#d97706';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
  }

  riskGradient(level: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      low: 'linear-gradient(135deg,#22c55e,#16a34a)',
      medium: 'linear-gradient(135deg,#d97706,#b45309)',
      high: 'linear-gradient(135deg,#ea580c,#c2410c)',
      critical: 'linear-gradient(135deg,#dc2626,#b91c1c)',
    };
    return map[level] ?? 'linear-gradient(135deg,#6b7280,#4b5563)';
  }

  levelClass(level: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      low: 'level-badge level-low', medium: 'level-badge level-medium',
      high: 'level-badge level-high', critical: 'level-badge level-critical',
    };
    return map[level] ?? 'level-badge';
  }
}
