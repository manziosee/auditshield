import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  task_type: 'document' | 'form' | 'training' | 'other';
  due_date: string;
  is_required: boolean;
  is_completed: boolean;
  completed_at: string | null;
}

interface OnboardingDetail {
  id: string;
  employee_name: string;
  department: string;
  start_date: string;
  completion_percent: number;
  status: string;
  tasks: OnboardingTask[];
}

@Component({
  selector: 'as-onboarding-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatCheckboxModule, MatProgressBarModule, MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="48" /></div>
      }
      @if (!loading() && detail()) {
        <!-- Employee Header -->
        <mat-card class="emp-header-card">
          <div class="emp-header">
            <div class="emp-avatar">{{ initials(detail()!.employee_name) }}</div>
            <div class="emp-info">
              <h2 class="emp-name">{{ detail()!.employee_name }}</h2>
              <div class="emp-meta">
                <span><mat-icon class="mini-icon">work</mat-icon>{{ detail()!.department }}</span>
                <span><mat-icon class="mini-icon">calendar_today</mat-icon>Started {{ detail()!.start_date | date:'mediumDate' }}</span>
              </div>
            </div>
            <div class="progress-summary">
              <div class="progress-ring-label">{{ detail()!.completion_percent }}%</div>
              <div class="progress-ring-sub">Complete</div>
            </div>
          </div>
          <div class="overall-progress">
            <mat-progress-bar mode="determinate" [value]="detail()!.completion_percent" class="green-bar" />
          </div>
        </mat-card>

        <!-- Task Checklist -->
        <mat-card class="tasks-card">
          <div class="card-title">
            <mat-icon>checklist</mat-icon> Onboarding Tasks
            <span class="task-count-badge">{{ completedCount() }}/{{ detail()!.tasks.length }}</span>
          </div>
          <div class="tasks-list">
            @for (task of detail()!.tasks; track task.id) {
              <div class="task-row" [class.task-done]="task.is_completed">
                <mat-checkbox
                  [checked]="task.is_completed"
                  (change)="toggleTask(task, $event.checked)"
                  [disabled]="task.is_completed"
                  class="task-checkbox"
                />
                <div class="task-icon-wrap" [class]="typeClass(task.task_type)">
                  <mat-icon>{{ typeIcon(task.task_type) }}</mat-icon>
                </div>
                <div class="task-content">
                  <div class="task-title">{{ task.title }}</div>
                  @if (task.description) {
                    <div class="task-desc">{{ task.description }}</div>
                  }
                  <div class="task-meta">
                    @if (task.due_date) {
                      <span class="due-date"><mat-icon class="tiny-icon">schedule</mat-icon>Due {{ task.due_date | date:'mediumDate' }}</span>
                    }
                    @if (task.is_required) {
                      <span class="required-badge">Required</span>
                    }
                  </div>
                </div>
                @if (task.is_completed) {
                  <mat-icon class="check-done">check_circle</mat-icon>
                }
              </div>
            }
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; max-width:800px; }
    .center-spin { display:flex; justify-content:center; padding:80px; }
    .emp-header-card { padding:20px !important; }
    .emp-header { display:flex; align-items:center; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
    .emp-avatar { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:1rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .emp-info { flex:1; }
    .emp-name { margin:0 0 6px; font-size:1.3rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .emp-meta { display:flex; gap:16px; flex-wrap:wrap; }
    .emp-meta span { display:flex; align-items:center; gap:4px; font-size:0.8rem; color:var(--text-muted); }
    .mini-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; color:#22c55e; }
    .progress-summary { text-align:center; }
    .progress-ring-label { font-size:1.8rem; font-weight:800; color:#22c55e; line-height:1; }
    .progress-ring-sub { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .green-bar { border-radius:4px; --mdc-linear-progress-active-indicator-color:#22c55e; }
    .tasks-card { padding:20px !important; }
    .card-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; font-family:'Outfit',sans-serif; color:var(--text-primary); margin-bottom:16px; }
    .card-title mat-icon { color:#22c55e; }
    .task-count-badge { margin-left:auto; background:rgba(34,197,94,0.12); color:#16a34a; padding:2px 10px; border-radius:12px; font-size:0.8rem; font-weight:600; }
    .tasks-list { display:flex; flex-direction:column; gap:8px; }
    .task-row { display:flex; align-items:flex-start; gap:12px; padding:14px; border-radius:12px; border:1px solid var(--border-color); background:var(--surface-1); transition:opacity 0.2s; }
    .task-done { opacity:0.6; }
    .task-checkbox { flex-shrink:0; margin-top:2px; }
    .task-icon-wrap { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .task-icon-wrap mat-icon { font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .type-document { background:rgba(59,130,246,0.12); color: #60a5fa; }
    .type-form { background:rgba(34,197,94,0.12); color:#16a34a; }
    .type-training { background:rgba(168,85,247,0.12); color: #a78bfa; }
    .type-other { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .task-content { flex:1; }
    .task-title { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .task-desc { font-size:0.8rem; color:var(--text-muted); margin:2px 0 4px; }
    .task-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .due-date { display:flex; align-items:center; gap:2px; font-size:0.75rem; color:var(--text-muted); }
    .tiny-icon { font-size:0.8rem; height:0.8rem; width:0.8rem; }
    .required-badge { background:rgba(239,68,68,0.12); color:#f87171; padding:1px 6px; border-radius:8px; font-size:0.7rem; font-weight:600; }
    .check-done { color:#22c55e; font-size:1.3rem; height:1.3rem; width:1.3rem; flex-shrink:0; margin-top:2px; }
  `],
})
export class OnboardingDetailComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  detail  = signal<OnboardingDetail | null>(null);
  loading = signal(false);

  completedCount(): number {
    return this.detail()?.tasks.filter(t => t.is_completed).length ?? 0;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<OnboardingDetail>(`onboarding/employee/${id}/`).subscribe({
      next: (res) => { this.detail.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load onboarding.'); },
    });
  }

  toggleTask(task: OnboardingTask, checked: boolean): void {
    if (!checked || !this.detail()) return;
    const id = this.detail()!.id;
    this.api.post(`onboarding/employee/${id}/complete-task/`, { task_id: task.id }).subscribe({
      next: () => {
        this.notify.success(`"${task.title}" marked complete.`);
        this.load(id);
      },
      error: () => this.notify.error('Failed to complete task.'),
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      document: 'description', form: 'assignment', training: 'school', other: 'task_alt',
    };
    return map[type] ?? 'task_alt';
  }

  typeClass(type: string): string {
    const map: Record<string, string> = {
      document: 'task-icon-wrap type-document',
      form: 'task-icon-wrap type-form',
      training: 'task-icon-wrap type-training',
      other: 'task-icon-wrap type-other',
    };
    return map[type] ?? 'task-icon-wrap type-other';
  }
}
