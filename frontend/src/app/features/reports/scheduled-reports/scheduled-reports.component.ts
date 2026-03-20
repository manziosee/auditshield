import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface ScheduledReport {
  id: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  last_sent_at: string | null;
  next_run_at: string;
  is_active: boolean;
}

@Component({
  selector: 'as-scheduled-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatChipsModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Scheduled Reports</h2>
          <p class="subtitle">Automate report delivery to your team</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Schedule Report' }}
        </button>
      </div>

      <!-- Schedule Form -->
      @if (showForm) {
        <mat-card class="schedule-form">
          <div class="form-title"><mat-icon>schedule_send</mat-icon> New Scheduled Report</div>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Report Type</mat-label>
              <mat-select [(ngModel)]="newSchedule.report_type">
                <mat-option value="compliance_summary">Compliance Summary</mat-option>
                <mat-option value="employee_risk">Employee Risk Report</mat-option>
                <mat-option value="document_expiry">Document Expiry Report</mat-option>
                <mat-option value="audit_trail">Audit Trail</mat-option>
                <mat-option value="incident_summary">Incident Summary</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Frequency</mat-label>
              <mat-select [(ngModel)]="newSchedule.frequency">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="quarterly">Quarterly</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Recipients</mat-label>
              <mat-chip-grid #chipGrid>
                @for (email of recipientEmails; track email) {
                  <mat-chip-row (removed)="removeEmail(email)">
                    {{ email }}
                    <button matChipRemove><mat-icon>cancel</mat-icon></button>
                  </mat-chip-row>
                }
              </mat-chip-grid>
              <input
                placeholder="Add email and press Enter…"
                [matChipInputFor]="chipGrid"
                [matChipInputSeparatorKeyCodes]="separatorKeys"
                (matChipInputTokenEnd)="addEmail($event)"
              />
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button class="btn-brand" (click)="createSchedule()" [disabled]="saving()">
              @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
              @else { <mat-icon>check</mat-icon> }
              Create Schedule
            </button>
          </div>
        </mat-card>
      }

      <!-- Scheduled Reports List -->
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="40" /></div>
      }
      <div class="reports-list">
        @for (report of schedules(); track report.id) {
          <mat-card class="report-card" [class.inactive]="!report.is_active">
            <div class="report-left">
              <div class="report-icon"><mat-icon>assessment</mat-icon></div>
              <div class="report-info">
                <div class="report-type">{{ formatType(report.report_type) }}</div>
                <div class="report-meta">
                  <span class="freq-chip" [class]="freqClass(report.frequency)">{{ report.frequency | titlecase }}</span>
                  <span class="recipients-label">{{ report.recipients.length }} recipient{{ report.recipients.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="recipients-list">
                  @for (email of report.recipients.slice(0, 3); track email) {
                    <span class="email-chip">{{ email }}</span>
                  }
                  @if (report.recipients.length > 3) {
                    <span class="more-chip">+{{ report.recipients.length - 3 }} more</span>
                  }
                </div>
              </div>
            </div>
            <div class="report-right">
              <div class="timing">
                <div class="timing-row">
                  <span class="timing-label">Last sent</span>
                  <span class="timing-value">{{ report.last_sent_at ? (report.last_sent_at | date:'mediumDate') : 'Never' }}</span>
                </div>
                <div class="timing-row">
                  <span class="timing-label">Next run</span>
                  <span class="timing-value next">{{ report.next_run_at | date:'mediumDate' }}</span>
                </div>
              </div>
              <mat-slide-toggle
                [checked]="report.is_active"
                (change)="toggleSchedule(report, $event.checked)"
                color="primary"
              />
            </div>
          </mat-card>
        }
        @empty {
          @if (!loading()) {
            <div class="empty-state">
              <mat-icon>schedule_send</mat-icon>
              <h3>No scheduled reports</h3>
              <p>Automate your reporting by creating a schedule.</p>
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
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .schedule-form { padding:20px !important; }
    .form-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:16px; font-family:'Outfit',sans-serif; }
    .form-title mat-icon { color:#22c55e; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .full-width { grid-column:1/-1; }
    .form-actions { margin-top:8px; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .reports-list { display:flex; flex-direction:column; gap:12px; }
    .report-card { padding:18px 20px !important; display:flex; align-items:center; justify-content:space-between; gap:16px; border-radius:12px !important; border:1px solid var(--border-color) !important; flex-wrap:wrap; }
    .report-card.inactive { opacity:0.6; }
    .report-left { display:flex; align-items:flex-start; gap:14px; flex:1; }
    .report-icon { width:42px; height:42px; border-radius:10px; background:rgba(34,197,94,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .report-icon mat-icon { color:#22c55e; }
    .report-info { flex:1; }
    .report-type { font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:6px; }
    .report-meta { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .freq-chip { padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .freq-daily { background:rgba(34,197,94,0.1); color:#16a34a; }
    .freq-weekly { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .freq-monthly { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .freq-quarterly { background:rgba(139,92,246,0.12); color:#a78bfa; }
    .recipients-label { font-size:0.78rem; color:var(--text-muted); }
    .recipients-list { display:flex; flex-wrap:wrap; gap:4px; }
    .email-chip { background:rgba(0,0,0,0.06); color:var(--text-secondary); padding:2px 8px; border-radius:10px; font-size:0.72rem; }
    .more-chip { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .report-right { display:flex; align-items:center; gap:20px; flex-shrink:0; }
    .timing { display:flex; flex-direction:column; gap:4px; }
    .timing-row { display:flex; gap:8px; align-items:center; }
    .timing-label { font-size:0.72rem; color:var(--text-muted); min-width:60px; }
    .timing-value { font-size:0.8rem; color:var(--text-secondary); font-weight:500; }
    .timing-value.next { color:#22c55e; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
    @media(max-width:600px) { .form-grid { grid-template-columns:1fr; } }
  `],
})
export class ScheduledReportsComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  schedules = signal<ScheduledReport[]>([]);
  loading   = signal(false);
  saving    = signal(false);
  showForm  = false;

  separatorKeys = [ENTER, COMMA];
  recipientEmails: string[] = [];

  newSchedule = { report_type: '', frequency: 'weekly' };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: ScheduledReport[] } | ScheduledReport[]>('reports/schedules/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: ScheduledReport[] }).results ?? [];
        this.schedules.set(list);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load schedules.'); },
    });
  }

  addEmail(event: MatChipInputEvent): void {
    const email = (event.value || '').trim();
    if (email && !this.recipientEmails.includes(email)) {
      this.recipientEmails.push(email);
    }
    event.chipInput!.clear();
  }

  removeEmail(email: string): void {
    this.recipientEmails = this.recipientEmails.filter(e => e !== email);
  }

  createSchedule(): void {
    if (!this.newSchedule.report_type) { this.notify.error('Select a report type.'); return; }
    if (!this.recipientEmails.length) { this.notify.error('Add at least one recipient.'); return; }
    this.saving.set(true);
    this.api.post('reports/schedules/', { ...this.newSchedule, recipients: this.recipientEmails }).subscribe({
      next: () => {
        this.notify.success('Schedule created.');
        this.saving.set(false);
        this.showForm = false;
        this.recipientEmails = [];
        this.newSchedule = { report_type: '', frequency: 'weekly' };
        this.load();
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to create schedule.'); },
    });
  }

  toggleSchedule(report: ScheduledReport, active: boolean): void {
    this.api.patch(`reports/schedules/${report.id}/`, { is_active: active }).subscribe({
      next: () => { this.notify.success(`Schedule ${active ? 'activated' : 'paused'}.`); this.load(); },
      error: () => this.notify.error('Failed to update schedule.'),
    });
  }

  formatType(type: string): string {
    const map: Record<string, string> = {
      compliance_summary: 'Compliance Summary', employee_risk: 'Employee Risk Report',
      document_expiry: 'Document Expiry Report', audit_trail: 'Audit Trail',
      incident_summary: 'Incident Summary',
    };
    return map[type] ?? type;
  }

  freqClass(freq: string): string {
    const map: Record<string, string> = {
      daily: 'freq-chip freq-daily', weekly: 'freq-chip freq-weekly',
      monthly: 'freq-chip freq-monthly', quarterly: 'freq-chip freq-quarterly',
    };
    return map[freq] ?? 'freq-chip';
  }
}
