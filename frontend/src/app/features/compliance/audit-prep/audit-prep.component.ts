import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

type ItemSeverity = 'critical' | 'high' | 'medium' | 'low';

interface AuditPrepItem {
  id: string;
  category: string;
  severity: ItemSeverity;
  description: string;
  deadline: string;
  action_url?: string;
  is_resolved: boolean;
}

interface AuditPrepResult {
  readiness_score: number;
  audit_date: string;
  total_items: number;
  resolved_items: number;
  items: AuditPrepItem[];
}

@Component({
  selector: 'as-audit-prep',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Audit Preparation Assistant</h2>
          <p class="subtitle">Assess your readiness for an upcoming audit</p>
        </div>
        @if (result()) {
          <button mat-stroked-button (click)="exportReport()">
            <mat-icon>download</mat-icon> Export Readiness Report
          </button>
        }
      </div>

      <!-- Date Picker -->
      <mat-card class="date-card">
        <div class="date-row">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Planned Audit Date</mat-label>
            <input matInput type="date" [(ngModel)]="auditDate" (change)="loadPrep()" [min]="today()" />
            <mat-icon matPrefix style="color:#22c55e">event</mat-icon>
          </mat-form-field>
          <button mat-raised-button class="btn-brand" (click)="loadPrep()" [disabled]="!auditDate || loading()">
            @if (loading()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
            @else { <mat-icon>search</mat-icon> }
            Assess Readiness
          </button>
        </div>
      </mat-card>

      @if (result()) {
        <!-- Readiness Score Ring -->
        <div class="score-row">
          <mat-card class="score-ring-card">
            <div class="ring-wrap">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="16"/>
                <circle cx="80" cy="80" r="64" fill="none"
                  [attr.stroke]="ringColor(result()!.readiness_score)"
                  stroke-width="16" stroke-linecap="round"
                  [attr.stroke-dasharray]="402.12"
                  [attr.stroke-dashoffset]="402.12 - (402.12 * result()!.readiness_score / 100)"
                  transform="rotate(-90 80 80)"/>
              </svg>
              <div class="ring-inner">
                <div class="ring-score" [style.color]="ringColor(result()!.readiness_score)">{{ result()!.readiness_score }}</div>
                <div class="ring-label">/ 100</div>
                <div class="ring-sub">Readiness</div>
              </div>
            </div>
            <div class="score-breakdown">
              <div class="breakdown-item">
                <span class="b-num green">{{ result()!.resolved_items }}</span>
                <span class="b-label">Resolved</span>
              </div>
              <div class="breakdown-sep"></div>
              <div class="breakdown-item">
                <span class="b-num red">{{ result()!.total_items - result()!.resolved_items }}</span>
                <span class="b-label">Open Issues</span>
              </div>
            </div>
          </mat-card>

          <div class="score-message">
            <div class="message-icon" [class]="scoreMessageClass(result()!.readiness_score)">
              <mat-icon>{{ scoreIcon(result()!.readiness_score) }}</mat-icon>
            </div>
            <div>
              <div class="message-title">{{ scoreTitle(result()!.readiness_score) }}</div>
              <div class="message-body">{{ scoreMessage(result()!.readiness_score) }}</div>
              <div class="audit-date-label">Audit Date: {{ result()!.audit_date | date:'longDate' }}</div>
            </div>
          </div>
        </div>

        <!-- Items grouped by category -->
        @for (category of categories(); track category) {
          <mat-card class="category-card">
            <div class="category-header">
              <mat-icon class="cat-icon">{{ categoryIcon(category) }}</mat-icon>
              <span class="cat-name">{{ category }}</span>
              <span class="cat-count">{{ categoryItems(category).length }} items</span>
              <span class="cat-issues">{{ openIssueCount(category) }} open</span>
            </div>
            <div class="items-list">
              @for (item of categoryItems(category); track item.id) {
                <div class="prep-item" [class.resolved]="item.is_resolved">
                  <span class="sev-dot" [class]="sevDotClass(item.severity)"></span>
                  <div class="item-content">
                    <div class="item-desc">{{ item.description }}</div>
                    <div class="item-meta">
                      <span class="sev-badge" [class]="sevBadgeClass(item.severity)">{{ item.severity | titlecase }}</span>
                      @if (item.deadline) {
                        <span class="deadline"><mat-icon class="tiny">schedule</mat-icon>{{ item.deadline | date:'mediumDate' }}</span>
                      }
                    </div>
                  </div>
                  <div class="item-right">
                    @if (item.is_resolved) {
                      <mat-icon class="resolved-icon">check_circle</mat-icon>
                    } @else {
                      <button mat-stroked-button class="action-btn">
                        <mat-icon>arrow_forward</mat-icon> Fix
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-card>
        }
      }

      @if (!result() && !loading()) {
        <div class="empty-state">
          <mat-icon>fact_check</mat-icon>
          <h3>Select an audit date to begin</h3>
          <p>We'll analyze your current compliance status and generate a readiness report.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
    .date-card { padding:20px !important; }
    .date-row { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
    .date-field { min-width:240px; }
    .score-row { display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:center; }
    .score-ring-card { padding:24px !important; display:flex; flex-direction:column; align-items:center; gap:20px; min-width:220px; }
    .ring-wrap { position:relative; width:160px; height:160px; }
    .ring-wrap svg { position:absolute; inset:0; }
    .ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
    .ring-score { font-size:2.8rem; font-weight:800; line-height:1; font-family:'Outfit',sans-serif; }
    .ring-label { font-size:1rem; color:var(--text-muted); }
    .ring-sub { font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .score-breakdown { display:flex; align-items:center; gap:20px; }
    .breakdown-item { display:flex; flex-direction:column; align-items:center; }
    .b-num { font-size:1.4rem; font-weight:700; }
    .b-num.green { color:#22c55e; }
    .b-num.red { color:#dc2626; }
    .b-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .breakdown-sep { width:1px; height:36px; background:var(--border-color); }
    .score-message { display:flex; align-items:flex-start; gap:16px; }
    .message-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .message-icon mat-icon { font-size:1.4rem; height:1.4rem; width:1.4rem; }
    .msg-green { background:rgba(34,197,94,0.12); color:#16a34a; }
    .msg-amber { background:rgba(217,119,6,0.12); color:#d97706; }
    .msg-red { background:rgba(220,38,38,0.12); color:#dc2626; }
    .message-title { font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom:6px; font-family:'Outfit',sans-serif; }
    .message-body { font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin-bottom:8px; }
    .audit-date-label { font-size:0.8rem; color:#22c55e; font-weight:600; }
    .category-card { padding:0 !important; overflow:hidden; }
    .category-header { display:flex; align-items:center; gap:10px; padding:14px 20px; background:var(--surface-2); border-bottom:1px solid var(--border-color); }
    .cat-icon { font-size:1.1rem; height:1.1rem; width:1.1rem; color:#22c55e; }
    .cat-name { font-weight:700; font-size:0.9rem; color:var(--text-primary); flex:1; font-family:'Outfit',sans-serif; }
    .cat-count { font-size:0.75rem; color:var(--text-muted); }
    .cat-issues { font-size:0.75rem; background:#fee2e2; color:#dc2626; padding:2px 8px; border-radius:10px; font-weight:600; }
    .items-list { padding:8px 0; }
    .prep-item { display:flex; align-items:flex-start; gap:12px; padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.1s; }
    .prep-item:last-child { border-bottom:none; }
    .prep-item.resolved { opacity:0.6; }
    .prep-item:hover { background:var(--surface-2); }
    .sev-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:6px; }
    .dot-critical { background:#dc2626; }
    .dot-high { background:#ea580c; }
    .dot-medium { background:#d97706; }
    .dot-low { background:#22c55e; }
    .item-content { flex:1; }
    .item-desc { font-size:0.875rem; color:var(--text-primary); margin-bottom:6px; }
    .item-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .sev-badge { display:inline-block; padding:1px 8px; border-radius:8px; font-size:0.7rem; font-weight:700; }
    .sev-critical { background:#fee2e2; color:#dc2626; }
    .sev-high { background:#ffedd5; color:#ea580c; }
    .sev-medium { background:#fef9c3; color:#a16207; }
    .sev-low { background:#dcfce7; color:#16a34a; }
    .deadline { display:flex; align-items:center; gap:3px; font-size:0.75rem; color:var(--text-muted); }
    .tiny { font-size:0.8rem; height:0.8rem; width:0.8rem; }
    .item-right { flex-shrink:0; margin-left:8px; }
    .resolved-icon { color:#22c55e; font-size:1.3rem; height:1.3rem; width:1.3rem; }
    .action-btn { font-size:0.78rem !important; color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .empty-state { text-align:center; padding:60px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.3; display:block; margin:0 auto 16px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); font-size:1.1rem; }
    .empty-state p { margin:0; font-size:0.875rem; }
    @media(max-width:768px) { .score-row { grid-template-columns:1fr; } }
  `],
})
export class AuditPrepComponent {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  auditDate = '';
  result    = signal<AuditPrepResult | null>(null);
  loading   = signal(false);

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  categories = computed<string[]>(() => {
    const items = this.result()?.items ?? [];
    return [...new Set(items.map(i => i.category))];
  });

  categoryItems(category: string): AuditPrepItem[] {
    return this.result()?.items.filter(i => i.category === category) ?? [];
  }

  openIssueCount(category: string): number {
    return this.categoryItems(category).filter(i => !i.is_resolved).length;
  }

  loadPrep(): void {
    if (!this.auditDate) return;
    this.loading.set(true);
    this.api.get<AuditPrepResult>('compliance/audit-prep/', { audit_date: this.auditDate }).subscribe({
      next: (res) => { this.result.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load audit prep data.'); },
    });
  }

  exportReport(): void {
    if (!this.result()) return;
    const data = JSON.stringify(this.result(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-readiness-${this.auditDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.notify.success('Report exported.');
  }

  ringColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  scoreMessageClass(score: number): string {
    if (score >= 80) return 'message-icon msg-green';
    if (score >= 60) return 'message-icon msg-amber';
    return 'message-icon msg-red';
  }

  scoreIcon(score: number): string {
    if (score >= 80) return 'verified';
    if (score >= 60) return 'warning';
    return 'error';
  }

  scoreTitle(score: number): string {
    if (score >= 80) return 'Audit Ready';
    if (score >= 60) return 'Needs Attention';
    return 'Critical Issues Found';
  }

  scoreMessage(score: number): string {
    if (score >= 80) return 'Your organization is in good shape for the upcoming audit. Review open items to achieve 100% readiness.';
    if (score >= 60) return 'Several compliance gaps need to be addressed before the audit date. Focus on high-severity items first.';
    return 'Significant compliance issues were found. Immediate action is required to prepare for the audit.';
  }

  categoryIcon(category: string): string {
    const map: Record<string, string> = {
      Documents: 'folder', Certifications: 'workspace_premium',
      Compliance: 'verified_user', Policies: 'policy', Incidents: 'warning_amber',
    };
    return map[category] ?? 'category';
  }

  sevDotClass(sev: ItemSeverity): string {
    const map: Record<ItemSeverity, string> = {
      critical: 'sev-dot dot-critical', high: 'sev-dot dot-high',
      medium: 'sev-dot dot-medium', low: 'sev-dot dot-low',
    };
    return map[sev] ?? 'sev-dot';
  }

  sevBadgeClass(sev: ItemSeverity): string {
    const map: Record<ItemSeverity, string> = {
      critical: 'sev-badge sev-critical', high: 'sev-badge sev-high',
      medium: 'sev-badge sev-medium', low: 'sev-badge sev-low',
    };
    return map[sev] ?? 'sev-badge';
  }
}
