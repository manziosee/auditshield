import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Report } from '../../../core/models/report.models';

@Component({
  selector: 'as-report-new',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/reports"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h2>Generate Report</h2>
          <p class="subtitle">PDF reports are generated asynchronously</p>
        </div>
      </div>

      <div class="new-layout">
        <!-- Report type cards -->
        <mat-card>
          <mat-card-header><mat-card-title>Select Report Type</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="type-grid">
              @for (rt of reportTypes; track rt.value) {
                <div class="type-card" [class.selected]="form.get('report_type')?.value === rt.value"
                  (click)="form.get('report_type')?.setValue(rt.value)">
                  <mat-icon [class]="rt.iconClass">{{ rt.icon }}</mat-icon>
                  <div class="type-info">
                    <p class="type-name">{{ rt.label }}</p>
                    <p class="type-desc">{{ rt.description }}</p>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Parameters form -->
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-card>
            <mat-card-header><mat-card-title>Report Parameters</mat-card-title></mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Report Title *</mat-label>
                <input matInput formControlName="title" placeholder="e.g. Q1 2025 Audit Readiness Report" />
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Period Start</mat-label>
                  <input matInput type="date" formControlName="period_start" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Period End</mat-label>
                  <input matInput type="date" formControlName="period_end" />
                </mat-form-field>
              </div>

              @if (form.get('report_type')?.value) {
                <div class="info-box">
                  <mat-icon>info</mat-icon>
                  <p>
                    <strong>{{ selectedTypeLabel() }}</strong> —
                    This report will be generated in the background.
                    You will receive a notification when it is ready to download.
                  </p>
                </div>
              }
            </mat-card-content>
            <mat-card-actions>
              <button mat-stroked-button type="button" routerLink="/reports">Cancel</button>
              <button mat-raised-button color="primary" type="submit"
                [disabled]="form.invalid || generating()">
                @if (generating()) { <mat-spinner diameter="20" /> }
                @else { Generate Report }
              </button>
            </mat-card-actions>
          </mat-card>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    .new-layout { display:flex; flex-direction:column; gap:20px; }
    .type-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .type-card { display:flex; align-items:flex-start; gap:12px; padding:16px; border:2px solid #e2e8f0; border-radius:8px; cursor:pointer; transition:border-color 0.2s; }
    .type-card:hover { border-color:#3b82f6; }
    .type-card.selected { border-color:#3b82f6; background:#eff6ff; }
    .type-card mat-icon { font-size:1.8rem; height:1.8rem; width:1.8rem; flex-shrink:0; margin-top:2px; }
    .type-name { margin:0 0 4px; font-weight:600; font-size:0.875rem; color:#1e293b; }
    .type-desc { margin:0; font-size:0.75rem; color:#64748b; }
    .full-width { width:100%; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
    .info-box { display:flex; gap:10px; background:#eff6ff; border-radius:8px; padding:12px 16px; margin-top:4px; }
    .info-box mat-icon { color:#3b82f6; flex-shrink:0; }
    .info-box p { margin:0; font-size:0.875rem; color:#1e40af; }
    mat-card-actions { display:flex; justify-content:flex-end; gap:8px; padding:16px !important; }
    .icon-purple { color:#8b5cf6; }
    .icon-blue { color:#3b82f6; }
    .icon-green { color:#16a34a; }
    .icon-orange { color:#ea580c; }
    .icon-teal { color:#0d9488; }
    .icon-red { color:#dc2626; }
    .icon-indigo { color:#4f46e5; }
    @media(max-width:600px){ .type-grid{grid-template-columns:1fr;} }
  `],
})
export class ReportNewComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  generating = signal(false);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    report_type: ['', Validators.required],
    period_start: [''],
    period_end: [''],
  });

  readonly reportTypes = [
    { value: 'audit_readiness', label: 'Audit Readiness', description: 'Full compliance & document audit summary', icon: 'verified_user', iconClass: 'icon-purple' },
    { value: 'employee_summary', label: 'Employee Summary', description: 'Headcount, contracts, salary overview', icon: 'people', iconClass: 'icon-blue' },
    { value: 'compliance_status', label: 'Compliance Status', description: 'Tax, social security & labour obligations status', icon: 'assignment_turned_in', iconClass: 'icon-green' },
    { value: 'payroll_summary', label: 'Payroll Summary', description: 'Payroll tax & social security contributions breakdown', icon: 'payments', iconClass: 'icon-orange' },
    { value: 'document_inventory', label: 'Document Inventory', description: 'All documents with expiry status', icon: 'folder_open', iconClass: 'icon-teal' },
    { value: 'tax_filing_summary', label: 'Tax Filing Summary', description: 'Tax filing data for authority submissions', icon: 'receipt_long', iconClass: 'icon-red' },
    { value: 'social_security_summary', label: 'Social Security Summary', description: 'Social security contributions & declarations', icon: 'health_and_safety', iconClass: 'icon-indigo' },
  ];

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    this.form.patchValue({ period_start: firstDay, period_end: lastDay });
  }

  selectedTypeLabel(): string {
    const t = this.form.get('report_type')?.value;
    return this.reportTypes.find((r) => r.value === t)?.label ?? '';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.generating.set(true);
    const v = this.form.value;
    const body: Record<string, unknown> = { title: v.title, report_type: v.report_type };
    if (v.period_start) body['period_start'] = v.period_start;
    if (v.period_end) body['period_end'] = v.period_end;

    this.api.post<Report>('reports/', body).subscribe({
      next: () => {
        this.notify.success('Report queued. You will be notified when it\'s ready.');
        this.router.navigate(['/reports']);
      },
      error: (err) => {
        this.generating.set(false);
        this.notify.error(err?.error?.detail ?? 'Failed to queue report.');
      },
    });
  }
}
