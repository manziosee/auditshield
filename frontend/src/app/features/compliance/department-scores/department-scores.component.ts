import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface DepartmentScore {
  department: string;
  score: number;
  total_requirements: number;
  compliant_count: number;
  overdue_count: number;
}

@Component({
  selector: 'as-department-scores',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <div class="widget-title">
          <mat-icon>bar_chart</mat-icon> Department Compliance Scores
        </div>
        <button mat-icon-button (click)="load()" title="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="32" /></div>
      }

      <div class="bars-list">
        @for (dept of scores(); track dept.department) {
          <div class="bar-row">
            <div class="dept-name" [title]="dept.department">{{ dept.department }}</div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="dept.score" [style.background]="barColor(dept.score)"></div>
            </div>
            <div class="score-label" [style.color]="barColor(dept.score)">{{ dept.score }}</div>
            <div class="dept-meta">
              <span class="meta-item green">{{ dept.compliant_count }} ✓</span>
              @if (dept.overdue_count > 0) {
                <span class="meta-item red">{{ dept.overdue_count }} !</span>
              }
            </div>
          </div>
        }
        @empty {
          @if (!loading()) {
            <div class="empty">
              <mat-icon>bar_chart</mat-icon>
              <p>No department data available</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .widget-container { display:flex; flex-direction:column; gap:14px; }
    .widget-header { display:flex; align-items:center; justify-content:space-between; }
    .widget-title { display:flex; align-items:center; gap:8px; font-size:0.95rem; font-weight:700; color:var(--text-primary); font-family:'Outfit',sans-serif; }
    .widget-title mat-icon { color:#22c55e; font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .center-spin { display:flex; justify-content:center; padding:24px; }
    .bars-list { display:flex; flex-direction:column; gap:10px; }
    .bar-row { display:grid; grid-template-columns:120px 1fr 36px auto; align-items:center; gap:10px; }
    .dept-name { font-size:0.8rem; color:var(--text-secondary); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bar-track { height:10px; background:rgba(255,255,255,0.06); border-radius:5px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:5px; transition:width 0.4s ease; }
    .score-label { font-size:0.82rem; font-weight:700; text-align:right; }
    .dept-meta { display:flex; gap:4px; }
    .meta-item { font-size:0.68rem; font-weight:600; padding:1px 5px; border-radius:6px; }
    .meta-item.green { background:rgba(34,197,94,0.12); color:#16a34a; }
    .meta-item.red { background:rgba(220,38,38,0.12); color:#dc2626; }
    .empty { text-align:center; padding:24px; color:var(--text-muted); }
    .empty mat-icon { font-size:1.8rem; height:1.8rem; width:1.8rem; opacity:0.3; display:block; margin:0 auto 6px; }
    .empty p { margin:0; font-size:0.8rem; }
  `],
})
export class DepartmentScoresComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  scores  = signal<DepartmentScore[]>([]);
  loading = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: DepartmentScore[] } | DepartmentScore[]>('compliance/department-scores/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: DepartmentScore[] }).results ?? [];
        this.scores.set(list.sort((a, b) => b.score - a.score));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load department scores.'); },
    });
  }

  barColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }
}
