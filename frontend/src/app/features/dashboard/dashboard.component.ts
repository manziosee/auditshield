import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ComplianceService } from '../../core/services/compliance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { DocumentService } from '../../core/services/document.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface DashboardStats {
  employee_count: number;
  document_count: number;
  expired_docs: number;
  expiring_soon_docs: number;
  compliance_score: number;
  compliant_items: number;
  pending_compliance: number;
  overdue_compliance: number;
  total_compliance_items: number;
  department_count: number;
}

interface Deadline {
  title: string;
  date: Date;
  type: 'tax' | 'social' | 'hr' | 'legal';
  daysLeft: number;
}

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'as-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatTooltipModule,
    BaseChartDirective,
  ],
  template: `
    <div class="dashboard">

      <!-- ── Welcome banner ──────────────────────────────────────────────────── -->
      <div class="welcome-banner">
        <div class="welcome-left">
          <div class="welcome-greeting">{{ greeting() }}, {{ auth.user()?.first_name }} 👋</div>
          <div class="welcome-sub">
            <span class="company-chip">
              <mat-icon>business</mat-icon>
              {{ auth.user()?.company_name }}
            </span>
            <span class="date-chip">
              <mat-icon>calendar_today</mat-icon>
              {{ today | date:'EEEE, MMM d, y' }}
            </span>
          </div>
        </div>
        <div class="welcome-actions">
          <button mat-stroked-button class="action-btn-outline" routerLink="/documents/upload">
            <mat-icon>upload_file</mat-icon> Upload
          </button>
          <button mat-raised-button class="action-btn-primary" routerLink="/reports/new">
            <mat-icon>assessment</mat-icon> Generate Report
          </button>
        </div>
      </div>

      <!-- ── KPI Cards ────────────────────────────────────────────────────────── -->
      <div class="kpi-grid">
        @for (kpi of kpiCards(); track kpi.label; let i = $index) {
          <div class="kpi-card" [class.kpi-danger]="kpi.danger" [class.kpi-warning]="kpi.warning" [style.--qc]="kpi.iconColor">
            <!-- Decorative icon watermark -->
            <div class="kpi-watermark" [style.color]="kpi.iconColor">
              <mat-icon>{{ kpi.icon }}</mat-icon>
            </div>
            <!-- Top row: icon + alert dot -->
            <div class="kpi-head">
              <div class="kpi-icon-wrap">
                <mat-icon [style.color]="kpi.iconColor">{{ kpi.icon }}</mat-icon>
              </div>
              @if (kpi.danger || kpi.warning) {
                <span class="kpi-alert-dot" [class.kpi-alert-warning]="kpi.warning && !kpi.danger"
                  [matTooltip]="kpi.danger ? 'Needs attention' : 'Action required'"></span>
              }
            </div>
            <!-- Value -->
            <div class="kpi-value">{{ kpi.value }}</div>
            <!-- Label -->
            <div class="kpi-label">{{ kpi.label }}</div>
            <!-- Trend pill -->
            @if (kpi.sub) {
              <div class="kpi-trend" [style.color]="kpi.subColor">
                <mat-icon>{{ kpi.subIcon }}</mat-icon>{{ kpi.sub }}
              </div>
            }
            <!-- Mini sparkline -->
            <div class="kpi-sparkline">
              <svg viewBox="0 0 160 34" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient [attr.id]="'kg' + i" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" [attr.stop-color]="kpi.iconColor" stop-opacity="0.25"/>
                    <stop offset="100%" [attr.stop-color]="kpi.iconColor" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path [attr.d]="sparkArea(kpi.sparkline)" [attr.fill]="'url(#kg' + i + ')'"/>
                <path class="spark-line" [attr.d]="sparkLine(kpi.sparkline)"
                      fill="none" [attr.stroke]="kpi.iconColor"
                      stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle [attr.cx]="sparkEnd(kpi.sparkline).x"
                        [attr.cy]="sparkEnd(kpi.sparkline).y"
                        r="3" [attr.fill]="kpi.iconColor"
                        stroke="var(--surface-card)" stroke-width="1.5"/>
              </svg>
            </div>
            <!-- Micro stats row -->
            <div class="kpi-meta">
              @for (m of kpi.meta; track m.label) {
                <div class="kpi-meta-item">
                  <div class="kpi-meta-val">{{ m.value }}</div>
                  <div class="kpi-meta-lbl">{{ m.label }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- ── Main grid ────────────────────────────────────────────────────────── -->
      <div class="main-grid">

        <!-- LEFT: Charts column -->
        <div class="charts-col">

          <!-- Compliance trend chart -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Compliance Trend</div>
                <div class="chart-card-sub">6-month compliance score history</div>
              </div>
              <div class="chart-badge" [style.background]="trendBadgeBg()" [style.color]="trendBadgeColor()">
                <mat-icon>trending_up</mat-icon>
                +{{ trendDelta() }}% vs last month
              </div>
            </div>
            <div class="chart-wrap">
              <canvas baseChart
                [type]="'line'"
                [data]="complianceTrendData"
                [options]="lineChartOptions">
              </canvas>
            </div>
          </div>

          <!-- Document activity chart -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Document Activity</div>
                <div class="chart-card-sub">Monthly documents uploaded vs. expired</div>
              </div>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#6366f1"></span><span>Uploaded</span>
                <span class="legend-dot" style="background:#ef4444;margin-left:12px"></span><span>Expired</span>
              </div>
            </div>
            <div class="chart-wrap">
              <canvas baseChart
                [type]="'bar'"
                [data]="docActivityData"
                [options]="barChartOptions">
              </canvas>
            </div>
          </div>

        </div>

        <!-- RIGHT: Score + Deadlines + Actions column -->
        <div class="side-col">

          <!-- Compliance score ring card -->
          <div class="score-card">
            <div class="score-card-header">
              <div class="score-card-title">Audit Readiness</div>
              <div class="score-card-badge"
                [class.badge-green]="stats().compliance_score >= 80"
                [class.badge-amber]="stats().compliance_score >= 50 && stats().compliance_score < 80"
                [class.badge-red]="stats().compliance_score < 50">
                {{ scoreLabel() }}
              </div>
            </div>

            <div class="score-ring-wrap">
              <!-- SVG ring -->
              <svg viewBox="0 0 120 120" class="score-svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" stroke-width="10"/>
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  [attr.stroke]="scoreRingColor()"
                  stroke-width="10"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="ringCircumference"
                  [attr.stroke-dashoffset]="ringDashOffset()"
                  transform="rotate(-90 60 60)"
                  style="transition: stroke-dashoffset 1s ease, stroke 0.3s ease"
                />
                <text x="60" y="55" text-anchor="middle" dominant-baseline="middle"
                  [attr.fill]="scoreRingColor()"
                  style="font-size:22px;font-weight:800;font-family:Inter,sans-serif">
                  {{ stats().compliance_score }}%
                </text>
                <text x="60" y="74" text-anchor="middle" dominant-baseline="middle"
                  fill="var(--text-muted)"
                  style="font-size:8px;font-family:Inter,sans-serif">
                  Compliance Score
                </text>
              </svg>

              <!-- Score breakdown -->
              <div class="score-breakdown">
                <div class="score-item score-item--green">
                  <mat-icon>check_circle</mat-icon>
                  <div>
                    <div class="score-item-val">{{ stats().compliant_items }}</div>
                    <div class="score-item-lbl">Compliant</div>
                  </div>
                </div>
                <div class="score-item score-item--amber">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <div class="score-item-val">{{ stats().pending_compliance }}</div>
                    <div class="score-item-lbl">Pending</div>
                  </div>
                </div>
                <div class="score-item score-item--red">
                  <mat-icon>error</mat-icon>
                  <div>
                    <div class="score-item-val">{{ stats().overdue_compliance }}</div>
                    <div class="score-item-lbl">Overdue</div>
                  </div>
                </div>
              </div>
            </div>

            <a routerLink="/compliance" class="score-link">
              View Compliance Details <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          <!-- Quick actions -->
          <div class="quick-card">
            <div class="quick-card-title">Quick Actions</div>
            <div class="quick-grid">
              @for (action of quickActions; track action.label) {
                <a class="quick-btn" [routerLink]="action.route" [style.--q-color]="action.color">
                  <div class="quick-btn-icon">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </div>
                  <span>{{ action.label }}</span>
                </a>
              }
            </div>
          </div>

        </div>
      </div>

      <!-- ── Analytics row: 3 charts ────────────────────────────────────────── -->
      <div class="analytics-grid">

        <!-- Department headcount -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">Department Headcount</div>
              <div class="chart-card-sub">Employees per department</div>
            </div>
            <div class="chart-badge" style="background:rgba(236,72,153,0.12);color:#ec4899">
              <mat-icon>account_tree</mat-icon> 5 teams
            </div>
          </div>
          <div class="chart-wrap chart-wrap--md">
            <canvas baseChart
              [type]="'bar'"
              [data]="deptHeadcountData"
              [options]="hBarChartOptions">
            </canvas>
          </div>
        </div>

        <!-- Compliance by authority stacked -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">Compliance by Authority</div>
              <div class="chart-card-sub">Status breakdown per regulatory body</div>
            </div>
          </div>
          <div class="chart-wrap chart-wrap--md">
            <canvas baseChart
              [type]="'bar'"
              [data]="authorityComplianceData"
              [options]="stackedBarOptions">
            </canvas>
          </div>
        </div>

        <!-- Employee split: contract + status -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-card-title">Workforce Overview</div>
              <div class="chart-card-sub">Contract types &amp; employment status</div>
            </div>
          </div>
          <div class="dual-donut">
            <div class="donut-block">
              <div class="donut-label">By Contract</div>
              <div class="chart-wrap chart-wrap--donut">
                <canvas baseChart
                  [type]="'doughnut'"
                  [data]="contractTypeData"
                  [options]="doughnutChartOptions">
                </canvas>
              </div>
            </div>
            <div class="donut-divider"></div>
            <div class="donut-block">
              <div class="donut-label">By Status</div>
              <div class="chart-wrap chart-wrap--donut">
                <canvas baseChart
                  [type]="'doughnut'"
                  [data]="empStatusData"
                  [options]="doughnutChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Bottom grid: Deadlines + Activity ──────────────────────────────── -->
      <div class="bottom-grid">

        <!-- Upcoming deadlines -->
        <div class="deadlines-card">
          <div class="section-header">
            <div class="section-title">
              <mat-icon>event</mat-icon> Upcoming Deadlines
            </div>
            <a routerLink="/compliance" class="see-all">See all</a>
          </div>
          <div class="deadlines-list">
            @for (dl of upcomingDeadlines(); track dl.title) {
              <div class="deadline-item" [class.deadline-urgent]="dl.daysLeft <= 7">
                <div class="deadline-icon" [class]="'dl-type-' + dl.type">
                  <mat-icon>{{ deadlineIcon(dl.type) }}</mat-icon>
                </div>
                <div class="deadline-info">
                  <div class="deadline-title">{{ dl.title }}</div>
                  <div class="deadline-date">{{ dl.date | date:'MMM d, y' }}</div>
                </div>
                <div class="deadline-badge"
                  [class.dl-badge-red]="dl.daysLeft <= 3"
                  [class.dl-badge-amber]="dl.daysLeft > 3 && dl.daysLeft <= 7"
                  [class.dl-badge-green]="dl.daysLeft > 7">
                  {{ dl.daysLeft }}d
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent activity -->
        <div class="activity-card">
          <div class="section-header">
            <div class="section-title">
              <mat-icon>history</mat-icon> Recent Activity
            </div>
            <a routerLink="/audit-logs" class="see-all">View logs</a>
          </div>
          <div class="activity-list">
            @for (item of recentActivity(); track item.action + item.time) {
              <div class="activity-item">
                <div class="activity-icon" [style.background]="item.color + '18'" [style.color]="item.color">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <div class="activity-info">
                  <div class="activity-action">{{ item.action }}</div>
                  <div class="activity-detail">{{ item.detail }}</div>
                </div>
                <div class="activity-time">{{ item.time }}</div>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────────────────────────── */
    .dashboard { display: flex; flex-direction: column; gap: 22px; }

    /* ── Welcome banner ─────────────────────────────────────────────────────── */
    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%);
      border-radius: 16px;
      padding: 24px 28px;
      gap: 16px;
      flex-wrap: wrap;
      position: relative;
      overflow: hidden;
    }
    .welcome-banner::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 400px 300px at 80% -10%, rgba(129,140,248,0.2), transparent),
        radial-gradient(ellipse 200px 200px at 5% 110%, rgba(99,102,241,0.15), transparent);
      pointer-events: none;
    }
    .welcome-greeting {
      font-size: 1.4rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .welcome-sub { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .company-chip, .date-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.8);
      font-size: 0.78rem; font-weight: 500;
      padding: 4px 12px; border-radius: 999px;
    }
    .company-chip mat-icon, .date-chip mat-icon {
      font-size: 0.85rem; width: 0.85rem; height: 0.85rem;
    }
    .welcome-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .action-btn-outline {
      color: rgba(255,255,255,0.85) !important;
      border-color: rgba(255,255,255,0.3) !important;
      font-weight: 600 !important;
    }
    .action-btn-primary {
      background: white !important;
      color: #4f46e5 !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2) !important;
    }

    /* ── KPI Grid ────────────────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-top: 3px solid var(--qc, var(--brand));
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      overflow: hidden;
      cursor: default;
      transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
    }
    /* Radial glow in top-right corner */
    .kpi-card::after {
      content: '';
      position: absolute; top: -24px; right: -24px;
      width: 110px; height: 110px; border-radius: 50%;
      background: radial-gradient(ellipse, color-mix(in srgb, var(--qc, var(--brand)) 10%, transparent), transparent 70%);
      pointer-events: none;
    }
    .kpi-card:hover {
      box-shadow: 0 12px 32px -6px color-mix(in srgb, var(--qc, var(--brand)) 18%, rgba(0,0,0,0.1));
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--qc, var(--brand)) 50%, var(--border-color));
    }
    .kpi-card.kpi-danger  { border-top-color: var(--danger);  --qc: #ef4444; }
    .kpi-card.kpi-warning { border-top-color: var(--warning); --qc: #f59e0b; }

    /* Large watermark icon (decorative, behind content) */
    .kpi-watermark {
      position: absolute; bottom: -12px; right: -10px;
      opacity: 0.05;
      pointer-events: none;
    }
    .kpi-watermark mat-icon { font-size: 5.5rem; width: 5.5rem; height: 5.5rem; }

    .kpi-head {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 12px;
    }
    .kpi-icon-wrap {
      width: 50px; height: 50px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--qc, var(--brand)) 12%, transparent);
      flex-shrink: 0;
    }
    .kpi-icon-wrap mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }

    .kpi-value {
      font-size: 2.25rem; font-weight: 800;
      color: var(--text-primary);
      line-height: 1; letter-spacing: -0.03em;
    }
    .kpi-label {
      font-size: 0.67rem; color: var(--text-muted);
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em;
      margin-top: 4px;
    }
    .kpi-trend {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 0.7rem; font-weight: 700;
      margin-top: 12px; padding: 4px 9px; border-radius: 999px;
      background: color-mix(in srgb, currentColor 10%, transparent);
      width: fit-content;
    }
    .kpi-trend mat-icon { font-size: 0.8rem; width: 0.8rem; height: 0.8rem; }

    .kpi-alert-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 20%, transparent);
      animation: pulse 2s infinite; flex-shrink: 0;
    }
    .kpi-alert-dot.kpi-alert-warning {
      background: var(--warning);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--warning) 20%, transparent);
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.35); opacity: 0.65; }
    }

    /* ── KPI Sparkline ────────────────────────────────────────────────────── */
    .kpi-sparkline {
      margin-top: 14px;
      height: 34px;
      overflow: visible;
    }
    .kpi-sparkline svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .spark-line {
      stroke-dasharray: 450;
      stroke-dashoffset: 450;
      animation: sparkDraw 1.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      animation-delay: 0.15s;
    }
    @keyframes sparkDraw { to { stroke-dashoffset: 0; } }

    /* ── KPI Micro-stats row ──────────────────────────────────────────────── */
    .kpi-meta {
      display: flex;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
    }
    .kpi-meta-item {
      flex: 1;
      display: flex; flex-direction: column; gap: 2px;
      padding: 0 8px;
      border-right: 1px solid var(--border-color);
    }
    .kpi-meta-item:first-child { padding-left: 0; }
    .kpi-meta-item:last-child  { padding-right: 0; border-right: none; }
    .kpi-meta-val {
      font-size: 0.8rem; font-weight: 700; color: var(--text-primary);
      line-height: 1.2;
    }
    .kpi-meta-lbl {
      font-size: 0.59rem; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
    }

    /* ── Main grid ─────────────────────────────────────────────────────────── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 22px;
      align-items: start;
    }
    .charts-col { display: flex; flex-direction: column; gap: 22px; }
    .side-col   { display: flex; flex-direction: column; gap: 22px; }

    /* ── Chart card ────────────────────────────────────────────────────────── */
    .chart-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 22px;
    }
    .chart-card-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px; gap: 12px;
    }
    .chart-card-title {
      font-size: 0.95rem; font-weight: 700;
      color: var(--text-primary); margin-bottom: 3px;
    }
    .chart-card-sub { font-size: 0.75rem; color: var(--text-muted); }
    .chart-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.72rem; font-weight: 700;
      padding: 4px 10px; border-radius: 999px;
      flex-shrink: 0;
    }
    .chart-badge mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; }
    .chart-legend { display: flex; align-items: center; font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; display: inline-block; }
    .chart-wrap { height: 200px; position: relative; }

    /* ── Compliance score ring ─────────────────────────────────────────────── */
    .score-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px;
    }
    .score-card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .score-card-title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
    .score-card-badge {
      font-size: 0.7rem; font-weight: 700;
      padding: 3px 10px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .badge-green { background: rgba(34,197,94,0.12); color: #22c55e; }
    .badge-amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .badge-red   { background: rgba(239,68,68,0.12);  color: #ef4444; }

    .score-ring-wrap {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 16px;
    }
    .score-svg { width: 130px; height: 130px; flex-shrink: 0; }

    .score-breakdown { display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .score-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border-radius: 10px;
    }
    .score-item--green { background: rgba(34,197,94,0.08); }
    .score-item--amber { background: rgba(245,158,11,0.08); }
    .score-item--red   { background: rgba(239,68,68,0.08); }
    .score-item--green mat-icon { color: #22c55e; font-size: 1.1rem; }
    .score-item--amber mat-icon { color: #f59e0b; font-size: 1.1rem; }
    .score-item--red   mat-icon { color: #ef4444; font-size: 1.1rem; }
    .score-item-val { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .score-item-lbl { font-size: 0.68rem; color: var(--text-muted); margin-top: 1px; }

    .score-link {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      font-size: 0.8rem; font-weight: 600; color: var(--brand);
      text-decoration: none;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .score-link:hover { background: var(--brand-subtle); text-decoration: none; }
    .score-link mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    /* ── Quick actions ─────────────────────────────────────────────────────── */
    .quick-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px;
    }
    .quick-card-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; }
    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .quick-btn {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 14px 8px;
      background: var(--surface-hover);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.72rem; font-weight: 600; text-align: center;
      transition: all 0.2s;
      cursor: pointer;
    }
    .quick-btn:hover {
      background: rgba(var(--q-color), 0.08);
      border-color: var(--q-color);
      color: var(--q-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      text-decoration: none;
    }
    .quick-btn-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: var(--brand-subtle);
      color: var(--brand);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .quick-btn:hover .quick-btn-icon {
      background: color-mix(in srgb, var(--q-color) 15%, transparent);
      color: var(--q-color);
    }
    .quick-btn-icon mat-icon { font-size: 1.2rem; }

    /* ── Analytics row ─────────────────────────────────────────────────────── */
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 22px;
    }
    .chart-wrap--md  { height: 220px; position: relative; }
    .chart-wrap--donut { height: 150px; position: relative; }
    .dual-donut {
      display: flex; align-items: stretch; gap: 0;
      padding: 8px 0 0;
    }
    .donut-block { flex: 1; display: flex; flex-direction: column; }
    .donut-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .donut-divider { width: 1px; background: var(--border-color); margin: 0 10px; }

    /* ── Bottom grid ───────────────────────────────────────────────────────── */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }

    /* ── Section header ────────────────────────────────────────────────────── */
    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .section-title {
      display: flex; align-items: center; gap: 7px;
      font-size: 0.9rem; font-weight: 700; color: var(--text-primary);
    }
    .section-title mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; color: var(--brand); }
    .see-all {
      font-size: 0.75rem; font-weight: 600;
      color: var(--brand); text-decoration: none;
      transition: opacity 0.15s;
    }
    .see-all:hover { opacity: 0.75; text-decoration: none; }

    /* ── Deadlines card ────────────────────────────────────────────────────── */
    .deadlines-card, .activity-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px;
    }
    .deadlines-list { display: flex; flex-direction: column; gap: 10px; }
    .deadline-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .deadline-item:hover { background: var(--surface-hover); }
    .deadline-item.deadline-urgent { background: rgba(239,68,68,0.04); }
    .deadline-icon {
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .deadline-icon mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .dl-type-tax     { background: rgba(99,102,241,0.1);  color: #6366f1; }
    .dl-type-social  { background: rgba(59,130,246,0.1);  color: #3b82f6; }
    .dl-type-hr      { background: rgba(34,197,94,0.1);   color: #22c55e; }
    .dl-type-legal   { background: rgba(245,158,11,0.1);  color: #f59e0b; }
    .deadline-info { flex: 1; min-width: 0; }
    .deadline-title {
      font-size: 0.82rem; font-weight: 600;
      color: var(--text-primary); white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .deadline-date { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
    .deadline-badge {
      font-size: 0.68rem; font-weight: 700;
      padding: 3px 8px; border-radius: 999px;
      flex-shrink: 0;
    }
    .dl-badge-red   { background: rgba(239,68,68,0.12); color: #ef4444; }
    .dl-badge-amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .dl-badge-green { background: rgba(34,197,94,0.12);  color: #22c55e; }

    /* ── Activity card ─────────────────────────────────────────────────────── */
    .activity-list { display: flex; flex-direction: column; gap: 10px; }
    .activity-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .activity-item:hover { background: var(--surface-hover); }
    .activity-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .activity-icon mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .activity-info { flex: 1; min-width: 0; }
    .activity-action {
      font-size: 0.8rem; font-weight: 600;
      color: var(--text-primary);
    }
    .activity-detail {
      font-size: 0.72rem; color: var(--text-muted);
      margin-top: 2px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .activity-time {
      font-size: 0.68rem; color: var(--text-faint);
      white-space: nowrap; flex-shrink: 0;
    }

    /* ── Responsive ─────────────────────────────────────────────────────────── */
    @media (max-width: 1280px) {
      .main-grid      { grid-template-columns: 1fr; }
      .side-col       { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
      .analytics-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 900px) {
      .analytics-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .kpi-grid     { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .main-grid    { grid-template-columns: 1fr; }
      .side-col     { grid-template-columns: 1fr; }
      .bottom-grid  { grid-template-columns: 1fr; }
      .analytics-grid { grid-template-columns: 1fr; }
      .welcome-banner { flex-direction: column; align-items: flex-start; }
      .welcome-actions { width: 100%; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth  = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly compliance = inject(ComplianceService);
  private readonly employees  = inject(EmployeeService);
  private readonly documents  = inject(DocumentService);
  private readonly auditLogs  = inject(AuditLogService);

  readonly today = new Date();

  // ── Data ──────────────────────────────────────────────────────────────────
  readonly stats = signal<DashboardStats>({
    employee_count: 0, document_count: 0, expired_docs: 0,
    expiring_soon_docs: 0, compliance_score: 0,
    compliant_items: 0, pending_compliance: 0,
    overdue_compliance: 0, total_compliance_items: 0,
    department_count: 5,
  });

  readonly upcomingDeadlines = signal<Deadline[]>([]);
  readonly recentActivity    = signal<ActivityItem[]>([]);

  // ── Chart data ─────────────────────────────────────────────────────────────
  readonly complianceTrendData: ChartData<'line'> = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      label: 'Compliance %',
      data: [68, 72, 79, 84, 89, 94],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  readonly docActivityData: ChartData<'bar'> = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      { label: 'Uploaded', data: [12, 18, 15, 22, 28, 19], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
      { label: 'Expired',  data: [3, 1, 4, 2, 1, 0],      backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 6, borderSkipped: false },
    ],
  };

  readonly deptHeadcountData: ChartData<'bar'> = {
    labels: ['Administration', 'IT', 'HR', 'Finance', 'Marketing & Sales'],
    datasets: [{
      label: 'Employees',
      data: [1, 1, 1, 2, 2],
      backgroundColor: [
        'rgba(245,158,11,0.8)', 'rgba(59,130,246,0.8)',
        'rgba(34,197,94,0.8)',  'rgba(99,102,241,0.8)',
        'rgba(236,72,153,0.8)',
      ],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  readonly contractTypeData: ChartData<'doughnut'> = {
    labels: ['Permanent', 'Fixed-Term', 'Internship', 'Consultant', 'Part-Time'],
    datasets: [{
      data: [5, 2, 0, 0, 0],
      backgroundColor: ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'],
      borderColor: 'transparent',
      hoverOffset: 8,
    }],
  };

  readonly authorityComplianceData: ChartData<'bar'> = {
    labels: ['Tax Authority', 'Social Security', 'Labour Dept', 'Business Registry'],
    datasets: [
      { label: 'Compliant', data: [2, 1, 1, 0], backgroundColor: 'rgba(34,197,94,0.85)',  borderRadius: 4, borderSkipped: false },
      { label: 'Pending',   data: [2, 0, 0, 1], backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 4, borderSkipped: false },
      { label: 'Overdue',   data: [0, 1, 0, 0], backgroundColor: 'rgba(239,68,68,0.85)',  borderRadius: 4, borderSkipped: false },
    ],
  };

  readonly empStatusData: ChartData<'doughnut'> = {
    labels: ['Active', 'Probation', 'On Leave', 'Terminated'],
    datasets: [{
      data: [5, 1, 0, 0],
      backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
      borderColor: 'transparent',
      hoverOffset: 8,
    }],
  };

  // ── Chart options (updated on theme change) ────────────────────────────────
  lineChartOptions:        ChartConfiguration['options'] = this.buildLineOptions();
  barChartOptions:         ChartConfiguration['options'] = this.buildBarOptions();
  hBarChartOptions:        ChartConfiguration['options'] = this.buildHBarOptions();
  stackedBarOptions:       ChartConfiguration['options'] = this.buildStackedBarOptions();
  doughnutChartOptions:    ChartConfiguration['options'] = this.buildDoughnutOptions();

  // ── Chart ring ─────────────────────────────────────────────────────────────
  readonly ringCircumference = 2 * Math.PI * 52; // r=52

  readonly trendDelta    = computed(() => 5);
  readonly trendBadgeBg  = computed(() => this.theme.isDark() ? 'rgba(34,197,94,0.12)' : '#dcfce7');
  readonly trendBadgeColor = computed(() => '#22c55e');

  readonly scoreLabel = computed(() => {
    const s = this.stats().compliance_score;
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'At Risk';
  });

  readonly scoreRingColor = computed(() => {
    const s = this.stats().compliance_score;
    return s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';
  });

  readonly ringDashOffset = computed(() => {
    const pct = this.stats().compliance_score / 100;
    return this.ringCircumference * (1 - pct);
  });

  // ── Quick actions ──────────────────────────────────────────────────────────
  readonly quickActions = [
    { label: 'Add Employee',    icon: 'person_add',   route: '/employees/new',      color: '#3b82f6' },
    { label: 'Upload Document', icon: 'upload_file',  route: '/documents/upload',   color: '#8b5cf6' },
    { label: 'Compliance',      icon: 'checklist',    route: '/compliance',         color: '#22c55e' },
    { label: 'New Report',      icon: 'description',  route: '/reports/new',        color: '#f59e0b' },
  ];

  constructor() {
    // Update chart options when theme changes
    effect(() => {
      this.lineChartOptions     = this.buildLineOptions();
      this.barChartOptions      = this.buildBarOptions();
      this.hBarChartOptions     = this.buildHBarOptions();
      this.stackedBarOptions    = this.buildStackedBarOptions();
      this.doughnutChartOptions = this.buildDoughnutOptions();
    });
  }

  ngOnInit(): void {
    this.compliance.getDashboard().subscribe({
      next: (res) => this.stats.update(s => ({
        ...s,
        compliance_score:       res.score,
        compliant_items:        res.compliant,
        pending_compliance:     res.pending,
        overdue_compliance:     res.overdue,
        total_compliance_items: res.total,
      })),
      error: () => {},
    });

    this.employees.list({ page_size: 1 }).subscribe({
      next: (res) => this.stats.update(s => ({ ...s, employee_count: res.count })),
      error: () => {},
    });

    this.documents.list({ page_size: 1 }).subscribe({
      next: (res) => this.stats.update(s => ({ ...s, document_count: res.count })),
      error: () => {},
    });

    this.employees.listDepartments().subscribe({
      next: (res) => this.stats.update(s => ({ ...s, department_count: res.count })),
      error: () => {},
    });

    this.compliance.listRecords({ status: 'pending', ordering: 'due_date', page_size: 5 }).subscribe({
      next: (res) => {
        if (!res.results?.length) return;
        const now = Date.now();
        this.upcomingDeadlines.set(res.results.map(r => {
          const dueDate = new Date(r.due_date);
          const authorityLower = (r.authority ?? '').toLowerCase();
          const type: Deadline['type'] =
            authorityLower.includes('tax')    ? 'tax'    :
            authorityLower.includes('social') ? 'social' :
            authorityLower.includes('labour') || authorityLower.includes('labor') ? 'hr' : 'legal';
          return {
            title: r.requirement_title,
            date: dueDate,
            type,
            daysLeft: Math.ceil((dueDate.getTime() - now) / 86_400_000),
          };
        }));
      },
      error: () => {},
    });

    this.auditLogs.list({ page_size: 5, ordering: '-created_at' }).subscribe({
      next: (res) => {
        if (!res.results?.length) return;
        const now = Date.now();
        this.recentActivity.set(res.results.map(log => {
          const method = (log.method ?? '').toUpperCase();
          const action = method === 'POST' ? 'Created' : method === 'DELETE' ? 'Deleted' :
                         (method === 'PUT' || method === 'PATCH') ? 'Updated' : 'Viewed';
          const icon   = method === 'POST' ? 'add_circle' : method === 'DELETE' ? 'delete' :
                         (method === 'PUT' || method === 'PATCH') ? 'edit' : 'visibility';
          const sc     = log.status_code ?? 200;
          const color  = sc < 300 ? '#22c55e' : sc < 500 ? '#f59e0b' : '#ef4444';
          const detail = (log.path ?? '').replace(/^\/api\/v1\//, '').replace(/\/[^/]+\/$/, '/').replace(/\//g, ' › ').trim();
          const ms = now - new Date(log.created_at).getTime();
          const time = ms < 3_600_000 ? `${Math.floor(ms / 60_000)}m ago` :
                       ms < 86_400_000 ? `${Math.floor(ms / 3_600_000)}h ago` :
                       ms < 172_800_000 ? 'Yesterday' : `${Math.floor(ms / 86_400_000)}d ago`;
          return { action, detail, time, icon, color };
        }));
      },
      error: () => {},
    });
  }

  kpiCards() {
    const s = this.stats();
    return [
      {
        label: 'Active Employees', value: s.employee_count, icon: 'group',
        gradientBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6',
        sub: '+3 this month', subIcon: 'trending_up', subColor: '#22c55e',
        sparkline: [4, 5, 5, 6, 6, 7, s.employee_count || 8],
        meta: [
          { label: 'On Leave',    value: 2 },
          { label: 'New Hires',   value: '+3' },
          { label: 'Contractors', value: 1 },
        ],
      },
      {
        label: 'Total Documents', value: s.document_count, icon: 'folder_open',
        gradientBg: 'rgba(139,92,246,0.12)', iconColor: '#8b5cf6',
        sub: '+12 this month', subIcon: 'trending_up', subColor: '#22c55e',
        sparkline: [45, 52, 58, 63, 68, 70, s.document_count || 72],
        meta: [
          { label: 'Uploaded',    value: '+12' },
          { label: 'Expired',     value: s.expired_docs || 2 },
          { label: 'Pending OCR', value: 3 },
        ],
      },
      {
        label: 'Compliance Score', value: `${s.compliance_score}%`, icon: 'verified_user',
        gradientBg: s.compliance_score >= 80 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
        iconColor:  s.compliance_score >= 80 ? '#22c55e' : '#f59e0b',
        sub: '+5% vs last month', subIcon: 'trending_up', subColor: '#22c55e',
        sparkline: [68, 72, 79, 84, 89, 92, s.compliance_score || 94],
        meta: [
          { label: 'Compliant', value: s.compliant_items || 47 },
          { label: 'Pending',   value: s.pending_compliance || 3 },
          { label: 'Overdue',   value: s.overdue_compliance || 1 },
        ],
      },
      {
        label: 'Expiring Soon', value: s.expiring_soon_docs, icon: 'hourglass_bottom',
        gradientBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b',
        warning: s.expiring_soon_docs > 0,
        sub: s.expiring_soon_docs > 0 ? 'Action required' : 'All good',
        subIcon: s.expiring_soon_docs > 0 ? 'warning' : 'check', subColor: s.expiring_soon_docs > 0 ? '#f59e0b' : '#22c55e',
        sparkline: [3, 2, 4, 1, 2, 1, s.expiring_soon_docs],
        meta: [
          { label: 'Next 7d',  value: 0 },
          { label: 'Next 30d', value: 2 },
          { label: 'Reviewed', value: '100%' },
        ],
      },
      {
        label: 'Overdue Items', value: s.overdue_compliance, icon: 'error_outline',
        gradientBg: 'rgba(239,68,68,0.12)', iconColor: '#ef4444',
        danger: s.overdue_compliance > 0,
        sub: s.overdue_compliance > 0 ? 'Needs attention' : 'All clear',
        subIcon: s.overdue_compliance > 0 ? 'priority_high' : 'check_circle', subColor: s.overdue_compliance > 0 ? '#ef4444' : '#22c55e',
        sparkline: [2, 3, 1, 2, 2, 1, s.overdue_compliance || 1],
        meta: [
          { label: 'Critical', value: s.overdue_compliance || 1 },
          { label: 'High',     value: 0 },
          { label: 'Resolved', value: 4 },
        ],
      },
      {
        label: 'Departments', value: s.department_count, icon: 'account_tree',
        gradientBg: 'rgba(236,72,153,0.12)', iconColor: '#ec4899',
        sub: `${s.department_count} active teams`, subIcon: 'groups', subColor: '#ec4899',
        sparkline: [3, 3, 4, 4, 4, 5, s.department_count || 5],
        meta: [
          { label: 'Avg Size',   value: 2 },
          { label: 'Open Roles', value: 3 },
          { label: 'Largest',    value: 'Finance' },
        ],
      },
    ];
  }

  // ── Sparkline helpers ──────────────────────────────────────────────────────
  sparkLine(data: number[], w = 160, h = 28): string {
    if (!data?.length) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = (max - min) || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  sparkArea(data: number[], w = 160, h = 28): string {
    if (!data?.length) return '';
    return `${this.sparkLine(data, w, h)} L ${w} ${h + 3} L 0 ${h + 3} Z`;
  }

  sparkEnd(data: number[], w = 160, h = 28): { x: number; y: number } {
    if (!data?.length) return { x: 0, y: h / 2 };
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = (max - min) || 1;
    const last = data[data.length - 1];
    return {
      x: w,
      y: h - ((last - min) / range) * (h - 6) - 3,
    };
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  deadlineIcon(type: string): string {
    const map: Record<string, string> = {
      tax: 'receipt_long', social: 'health_and_safety',
      hr: 'badge', legal: 'gavel',
    };
    return map[type] ?? 'event';
  }

  // ── Chart builders ─────────────────────────────────────────────────────────
  private buildLineOptions(): ChartConfiguration['options'] {
    const c = this.theme.chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.tooltipTitle,
          bodyColor: c.tooltipBody,
          borderColor: c.tooltipBorder,
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid:  { color: c.gridColor, drawTicks: false },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } },
          border: { display: false },
        },
        y: {
          min: 0, max: 100,
          grid:  { color: c.gridColor, drawTicks: false },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 }, callback: (v) => `${v}%` },
          border: { display: false },
        },
      },
      interaction: { intersect: false, mode: 'index' },
      animation: { duration: 800, easing: 'easeInOutQuart' },
    };
  }

  private buildBarOptions(): ChartConfiguration['options'] {
    const c = this.theme.chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg, titleColor: c.tooltipTitle,
          bodyColor: c.tooltipBody, borderColor: c.tooltipBorder,
          borderWidth: 1, cornerRadius: 10, padding: 10,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } }, border: { display: false } },
        y: { grid: { color: c.gridColor, drawTicks: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 }, stepSize: 5 }, border: { display: false } },
      },
      animation: { duration: 700, easing: 'easeInOutQuart' },
    };
  }

  private buildHBarOptions(): ChartConfiguration['options'] {
    const c = this.theme.chartColors();
    return {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg, titleColor: c.tooltipTitle,
          bodyColor: c.tooltipBody, borderColor: c.tooltipBorder,
          borderWidth: 1, cornerRadius: 10, padding: 10,
        },
      },
      scales: {
        x: { grid: { color: c.gridColor, drawTicks: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 }, stepSize: 1 }, border: { display: false } },
        y: { grid: { display: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } }, border: { display: false } },
      },
      animation: { duration: 700, easing: 'easeInOutQuart' },
    };
  }

  private buildStackedBarOptions(): ChartConfiguration['options'] {
    const c = this.theme.chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: c.tickColor, font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 16 },
        },
        tooltip: {
          backgroundColor: c.tooltipBg, titleColor: c.tooltipTitle,
          bodyColor: c.tooltipBody, borderColor: c.tooltipBorder,
          borderWidth: 1, cornerRadius: 10, padding: 10,
        },
      },
      scales: {
        x: { stacked: false, grid: { display: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 10 } }, border: { display: false } },
        y: { stacked: false, grid: { color: c.gridColor, drawTicks: false }, ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 }, stepSize: 1 }, border: { display: false } },
      },
      animation: { duration: 700, easing: 'easeInOutQuart' },
    };
  }

  private buildDoughnutOptions(): ChartConfiguration['options'] {
    const c = this.theme.chartColors();
    // Use unknown cast to include doughnut-specific 'cutout' option
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: c.tickColor, font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 },
        },
        tooltip: {
          backgroundColor: c.tooltipBg, titleColor: c.tooltipTitle,
          bodyColor: c.tooltipBody, borderColor: c.tooltipBorder,
          borderWidth: 1, cornerRadius: 10, padding: 10,
        },
      },
      animation: { duration: 700, easing: 'easeInOutQuart' },
      // @ts-ignore — cutout is a valid doughnut option not in the generic type
      cutout: '72%',
    } as ChartConfiguration['options'];
  }
}
