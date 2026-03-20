import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../../core/services/api.service';

type Priority = 'critical' | 'high' | 'medium';

interface GapItem {
  requirement_id: string;
  title: string;
  authority: string;
  authority_type: string;
  frequency: string;
  is_mandatory: boolean;
  penalty_description: string;
  category: string;
  priority: Priority;
}

interface GapAnalysisResult {
  total_gaps: number;
  coverage_percent: number;
  gaps: GapItem[];
}

@Component({
  selector: 'as-gap-analysis',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatTooltipModule,
    MatChipsModule, MatProgressBarModule,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <a mat-icon-button routerLink="/compliance" class="back-btn" matTooltip="Back to Compliance">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div class="header-text">
            <h2>Compliance Gap Analysis</h2>
            <p class="subtitle">Identify untracked obligations and coverage gaps across all authorities</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48" />
          <p>Analysing compliance gaps…</p>
        </div>
      }

      @if (!loading() && result()) {
        <!-- Stats row -->
        <div class="stats-row">
          <!-- Coverage donut -->
          <mat-card class="stat-card stat-coverage">
            <div class="coverage-wrap">
              <div class="donut-ring">
                <svg viewBox="0 0 44 44" class="donut-svg">
                  <circle class="donut-track" cx="22" cy="22" r="16" />
                  <circle
                    class="donut-fill"
                    cx="22" cy="22" r="16"
                    [attr.stroke-dasharray]="coverageDash()"
                    stroke-dashoffset="0"
                  />
                </svg>
                <span class="donut-label">{{ result()!.coverage_percent }}%</span>
              </div>
              <div class="coverage-text">
                <span class="coverage-title">Coverage</span>
                <span class="coverage-sub">compliance coverage</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon-box neutral">
              <mat-icon class="stat-icon icon-neutral">analytics</mat-icon>
            </div>
            <div class="stat-body">
              <span class="stat-num">{{ result()!.total_gaps }}</span>
              <span class="stat-label">Total Gaps</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon-box critical">
              <mat-icon class="stat-icon icon-critical">error_outline</mat-icon>
            </div>
            <div class="stat-body">
              <span class="stat-num">{{ criticalCount() }}</span>
              <span class="stat-label">Critical</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon-box high">
              <mat-icon class="stat-icon icon-high">warning_amber</mat-icon>
            </div>
            <div class="stat-body">
              <span class="stat-num">{{ highCount() }}</span>
              <span class="stat-label">High Priority</span>
            </div>
          </mat-card>
        </div>

        <!-- Priority filter -->
        <div class="filter-row">
          <span class="filter-label">Filter by priority:</span>
          <div class="filter-chips">
            @for (opt of priorityOptions; track opt.value) {
              <button
                class="filter-chip"
                [class.filter-chip--active]="activePriority() === opt.value"
                (click)="activePriority.set(opt.value)"
              >
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Gap cards -->
        @if (filteredGaps().length === 0 && result()!.total_gaps === 0) {
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <mat-icon>verified</mat-icon>
            </div>
            <h3>All obligations tracked</h3>
            <p>No compliance gaps detected. Your company is tracking all known requirements.</p>
          </div>
        } @else if (filteredGaps().length === 0) {
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <mat-icon>filter_alt</mat-icon>
            </div>
            <h3>No gaps in this priority</h3>
            <p>Try a different filter to see other gaps.</p>
          </div>
        } @else {
          <div class="gap-list">
            @for (gap of filteredGaps(); track gap.requirement_id) {
              <mat-card class="gap-card">
                <div class="gap-header">
                  <span class="priority-badge" [class]="priorityClass(gap.priority)">
                    <mat-icon class="badge-icon">{{ priorityIcon(gap.priority) }}</mat-icon>
                    {{ gap.priority | titlecase }}
                  </span>
                  @if (gap.is_mandatory) {
                    <span class="mandatory-badge">Mandatory</span>
                  }
                </div>

                <div class="gap-body">
                  <div class="gap-main">
                    <div class="gap-title">{{ gap.title }}</div>
                    <div class="gap-category">{{ gap.category }}</div>
                  </div>

                  <div class="gap-meta">
                    <div class="meta-chips">
                      <span class="authority-chip" [class]="authorityClass(gap.authority_type)">
                        {{ gap.authority }}
                      </span>
                      <span class="freq-chip">{{ formatFreq(gap.frequency) }}</span>
                    </div>

                    <div
                      class="penalty-text"
                      [matTooltip]="gap.penalty_description"
                      matTooltipPosition="above"
                    >
                      <mat-icon class="penalty-icon">gavel</mat-icon>
                      <span class="penalty-desc">{{ gap.penalty_description }}</span>
                    </div>
                  </div>
                </div>
              </mat-card>
            }
          </div>
        }
      }

      @if (!loading() && !result()) {
        <div class="nodata-state">
          <mat-icon class="nodata-icon">analytics</mat-icon>
          <h3>Gap analysis unavailable</h3>
          <p>The backend could not return data right now. This usually means no compliance requirements have been seeded for your company's industry yet.</p>
          <button mat-stroked-button (click)="load()" style="color:var(--brand);border-color:var(--brand);">
            <mat-icon>refresh</mat-icon> Retry
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { display: flex; flex-direction: column; gap: 24px; padding-bottom: 32px; }

    /* ── Header ──────────────────────────────────────────────────────────────── */
    .page-header { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .back-btn { color: var(--brand) !important; }
    .header-text h2 {
      margin: 0 0 3px;
      font-family: var(--font-display);
      font-size: 1.5rem; font-weight: 800;
      color: var(--text-primary);
    }
    .subtitle { margin: 0; color: var(--text-muted); font-size: 0.875rem; }

    /* ── Loading ─────────────────────────────────────────────────────────────── */
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px; padding: 80px 24px;
      color: var(--text-muted);
    }
    .loading-state p { margin: 0; font-size: 0.9rem; }

    /* ── Stats row ───────────────────────────────────────────────────────────── */
    .stats-row {
      display: grid; grid-template-columns: auto 1fr 1fr 1fr; gap: 16px;
    }
    .stat-card {
      padding: 20px !important;
      display: flex; align-items: center; gap: 16px;
      background: var(--surface-1) !important;
      border: 1px solid var(--border-color) !important;
      border-radius: 16px !important;
      box-shadow: var(--shadow-sm) !important;
    }
    .stat-coverage { min-width: 180px; }
    .coverage-wrap { display: flex; align-items: center; gap: 16px; }

    /* Donut ring */
    .donut-ring { position: relative; width: 76px; height: 76px; flex-shrink: 0; }
    .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-track { fill: none; stroke: var(--border-color); stroke-width: 4; }
    .donut-fill {
      fill: none; stroke: var(--brand); stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1);
      filter: drop-shadow(0 0 4px rgba(34,197,94,0.4));
    }
    .donut-label {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display);
      font-size: 0.9rem; font-weight: 800;
      color: var(--text-primary);
    }
    .coverage-text { display: flex; flex-direction: column; gap: 2px; }
    .coverage-title {
      font-family: var(--font-display);
      font-size: 1rem; font-weight: 700;
      color: var(--text-primary);
    }
    .coverage-sub { font-size: 0.72rem; color: var(--text-muted); }

    /* Stat number cards */
    .stat-icon-box {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .stat-icon-box.neutral { background: var(--brand-subtle); }
    .stat-icon-box.critical { background: var(--danger-bg); }
    .stat-icon-box.high { background: var(--warning-bg); }
    .stat-icon { font-size: 1.3rem; height: 1.3rem; width: 1.3rem; }
    .icon-neutral { color: var(--brand); }
    .icon-critical { color: var(--danger); }
    .icon-high { color: var(--warning); }
    .stat-body { display: flex; flex-direction: column; gap: 2px; }
    .stat-num {
      font-family: var(--font-display);
      font-size: 1.8rem; font-weight: 800;
      color: var(--text-primary); line-height: 1;
    }
    .stat-label {
      font-size: 0.72rem; font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.06em;
    }

    /* ── Filter row ──────────────────────────────────────────────────────────── */
    .filter-row {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 4px 0;
    }
    .filter-label {
      font-size: 0.8rem; font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.08em;
    }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      padding: 6px 18px; border-radius: 20px;
      border: 1.5px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem; font-weight: 500;
      font-family: var(--font-body);
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    .filter-chip:hover {
      border-color: var(--brand);
      color: var(--brand);
      background: var(--brand-subtle);
    }
    .filter-chip--active {
      border-color: var(--brand);
      color: var(--brand);
      background: var(--brand-subtle);
      font-weight: 700;
    }

    /* ── Gap list ────────────────────────────────────────────────────────────── */
    .gap-list { display: flex; flex-direction: column; gap: 12px; }

    .gap-card {
      padding: 20px !important;
      background: var(--surface-1) !important;
      border: 1px solid var(--border-color) !important;
      border-radius: 16px !important;
      box-shadow: var(--shadow-xs) !important;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .gap-card:hover {
      border-color: rgba(34,197,94,0.25) !important;
      box-shadow: var(--shadow-sm), 0 0 0 1px rgba(34,197,94,0.1) !important;
    }
    .gap-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }

    /* Priority badges */
    .priority-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 20px;
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.04em; text-transform: uppercase;
    }
    .priority-badge.critical {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239,68,68,0.2);
    }
    .priority-badge.high {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245,158,11,0.2);
    }
    .priority-badge.medium {
      background: rgba(234,179,8,0.1);
      color: #fbbf24;
      border: 1px solid rgba(234,179,8,0.2);
    }
    html.dark-theme .priority-badge.medium { color: #fbbf24; }
    .badge-icon { font-size: 0.85rem; height: 0.85rem; width: 0.85rem; }

    .mandatory-badge {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 6px;
      background: rgba(99,102,241,0.12);
      color: #a78bfa;
      border: 1px solid rgba(99,102,241,0.2);
      font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.07em;
    }

    /* Gap body layout */
    .gap-body {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 24px; flex-wrap: wrap;
    }
    .gap-main { flex: 1; min-width: 200px; }
    .gap-title {
      font-size: 1rem; font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 5px;
    }
    .gap-category { font-size: 0.8rem; color: var(--text-muted); }

    .gap-meta { display: flex; flex-direction: column; gap: 10px; min-width: 200px; }
    .meta-chips { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

    /* Authority chips — theme-aware */
    .authority-chip {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 6px;
      font-size: 0.72rem; font-weight: 600;
      border: 1px solid transparent;
    }
    .auth-tax {
      background: rgba(234,179,8,0.12); color: #fbbf24;
      border-color: rgba(234,179,8,0.2);
    }
    html.dark-theme .auth-tax { color: #fbbf24; background: rgba(234,179,8,0.1); }
    .auth-social_security {
      background: rgba(59,130,246,0.1); color: #3b82f6;
      border-color: rgba(59,130,246,0.2);
    }
    .auth-labour {
      background: var(--brand-subtle); color: var(--brand);
      border-color: rgba(34,197,94,0.2);
    }
    .auth-registry {
      background: rgba(168,85,247,0.1); color: #a855f7;
      border-color: rgba(168,85,247,0.2);
    }
    .auth-other {
      background: var(--surface-2); color: var(--text-muted);
      border-color: var(--border-color);
    }

    .freq-chip {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 20px;
      background: var(--surface-2);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      font-size: 0.72rem; font-weight: 500;
    }

    .penalty-text {
      display: flex; align-items: flex-start; gap: 6px;
      cursor: help;
    }
    .penalty-icon {
      font-size: 0.95rem; height: 0.95rem; width: 0.95rem;
      color: var(--text-faint); flex-shrink: 0; margin-top: 2px;
    }
    .penalty-desc {
      font-size: 0.8rem; line-height: 1.5;
      color: var(--text-muted);
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      max-width: 340px;
    }

    /* ── Empty / All-clear state ─────────────────────────────────────────────── */
    .empty-state {
      text-align: center; padding: 64px 24px;
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: 20px;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px; border-radius: 20px; margin: 0 auto 20px;
      background: var(--brand-subtle);
      border: 1px solid rgba(34,197,94,0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .empty-icon-wrap mat-icon {
      font-size: 2rem; height: 2rem; width: 2rem;
      color: var(--brand);
    }
    .empty-state h3 {
      margin: 0 0 8px;
      font-family: var(--font-display);
      font-size: 1.2rem; font-weight: 700;
      color: var(--text-primary);
    }
    .empty-state p { margin: 0 0 20px; color: var(--text-muted); font-size: 0.9rem; }

    /* No-data state */
    .nodata-state {
      text-align: center; padding: 64px 24px;
      background: var(--surface-1);
      border: 1px dashed var(--border-color);
      border-radius: 20px;
    }
    .nodata-icon {
      font-size: 3rem; height: 3rem; width: 3rem;
      color: var(--text-faint);
      display: block; margin: 0 auto 16px;
    }
    .nodata-state h3 {
      margin: 0 0 8px;
      font-family: var(--font-display);
      font-size: 1.1rem; font-weight: 700;
      color: var(--text-primary);
    }
    .nodata-state p { margin: 0 0 20px; color: var(--text-muted); font-size: 0.875rem; line-height: 1.6; }

    @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr 1fr; }
      .gap-body { flex-direction: column; }
    }
  `],
})
export class GapAnalysisComponent implements OnInit {
  private readonly api = inject(ApiService);

  result   = signal<GapAnalysisResult | null>(null);
  loading  = signal(false);
  activePriority = signal<Priority | 'all'>('all');

  readonly priorityOptions: { value: Priority | 'all'; label: string }[] = [
    { value: 'all',      label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high',     label: 'High' },
    { value: 'medium',   label: 'Medium' },
  ];

  criticalCount = computed(() => this.result()?.gaps.filter(g => g.priority === 'critical').length ?? 0);
  highCount     = computed(() => this.result()?.gaps.filter(g => g.priority === 'high').length ?? 0);

  filteredGaps = computed(() => {
    const gaps = this.result()?.gaps ?? [];
    const p = this.activePriority();
    return p === 'all' ? gaps : gaps.filter(g => g.priority === p);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.get<GapAnalysisResult>('compliance/gap-analysis/').subscribe({
      next: (res) => { this.result.set(res); this.loading.set(false); },
      error: ()  => { this.loading.set(false); },
    });
  }

  /** Returns SVG stroke-dasharray for the donut chart (circumference ≈ 100.53 for r=16) */
  coverageDash(): string {
    const pct  = this.result()?.coverage_percent ?? 0;
    const circ = 2 * Math.PI * 16; // ≈ 100.53
    const fill = (pct / 100) * circ;
    return `${fill.toFixed(2)} ${(circ - fill).toFixed(2)}`;
  }

  priorityClass(p: Priority): string {
    return p; // maps directly to css classes: .critical, .high, .medium
  }

  priorityIcon(p: Priority): string {
    const map: Record<Priority, string> = { critical: 'error', high: 'warning', medium: 'info' };
    return map[p] ?? 'circle';
  }

  authorityClass(type: string): string {
    const map: Record<string, string> = {
      tax: 'auth-tax',
      social_security: 'auth-social_security',
      labour: 'auth-labour',
      registry: 'auth-registry',
    };
    return `authority-chip ${map[type] ?? 'auth-other'}`;
  }

  formatFreq(f: string): string {
    const map: Record<string, string> = {
      one_time: 'One-time', monthly: 'Monthly', quarterly: 'Quarterly',
      annually: 'Annual', as_needed: 'As needed',
    };
    return map[f] ?? f;
  }
}
