import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface IncidentUpdate {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface IncidentDetail {
  id: string;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  description: string;
  corrective_action: string;
  reported_at: string;
  resolved_at: string | null;
  assigned_to_name: string;
  employees_involved: string[];
  updates: IncidentUpdate[];
}

@Component({
  selector: 'as-incident-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="48" /></div>
      }
      @if (!loading() && incident()) {
        <div class="page-header">
          <div>
            <div class="type-label">{{ incident()!.incident_type }}</div>
            <h2 class="page-title">{{ incident()!.title }}</h2>
            <div class="header-badges">
              <span class="sev-badge" [class]="severityClass(incident()!.severity)">
                <mat-icon class="badge-icon">warning_amber</mat-icon>{{ incident()!.severity | titlecase }}
              </span>
              <span class="chip" [class]="statusChipClass(incident()!.status)">{{ incident()!.status | titlecase }}</span>
              <span class="date-label">Reported {{ incident()!.reported_at | date:'mediumDate' }}</span>
            </div>
          </div>
          @if (incident()!.status !== 'resolved' && incident()!.status !== 'closed') {
            <button mat-raised-button class="btn-resolve" (click)="resolve()" [disabled]="saving()">
              <mat-icon>check_circle</mat-icon> Resolve Incident
            </button>
          }
        </div>

        <div class="two-col">
          <div class="main-col">
            <!-- Description -->
            <mat-card class="detail-card">
              <div class="card-section-title"><mat-icon>description</mat-icon> Description</div>
              <p class="detail-text">{{ incident()!.description }}</p>
            </mat-card>

            <!-- Corrective Action -->
            @if (incident()!.corrective_action) {
              <mat-card class="detail-card">
                <div class="card-section-title"><mat-icon>build</mat-icon> Corrective Action</div>
                <p class="detail-text">{{ incident()!.corrective_action }}</p>
              </mat-card>
            }

            <!-- Updates Timeline -->
            <mat-card class="detail-card">
              <div class="card-section-title"><mat-icon>timeline</mat-icon> Updates</div>
              <div class="timeline">
                @for (upd of incident()!.updates; track upd.id) {
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="tl-author">{{ upd.author_name }}</div>
                      <div class="tl-text">{{ upd.content }}</div>
                      <div class="tl-time">{{ upd.created_at | date:'medium' }}</div>
                    </div>
                  </div>
                }
                @empty {
                  <p class="no-updates">No updates yet.</p>
                }
              </div>

              <!-- Add Update -->
              <div class="add-update-section">
                <div class="add-update-title">Add Update</div>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Update note</mat-label>
                  <textarea matInput [(ngModel)]="updateText" rows="3" placeholder="Describe what happened or what actions were taken…"></textarea>
                </mat-form-field>
                <button mat-raised-button class="btn-brand" (click)="postUpdate()" [disabled]="saving() || !updateText.trim()">
                  @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
                  @else { <mat-icon>send</mat-icon> }
                  Post Update
                </button>
              </div>
            </mat-card>
          </div>

          <div class="side-col">
            <!-- Meta card -->
            <mat-card class="meta-card">
              <div class="meta-row">
                <span class="meta-label">Assigned To</span>
                <span class="meta-value">{{ incident()!.assigned_to_name || 'Unassigned' }}</span>
              </div>
              @if (incident()!.resolved_at) {
                <div class="meta-row">
                  <span class="meta-label">Resolved</span>
                  <span class="meta-value">{{ incident()!.resolved_at | date:'mediumDate' }}</span>
                </div>
              }
              <div class="meta-row">
                <span class="meta-label">Employees Involved</span>
              </div>
              <div class="employees-chips">
                @for (emp of incident()!.employees_involved; track emp) {
                  <span class="emp-chip">{{ emp }}</span>
                }
                @empty { <span class="meta-value">None</span> }
              </div>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .center-spin { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; }
    .type-label { font-size:0.78rem; color:#22c55e; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }
    .page-title { margin:0 0 10px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .header-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .sev-badge { display:flex; align-items:center; gap:4px; padding:3px 10px; border-radius:8px; font-size:0.8rem; font-weight:700; }
    .badge-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; }
    .sev-critical { background:rgba(239,68,68,0.12); color:#f87171; }
    .sev-high { background:#ffedd5; color:#ea580c; }
    .sev-medium { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .sev-low { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .chip-blue { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-neutral { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .date-label { font-size:0.8rem; color:var(--text-muted); }
    .btn-resolve { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .two-col { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:start; }
    .main-col, .side-col { display:flex; flex-direction:column; gap:16px; }
    .detail-card { padding:20px !important; }
    .card-section-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; font-family:'Outfit',sans-serif; color:var(--text-primary); margin-bottom:12px; }
    .card-section-title mat-icon { color:#22c55e; font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .detail-text { margin:0; color:var(--text-secondary); line-height:1.7; font-size:0.9rem; }
    .timeline { display:flex; flex-direction:column; gap:0; margin-bottom:24px; }
    .timeline-item { display:flex; gap:14px; padding-bottom:20px; position:relative; }
    .timeline-item::before { content:''; position:absolute; left:9px; top:20px; bottom:0; width:2px; background:var(--border-color); }
    .timeline-item:last-child::before { display:none; }
    .timeline-dot { width:20px; height:20px; border-radius:50%; background:#22c55e; flex-shrink:0; margin-top:2px; border:3px solid var(--surface-1); }
    .timeline-content { flex:1; }
    .tl-author { font-weight:600; font-size:0.85rem; color:var(--text-primary); }
    .tl-text { font-size:0.85rem; color:var(--text-secondary); margin:4px 0; line-height:1.6; }
    .tl-time { font-size:0.72rem; color:var(--text-muted); }
    .no-updates { color:var(--text-muted); font-size:0.875rem; margin:0 0 24px; }
    .add-update-section { border-top:1px solid var(--border-color); padding-top:16px; display:flex; flex-direction:column; gap:12px; }
    .add-update-title { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .full-width { width:100%; }
    .meta-card { padding:16px 20px !important; }
    .meta-row { display:flex; flex-direction:column; gap:2px; margin-bottom:14px; }
    .meta-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .meta-value { font-size:0.875rem; color:var(--text-primary); font-weight:500; }
    .employees-chips { display:flex; flex-wrap:wrap; gap:6px; }
    .emp-chip { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500; }
    @media(max-width:768px) { .two-col { grid-template-columns:1fr; } }
  `],
})
export class IncidentDetailComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  incident   = signal<IncidentDetail | null>(null);
  loading    = signal(false);
  saving     = signal(false);
  updateText = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<IncidentDetail>(`incidents/${id}/`).subscribe({
      next: (res) => { this.incident.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load incident.'); },
    });
  }

  postUpdate(): void {
    if (!this.updateText.trim() || !this.incident()) return;
    const id = this.incident()!.id;
    this.saving.set(true);
    this.api.post(`incidents/${id}/updates/`, { content: this.updateText }).subscribe({
      next: () => {
        this.notify.success('Update posted.');
        this.updateText = '';
        this.saving.set(false);
        this.load(id);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to post update.'); },
    });
  }

  resolve(): void {
    if (!this.incident()) return;
    const id = this.incident()!.id;
    this.saving.set(true);
    this.api.patch(`incidents/${id}/`, { status: 'resolved' }).subscribe({
      next: () => {
        this.notify.success('Incident resolved.');
        this.saving.set(false);
        this.load(id);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to resolve incident.'); },
    });
  }

  severityClass(s: string): string {
    const map: Record<string, string> = {
      critical: 'sev-badge sev-critical', high: 'sev-badge sev-high',
      medium: 'sev-badge sev-medium', low: 'sev-badge sev-low',
    };
    return map[s] ?? 'sev-badge';
  }

  statusChipClass(s: string): string {
    const map: Record<string, string> = {
      open: 'chip chip-amber', investigating: 'chip chip-blue',
      resolved: 'chip chip-green', closed: 'chip chip-neutral',
    };
    return map[s] ?? 'chip';
  }
}
