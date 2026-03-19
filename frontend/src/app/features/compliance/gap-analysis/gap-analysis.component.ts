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
            <mat-icon class="stat-icon icon-neutral">analytics</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ result()!.total_gaps }}</span>
              <span class="stat-label">Total Gaps</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon icon-critical">error</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ criticalCount() }}</span>
              <span class="stat-label">Critical</span>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <mat-icon class="stat-icon icon-high">warning</mat-icon>
            <div class="stat-body">
              <span class="stat-num">{{ highCount() }}</span>
              <span class="stat-label">High</span>
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
        @if (filteredGaps().length === 0) {
          <div class="empty-state">
            <mat-icon>check_circle</mat-icon>
            <h3>No gaps found</h3>
            <p>No compliance gaps match the selected filter.</p>
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
        <div class="empty-state">
          <mat-icon>analytics</mat-icon>
          <h3>Could not load gap analysis</h3>
          <p>Please try again later.</p>
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
    .page-header { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .back-btn { color: #22c55e !important; }
    .header-text h2 { margin: 0 0 2px; font-size: 1.5rem; font-weight: 700; }
    .subtitle { margin: 0; color: #64748b; font-size: 0.875rem; }

    /* Loading */
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 16px; padding: 80px 24px;
      color: #64748b;
    }

    /* Stats row */
    .stats-row { display: grid; grid-template-columns: auto 1fr 1fr 1fr; gap: 16px; }
    .stat-card { padding: 20px !important; display: flex; align-items: center; gap: 16px; }
    .stat-coverage { min-width: 180px; }
    .coverage-wrap { display: flex; align-items: center; gap: 16px; }
    .donut-ring { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
    .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-track { fill: none; stroke: #e2e8f0; stroke-width: 4; }
    .donut-fill {
      fill: none; stroke: #22c55e; stroke-width: 4;
      stroke-linecap: round;
      transition: stroke-dasharray 0.6s ease;
    }
    .donut-label {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 800; color: #1e293b;
    }
    .coverage-text { display: flex; flex-direction: column; }
    .coverage-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
    .coverage-sub { font-size: 0.75rem; color: #64748b; }

    .stat-icon { font-size: 2rem; height: 2rem; width: 2rem; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: 1.7rem; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .icon-neutral { color: #0a0a0a; }
    .icon-critical { color: #ef4444; }
    .icon-high { color: #f59e0b; }

    /* Filter row */
    .filter-row {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 12px 0;
    }
    .filter-label { font-size: 0.875rem; font-weight: 600; color: #64748b; }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      padding: 6px 16px; border-radius: 20px; border: 1.5px solid #e2e8f0;
      background: transparent; color: #64748b; font-size: 0.8rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s;
    }
    .filter-chip:hover { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.06); }
    .filter-chip--active { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.1); font-weight: 700; }

    /* Gap list */
    .gap-list { display: flex; flex-direction: column; gap: 12px; }

    .gap-card { padding: 20px !important; }
    .gap-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }

    /* Priority badges */
    .priority-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
    }
    .priority-badge.critical { background: #fee2e2; color: #ef4444; }
    .priority-badge.high { background: #fff7ed; color: #f59e0b; }
    .priority-badge.medium { background: #fefce8; color: #ca8a04; }
    .badge-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }

    .mandatory-badge {
      display: inline-block; padding: 2px 8px; border-radius: 4px;
      background: #dbeafe; color: #1e40af;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }

    /* Gap body layout */
    .gap-body { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .gap-main { flex: 1; min-width: 200px; }
    .gap-title { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
    .gap-category { font-size: 0.8rem; color: #64748b; }

    .gap-meta { display: flex; flex-direction: column; gap: 10px; min-width: 200px; }
    .meta-chips { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

    .authority-chip {
      display: inline-block; padding: 3px 10px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 600;
    }
    .auth-tax { background: #fef9c3; color: #854d0e; }
    .auth-social_security { background: #dbeafe; color: #1e40af; }
    .auth-labour { background: #dcfce7; color: #14532d; }
    .auth-registry { background: #f3e8ff; color: #6b21a8; }
    .auth-other { background: #f1f5f9; color: #475569; }

    .freq-chip {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      background: #f1f5f9; color: #475569;
      font-size: 0.75rem; font-weight: 500;
    }

    .penalty-text {
      display: flex; align-items: flex-start; gap: 6px;
      cursor: help; color: #64748b;
    }
    .penalty-icon { font-size: 1rem; height: 1rem; width: 1rem; color: #94a3b8; flex-shrink: 0; margin-top: 1px; }
    .penalty-desc {
      font-size: 0.8rem; line-height: 1.4;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      max-width: 320px;
    }

    /* Empty state */
    .empty-state { text-align: center; padding: 60px 24px; color: #64748b; }
    .empty-state mat-icon { font-size: 3rem; height: 3rem; width: 3rem; opacity: 0.35; display: block; margin: 0 auto 12px; }
    .empty-state h3 { margin: 0 0 8px; color: #1e293b; }
    .empty-state p { margin: 0 0 20px; }

    @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr 1fr; } .gap-body { flex-direction: column; } }
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
