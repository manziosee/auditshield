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
import { ApiService } from '../../core/services/api.service';
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
        @for (kpi of kpiCards(); track kpi.label) {
          <div class="kpi-card" [class.kpi-danger]="kpi.danger" [class.kpi-warning]="kpi.warning">
            <div class="kpi-icon-wrap" [style.background]="kpi.gradientBg">
              <mat-icon [style.color]="kpi.iconColor">{{ kpi.icon }}</mat-icon>
            </div>
            <div class="kpi-body">
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
              @if (kpi.sub) {
                <div class="kpi-sub" [style.color]="kpi.subColor">
                  <mat-icon style="font-size:0.8rem;width:0.8rem;height:0.8rem">{{ kpi.subIcon }}</mat-icon>
                  {{ kpi.sub }}
                </div>
              }
            </div>
            @if (kpi.danger || kpi.warning) {
              <div class="kpi-alert-dot"></div>
            }
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
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 14px;
    }
    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      position: relative;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      overflow: hidden;
    }
    .kpi-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .kpi-card.kpi-danger  { border-left: 3px solid #ef4444; }
    .kpi-card.kpi-warning { border-left: 3px solid #f59e0b; }

    .kpi-icon-wrap {
      width: 46px; height: 46px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon-wrap mat-icon { font-size: 1.4rem; width: 1.4rem; height: 1.4rem; }

    .kpi-body { flex: 1; min-width: 0; }
    .kpi-value {
      font-size: 1.75rem; font-weight: 800;
      color: var(--text-primary);
      line-height: 1; margin-bottom: 4px;
    }
    .kpi-label {
      font-size: 0.75rem; color: var(--text-muted);
      font-weight: 500;
    }
    .kpi-sub {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.7rem; font-weight: 600;
      margin-top: 5px;
    }
    .kpi-alert-dot {
      position: absolute; top: 12px; right: 12px;
      width: 8px; height: 8px; border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239,68,68,0.6);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.3); opacity: 0.7; }
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
      .main-grid { grid-template-columns: 1fr; }
      .side-col  { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    }
    @media (max-width: 768px) {
      .kpi-grid     { grid-template-columns: repeat(2, 1fr); }
      .main-grid    { grid-template-columns: 1fr; }
      .side-col     { grid-template-columns: 1fr; }
      .bottom-grid  { grid-template-columns: 1fr; }
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
  private readonly api = inject(ApiService);

  readonly today = new Date();

  // ── Data ──────────────────────────────────────────────────────────────────
  readonly stats = signal<DashboardStats>({
    employee_count: 0, document_count: 0, expired_docs: 0,
    expiring_soon_docs: 0, compliance_score: 0,
    compliant_items: 0, pending_compliance: 0,
    overdue_compliance: 0, total_compliance_items: 0,
  });

  readonly upcomingDeadlines = signal<Deadline[]>([
    { title: 'PAYE Filing — March',       date: new Date('2026-03-07'), type: 'tax',    daysLeft: 10 },
    { title: 'RSSB Contribution — March', date: new Date('2026-03-10'), type: 'social', daysLeft: 13 },
    { title: 'VAT Return Q1',             date: new Date('2026-03-31'), type: 'tax',    daysLeft: 34 },
    { title: 'Contract Review — Batch A', date: new Date('2026-04-01'), type: 'hr',     daysLeft: 35 },
    { title: 'Labour Compliance Audit',   date: new Date('2026-04-15'), type: 'legal',  daysLeft: 49 },
  ]);

  readonly recentActivity = signal<ActivityItem[]>([
    { action: 'Document uploaded',         detail: 'Employment Contract — Jean-Pierre K.',  time: '2h ago',   icon: 'upload_file', color: '#6366f1' },
    { action: 'Compliance item resolved',  detail: 'PAYE February filing marked complete',  time: '5h ago',   icon: 'check_circle', color: '#22c55e' },
    { action: 'New employee onboarded',    detail: 'Alice Mukamana — Accountant',           time: 'Yesterday', icon: 'person_add',  color: '#3b82f6' },
    { action: 'Document expiring soon',    detail: 'Work Permit — Bruno N. (7 days left)',  time: 'Yesterday', icon: 'warning',     color: '#f59e0b' },
    { action: 'Audit report generated',    detail: 'RSSB Q4 2025 Compliance Report (PDF)', time: '2d ago',   icon: 'description', color: '#8b5cf6' },
  ]);

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

  // ── Chart options (updated on theme change) ────────────────────────────────
  lineChartOptions: ChartConfiguration['options'] = this.buildLineOptions();
  barChartOptions:  ChartConfiguration['options'] = this.buildBarOptions();

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
      this.lineChartOptions = this.buildLineOptions();
      this.barChartOptions  = this.buildBarOptions();
    });
  }

  ngOnInit(): void {
    // Load compliance stats
    this.api.get<{ score: number; compliant: number; pending: number; overdue: number; total: number }>(
      'compliance/dashboard/'
    ).subscribe({
      next: (res) => this.stats.update(s => ({
        ...s,
        compliance_score:     res.score      ?? s.compliance_score,
        compliant_items:      res.compliant  ?? s.compliant_items,
        pending_compliance:   res.pending    ?? s.pending_compliance,
        overdue_compliance:   res.overdue    ?? s.overdue_compliance,
        total_compliance_items: res.total    ?? s.total_compliance_items,
      })),
      error: () => {
        // Demo fallback
        this.stats.update(s => ({
          ...s, compliance_score: 94, compliant_items: 47,
          pending_compliance: 3, overdue_compliance: 1, total_compliance_items: 51,
        }));
      },
    });

    // Load employee count
    this.api.get<{ count: number }>('employees/?page_size=1').subscribe({
      next: (res) => this.stats.update(s => ({ ...s, employee_count: res.count ?? 47 })),
      error: () => this.stats.update(s => ({ ...s, employee_count: 47 })),
    });

    // Load document stats
    this.api.get<{ count: number; expired_count?: number; expiring_soon?: number }>(
      'documents/?page_size=1'
    ).subscribe({
      next: (res) => this.stats.update(s => ({
        ...s,
        document_count:     res.count          ?? s.document_count,
        expired_docs:       res.expired_count  ?? s.expired_docs,
        expiring_soon_docs: res.expiring_soon  ?? s.expiring_soon_docs,
      })),
      error: () => this.stats.update(s => ({
        ...s, document_count: 183, expired_docs: 2, expiring_soon_docs: 5,
      })),
    });
  }

  kpiCards() {
    const s = this.stats();
    return [
      {
        label: 'Active Employees', value: s.employee_count, icon: 'group',
        gradientBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6',
        sub: '+3 this month', subIcon: 'trending_up', subColor: '#22c55e',
      },
      {
        label: 'Total Documents', value: s.document_count, icon: 'folder_open',
        gradientBg: 'rgba(139,92,246,0.12)', iconColor: '#8b5cf6',
        sub: '+12 this month', subIcon: 'trending_up', subColor: '#22c55e',
      },
      {
        label: 'Compliance Score', value: `${s.compliance_score}%`, icon: 'verified_user',
        gradientBg: s.compliance_score >= 80 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
        iconColor:  s.compliance_score >= 80 ? '#22c55e' : '#f59e0b',
        sub: '+5% vs last month', subIcon: 'trending_up', subColor: '#22c55e',
      },
      {
        label: 'Expiring Soon', value: s.expiring_soon_docs, icon: 'hourglass_bottom',
        gradientBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b',
        warning: s.expiring_soon_docs > 0,
        sub: s.expiring_soon_docs > 0 ? 'Action required' : 'All good',
        subIcon: s.expiring_soon_docs > 0 ? 'warning' : 'check', subColor: s.expiring_soon_docs > 0 ? '#f59e0b' : '#22c55e',
      },
      {
        label: 'Overdue Items', value: s.overdue_compliance, icon: 'error_outline',
        gradientBg: 'rgba(239,68,68,0.12)', iconColor: '#ef4444',
        danger: s.overdue_compliance > 0,
        sub: s.overdue_compliance > 0 ? 'Needs attention' : 'All clear',
        subIcon: s.overdue_compliance > 0 ? 'priority_high' : 'check_circle', subColor: s.overdue_compliance > 0 ? '#ef4444' : '#22c55e',
      },
    ];
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
          grid:  { display: false },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 } },
          border: { display: false },
        },
        y: {
          grid:  { color: c.gridColor, drawTicks: false },
          ticks: { color: c.tickColor, font: { family: 'Inter', size: 11 }, stepSize: 5 },
          border: { display: false },
        },
      },
      animation: { duration: 700, easing: 'easeInOutQuart' },
    };
  }
}
