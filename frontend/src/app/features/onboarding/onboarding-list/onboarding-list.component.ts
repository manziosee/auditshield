import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface OnboardingRecord {
  id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  start_date: string;
  completion_percent: number;
  status: 'active' | 'completed' | 'overdue';
  tasks_total: number;
  tasks_done: number;
}

interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  task_count: number;
  department?: string;
}

@Component({
  selector: 'as-onboarding-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Onboarding</h2>
          <p class="subtitle">Track new hire compliance tasks</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> Start Onboarding
        </button>
      </div>

      @if (showCreate()) {
        <div class="create-panel">
          <h3 class="create-panel-title">Start New Onboarding</h3>
          <div class="create-form">
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Employee Name or Email</mat-label>
              <input matInput [value]="newEmployeeId()" (input)="newEmployeeId.set($any($event.target).value)" placeholder="Search employee...">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Template</mat-label>
              <mat-select [value]="newTemplateId()" (valueChange)="newTemplateId.set($event)">
                @for (tpl of templates(); track tpl.id) {
                  <mat-option [value]="tpl.id">{{ tpl.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Start Date</mat-label>
              <input matInput type="date" [value]="newStartDate()" (input)="newStartDate.set($any($event.target).value)">
            </mat-form-field>
          </div>
          <div class="create-actions">
            <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
            <button mat-raised-button class="btn-brand" (click)="startOnboarding()" [disabled]="creating() || !newEmployeeId().trim()">
              <mat-icon>rocket_launch</mat-icon> {{ creating() ? 'Starting...' : 'Start Onboarding' }}
            </button>
          </div>
        </div>
      }

      <mat-tab-group class="tabs" animationDuration="200ms">
        <!-- Active Tab -->
        <mat-tab label="Active">
          @if (loading()) {
            <div class="center-spin"><mat-spinner diameter="40" /></div>
          }
          @if (!loading()) {
            <div class="cards-grid">
              @for (item of active(); track item.id) {
                <mat-card class="onboard-card">
                  <div class="card-top">
                    <div class="emp-avatar">{{ initials(item.employee_name) }}</div>
                    <div class="emp-info">
                      <div class="emp-name">{{ item.employee_name }}</div>
                      <div class="emp-dept">{{ item.department }}</div>
                    </div>
                    <span class="chip" [class]="statusClass(item.status)">{{ item.status | titlecase }}</span>
                  </div>
                  <div class="card-meta">
                    <mat-icon class="meta-icon">calendar_today</mat-icon>
                    <span>Started {{ item.start_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="progress-section">
                    <div class="progress-label">
                      <span>Progress</span>
                      <span class="progress-pct">{{ item.completion_percent }}%</span>
                    </div>
                    <mat-progress-bar mode="determinate" [value]="item.completion_percent" class="green-bar" />
                    <div class="tasks-done">{{ item.tasks_done }}/{{ item.tasks_total }} tasks done</div>
                  </div>
                  <button mat-stroked-button class="view-btn" [routerLink]="['/onboarding', item.id]">
                    View Tasks <mat-icon>chevron_right</mat-icon>
                  </button>
                </mat-card>
              }
              @empty {
                <div class="empty-state">
                  <mat-icon>rocket_launch</mat-icon>
                  <p>No active onboardings</p>
                </div>
              }
            </div>
          }
        </mat-tab>

        <!-- Completed Tab -->
        <mat-tab label="Completed">
          <div class="cards-grid">
            @for (item of completed(); track item.id) {
              <mat-card class="onboard-card onboard-card--done">
                <div class="card-top">
                  <div class="emp-avatar emp-avatar--done">{{ initials(item.employee_name) }}</div>
                  <div class="emp-info">
                    <div class="emp-name">{{ item.employee_name }}</div>
                    <div class="emp-dept">{{ item.department }}</div>
                  </div>
                  <mat-icon class="done-icon">check_circle</mat-icon>
                </div>
                <div class="tasks-done green">{{ item.tasks_total }} tasks completed</div>
              </mat-card>
            }
            @empty {
              <div class="empty-state">
                <mat-icon>check_circle_outline</mat-icon>
                <p>No completed onboardings yet</p>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Templates Tab -->
        <mat-tab label="Templates">
          <div class="templates-list">
            @for (tpl of templates(); track tpl.id) {
              <mat-card class="template-card">
                <div class="tpl-icon-wrap"><mat-icon>assignment</mat-icon></div>
                <div class="tpl-info">
                  <div class="tpl-name">{{ tpl.name }}</div>
                  <div class="tpl-desc">{{ tpl.description }}</div>
                  @if (tpl.department) {
                    <span class="dept-badge">{{ tpl.department }}</span>
                  }
                </div>
                <div class="tpl-right">
                  <div class="task-count">{{ tpl.task_count }} tasks</div>
                  <button mat-stroked-button class="use-btn">
                    Use Template
                  </button>
                </div>
              </mat-card>
            }
            @empty {
              <div class="empty-state">
                <mat-icon>assignment</mat-icon>
                <p>No templates available</p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .tabs { background:var(--surface-1); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; padding:20px; }
    .onboard-card { padding:20px !important; border-radius:16px !important; border:1px solid var(--border-color) !important; background:var(--surface-1) !important; display:flex; flex-direction:column; gap:12px; }
    .onboard-card--done { opacity:0.75; }
    .card-top { display:flex; align-items:center; gap:12px; }
    .emp-avatar { width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .emp-avatar--done { background:linear-gradient(135deg,#6b7280,#4b5563); color:white; }
    .emp-info { flex:1; }
    .emp-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .emp-dept { font-size:0.78rem; color:var(--text-muted); }
    .chip { display:inline-block; padding:2px 8px; border-radius:12px; font-size:0.72rem; font-weight:600; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .card-meta { display:flex; align-items:center; gap:6px; font-size:0.8rem; color:var(--text-muted); }
    .meta-icon { font-size:1rem; height:1rem; width:1rem; }
    .progress-section { display:flex; flex-direction:column; gap:6px; }
    .progress-label { display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary); }
    .progress-pct { font-weight:700; color:#22c55e; }
    .green-bar { border-radius:4px; }
    .tasks-done { font-size:0.75rem; color:var(--text-muted); }
    .tasks-done.green { color:#16a34a; font-weight:600; }
    .view-btn { width:100%; justify-content:center !important; border-color:var(--border-color) !important; color:#22c55e !important; }
    .done-icon { color:#22c55e; font-size:1.5rem; height:1.5rem; width:1.5rem; }
    .templates-list { display:flex; flex-direction:column; gap:12px; padding:20px; }
    .template-card { padding:16px 20px !important; display:flex; align-items:center; gap:16px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .tpl-icon-wrap { width:44px; height:44px; border-radius:12px; background:rgba(34,197,94,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .tpl-icon-wrap mat-icon { color:#22c55e; }
    .tpl-info { flex:1; }
    .tpl-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .tpl-desc { font-size:0.78rem; color:var(--text-muted); margin:2px 0 6px; }
    .dept-badge { background:rgba(34,197,94,0.1); color:#16a34a; padding:1px 8px; border-radius:10px; font-size:0.72rem; font-weight:500; }
    .tpl-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
    .task-count { font-size:0.8rem; color:var(--text-muted); font-weight:500; }
    .use-btn { color:#22c55e !important; border-color:#22c55e !important; font-size:0.8rem !important; }
    .empty-state { text-align:center; padding:48px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 8px; }
    .empty-state p { margin:0; }
    @media(max-width:600px) { .cards-grid { grid-template-columns:1fr; } }
    .create-panel { background:var(--surface-1); border:1px solid var(--brand); border-radius:16px; padding:24px; animation:slideDown 0.2s ease; }
    .create-panel-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:600; color:var(--text-primary); margin:0 0 16px; }
    .create-form { display:flex; flex-direction:column; gap:12px; }
    .create-field { width:100%; }
    .create-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  `],
})
export class OnboardingListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  all       = signal<OnboardingRecord[]>([]);
  templates = signal<OnboardingTemplate[]>([]);
  loading   = signal(false);

  active    = signal<OnboardingRecord[]>([]);
  completed = signal<OnboardingRecord[]>([]);

  showCreate    = signal(false);
  creating      = signal(false);
  newEmployeeId = signal('');
  newTemplateId = signal('');
  newStartDate  = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: OnboardingRecord[] } | OnboardingRecord[]>('onboarding/employee/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: OnboardingRecord[] }).results ?? [];
        this.all.set(list);
        this.active.set(list.filter(r => r.status === 'active' || r.status === 'overdue'));
        this.completed.set(list.filter(r => r.status === 'completed'));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load onboardings.'); },
    });
    this.api.get<{ results: OnboardingTemplate[] } | OnboardingTemplate[]>('onboarding/templates/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: OnboardingTemplate[] }).results ?? [];
        this.templates.set(list);
      },
      error: () => {},
    });
  }

  startOnboarding(): void {
    if (!this.newEmployeeId().trim()) return;
    this.creating.set(true);
    this.api.post('onboarding/employee/', {
      employee_id: this.newEmployeeId(),
      template_id: this.newTemplateId() || null,
      start_date: this.newStartDate() || null,
    }).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newEmployeeId.set('');
        this.newTemplateId.set('');
        this.newStartDate.set('');
        this.creating.set(false);
        this.load();
        this.notify.success('Onboarding started.');
      },
      error: () => { this.creating.set(false); this.notify.error('Failed to start onboarding.'); },
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'chip chip-green', completed: 'chip chip-green', overdue: 'chip chip-red',
    };
    return map[status] ?? 'chip chip-amber';
  }
}
