import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface FormRecord {
  id: string;
  title: string;
  category: string;
  field_count: number;
  submission_count: number;
  is_active: boolean;
  created_at: string;
}

@Component({
  selector: 'as-form-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatMenuModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Forms Builder</h2>
          <p class="subtitle">Create and manage custom compliance forms</p>
        </div>
        <button mat-raised-button class="btn-brand" routerLink="/forms/builder">
          <mat-icon>add</mat-icon> Create Form
        </button>
      </div>

      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="40" /></div>
      }

      <div class="forms-grid">
        @for (form of forms(); track form.id) {
          <mat-card class="form-card">
            <div class="card-top">
              <div class="form-icon-wrap">
                <mat-icon>dynamic_form</mat-icon>
              </div>
              <mat-slide-toggle
                [checked]="form.is_active"
                (change)="toggleActive(form, $event.checked)"
                class="form-toggle"
                color="primary"
              />
            </div>
            <div class="form-title">{{ form.title }}</div>
            <span class="category-badge">{{ form.category }}</span>
            <div class="form-stats">
              <div class="form-stat">
                <mat-icon class="stat-icon">view_module</mat-icon>
                <span>{{ form.field_count }} fields</span>
              </div>
              <div class="form-stat">
                <mat-icon class="stat-icon">assignment_turned_in</mat-icon>
                <span>{{ form.submission_count }} submissions</span>
              </div>
            </div>
            <div class="card-actions">
              <button mat-stroked-button class="action-btn" [routerLink]="['/forms/builder', form.id]">
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>visibility</mat-icon> Preview
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>bar_chart</mat-icon> Submissions
              </button>
            </div>
          </mat-card>
        }
        @empty {
          @if (!loading()) {
            <div class="empty-state">
              <mat-icon>dynamic_form</mat-icon>
              <h3>No forms yet</h3>
              <p>Create your first custom form to start collecting compliance data.</p>
              <button mat-raised-button class="btn-brand" routerLink="/forms/builder">
                <mat-icon>add</mat-icon> Create Form
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .forms-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .form-card { padding:20px !important; border-radius:16px !important; border:1px solid var(--border-color) !important; background:var(--surface-1) !important; display:flex; flex-direction:column; gap:12px; }
    .card-top { display:flex; align-items:center; justify-content:space-between; }
    .form-icon-wrap { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,rgba(34,197,94,0.18),rgba(22,163,74,0.10)); border:1px solid rgba(34,197,94,0.2); display:flex; align-items:center; justify-content:center; }
    .form-icon-wrap mat-icon { color:#22c55e; }
    .form-toggle { }
    .form-title { font-weight:700; font-size:1rem; color:var(--text-primary); font-family:'Outfit',sans-serif; }
    .category-badge { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; display:inline-block; }
    .form-stats { display:flex; gap:16px; }
    .form-stat { display:flex; align-items:center; gap:4px; font-size:0.8rem; color:var(--text-muted); }
    .stat-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; }
    .card-actions { display:flex; gap:6px; flex-wrap:wrap; }
    .action-btn { font-size:0.75rem !important; padding:0 10px !important; color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .empty-state { grid-column:1/-1; text-align:center; padding:60px 24px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:12px; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.3; display:block; }
    .empty-state h3 { margin:0; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:600px) { .forms-grid { grid-template-columns:1fr; } }
  `],
})
export class FormListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  forms   = signal<FormRecord[]>([]);
  loading = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: FormRecord[] } | FormRecord[]>('forms/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: FormRecord[] }).results ?? [];
        this.forms.set(list);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load forms.'); },
    });
  }

  toggleActive(form: FormRecord, active: boolean): void {
    this.api.patch(`forms/${form.id}/`, { is_active: active }).subscribe({
      next: () => {
        this.notify.success(`Form ${active ? 'activated' : 'deactivated'}.`);
        this.load();
      },
      error: () => this.notify.error('Failed to update form status.'),
    });
  }
}
