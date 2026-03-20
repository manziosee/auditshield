import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/auth.models';
import { Document as Doc } from '../../core/models/document.models';

interface EmployeeProfile {
  id: string;
  full_name: string;
  job_title: string;
  department_name: string;
  hire_date: string;
  contract_type: string;
  employment_status: string;
  email: string;
  phone: string;
  nationality: string;
  tax_identifier: string;
  social_insurance_number: string;
}

@Component({
  selector: 'as-self-service',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
    <div class="portal-container page-enter">
      <!-- Header -->
      <div class="portal-header">
        <div class="portal-header-left">
          <div class="portal-avatar">
            <span>{{ initials() }}</span>
          </div>
          <div>
            <h2 class="portal-title">My Portal</h2>
            <p class="portal-sub">{{ user()?.email }}</p>
          </div>
        </div>
        <div class="portal-badge-role">
          <mat-icon>badge</mat-icon>
          {{ user()?.role | titlecase }}
        </div>
      </div>

      @if (loading()) {
        <div class="portal-loading"><mat-spinner diameter="48" /></div>
      }

      @if (!loading()) {
        <!-- Profile card -->
        <div class="portal-grid">
          <mat-card class="profile-card">
            <div class="card-section-title">
              <mat-icon>person</mat-icon> My Profile
            </div>
            @if (profile()) {
              <div class="profile-body">
                <div class="profile-avatar-large">{{ initials() }}</div>
                <div class="profile-info">
                  <h3 class="profile-name">{{ profile()!.full_name }}</h3>
                  <p class="profile-title">{{ profile()!.job_title || 'Employee' }}</p>
                  <div class="profile-meta-grid">
                    <div class="meta-item">
                      <mat-icon>business</mat-icon>
                      <span>{{ profile()!.department_name || '—' }}</span>
                    </div>
                    <div class="meta-item">
                      <mat-icon>calendar_today</mat-icon>
                      <span>Hired {{ profile()!.hire_date | date:'mediumDate' }}</span>
                    </div>
                    <div class="meta-item">
                      <mat-icon>description</mat-icon>
                      <span>{{ profile()!.contract_type || 'Full-time' }}</span>
                    </div>
                    <div class="meta-item">
                      <mat-icon>public</mat-icon>
                      <span>{{ profile()!.nationality || '—' }}</span>
                    </div>
                  </div>
                  <div class="status-row">
                    <span class="status-badge" [class]="statusClass(profile()!.employment_status)">
                      {{ profile()!.employment_status || 'Active' }}
                    </span>
                  </div>
                </div>
              </div>
            } @else {
              <div class="empty-profile">
                <mat-icon>person_off</mat-icon>
                <p>No employee record linked to your account.</p>
              </div>
            }
          </mat-card>

          <!-- Compliance score -->
          @if (profile()) {
            <mat-card class="compliance-mini-card">
              <div class="card-section-title">
                <mat-icon>shield</mat-icon> My Compliance
              </div>
              <div class="compliance-body">
                <div class="score-ring" [class]="scoreRingClass(complianceScore())">
                  <svg viewBox="0 0 80 80" class="ring-svg">
                    <circle cx="40" cy="40" r="32" class="ring-bg" />
                    <circle cx="40" cy="40" r="32" class="ring-fill"
                      [style.stroke-dasharray]="ringDash(complianceScore())"
                      [style.stroke-dashoffset]="'0'" />
                  </svg>
                  <div class="ring-label">
                    <span class="ring-num">{{ complianceScore() }}</span>
                    <span class="ring-pct">%</span>
                  </div>
                </div>
                <div class="compliance-desc">
                  @if (complianceScore() >= 80) {
                    <div class="compliance-ok">
                      <mat-icon>check_circle</mat-icon>
                      <span>All clear! Your records are up to date.</span>
                    </div>
                  } @else {
                    <div class="compliance-warn">
                      <mat-icon>warning</mat-icon>
                      <span>Some items need attention.</span>
                    </div>
                  }
                </div>
              </div>
            </mat-card>
          }
        </div>

        <!-- Documents -->
        <mat-card class="docs-card">
          <div class="card-section-title">
            <mat-icon>folder</mat-icon> My Documents
            <span class="doc-count">{{ myDocuments().length }}</span>
          </div>
          @if (myDocuments().length === 0) {
            <div class="empty-state-mini">
              <mat-icon>folder_open</mat-icon>
              <p>No documents found for your account.</p>
            </div>
          } @else {
            <div class="doc-list">
              @for (doc of myDocuments(); track doc.id) {
                <div class="doc-row">
                  <mat-icon [class]="fileIconClass(doc.mime_type)">{{ fileIcon(doc.mime_type) }}</mat-icon>
                  <div class="doc-info">
                    <div class="doc-name">{{ doc.title }}</div>
                    <div class="doc-meta">
                      {{ formatDocType(doc.document_type) }}
                      @if (doc.expiry_date) {
                        · Expires {{ doc.expiry_date | date:'mediumDate' }}
                      }
                    </div>
                  </div>
                  <div class="doc-right">
                    <span class="doc-status-chip" [class]="docStatusClass(doc)">
                      {{ docStatusLabel(doc) }}
                    </span>
                    @if (doc.document_type === 'payslip') {
                      <button mat-icon-button matTooltip="Download payslip" (click)="downloadDoc(doc)">
                        <mat-icon>download</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </mat-card>

        <!-- Payslips -->
        <mat-card class="payslips-card">
          <div class="card-section-title">
            <mat-icon>receipt_long</mat-icon> My Payslips
            <span class="doc-count">{{ payslips().length }}</span>
          </div>
          @if (payslips().length === 0) {
            <div class="empty-state-mini">
              <mat-icon>receipt</mat-icon>
              <p>No payslips available yet.</p>
            </div>
          } @else {
            <div class="payslip-grid">
              @for (ps of payslips(); track ps.id) {
                <div class="payslip-card">
                  <mat-icon class="ps-icon">receipt_long</mat-icon>
                  <div class="ps-body">
                    <div class="ps-title">{{ ps.title }}</div>
                    <div class="ps-date">{{ ps.created_at | date:'MMMM y' }}</div>
                  </div>
                  <button mat-icon-button matTooltip="Download" (click)="downloadDoc(ps)">
                    <mat-icon>download</mat-icon>
                  </button>
                </div>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .portal-container { display:flex; flex-direction:column; gap:24px; max-width:1100px; }
    .portal-header {
      display:flex; justify-content:space-between; align-items:center;
      flex-wrap:wrap; gap:16px;
    }
    .portal-header-left { display:flex; align-items:center; gap:16px; }
    .portal-avatar {
      width:52px; height:52px; border-radius:50%;
      background:linear-gradient(135deg, var(--brand), var(--brand-dark));
      display:flex; align-items:center; justify-content:center;
      color:white; font-size:1.2rem; font-weight:700;
    }
    .portal-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; }
    .portal-sub { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .portal-badge-role {
      display:flex; align-items:center; gap:6px;
      padding:6px 14px; border-radius:20px;
      background:var(--brand-subtle); color:var(--brand);
      font-size:0.8rem; font-weight:700;
      text-transform:uppercase; letter-spacing:0.05em;
    }
    .portal-loading { display:flex; justify-content:center; padding:64px; }
    .portal-grid { display:grid; grid-template-columns:1fr auto; gap:20px; }
    @media(max-width:768px){ .portal-grid { grid-template-columns:1fr; } }
    /* Cards */
    .card-section-title {
      display:flex; align-items:center; gap:8px;
      font-size:0.9rem; font-weight:700; color:var(--text-primary);
      margin-bottom:16px; text-transform:uppercase; letter-spacing:0.05em;
    }
    .card-section-title mat-icon { color:var(--brand); font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .doc-count {
      background:var(--brand-subtle); color:var(--brand);
      padding:1px 8px; border-radius:20px; font-size:0.75rem; font-weight:700;
    }
    /* Profile */
    .profile-card { padding:24px !important; }
    .profile-body { display:flex; gap:20px; align-items:flex-start; }
    .profile-avatar-large {
      width:72px; height:72px; border-radius:50%;
      background:linear-gradient(135deg, var(--brand), var(--accent));
      display:flex; align-items:center; justify-content:center;
      color:white; font-size:1.6rem; font-weight:700; flex-shrink:0;
    }
    .profile-info { flex:1; }
    .profile-name { margin:0 0 4px; font-size:1.25rem; font-weight:800; }
    .profile-title { margin:0 0 12px; color:var(--text-muted); font-size:0.9rem; }
    .profile-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
    .meta-item {
      display:flex; align-items:center; gap:6px;
      font-size:0.8rem; color:var(--text-secondary);
    }
    .meta-item mat-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; color:var(--text-muted); }
    .status-row { display:flex; gap:8px; }
    .status-badge {
      padding:3px 12px; border-radius:20px; font-size:0.72rem; font-weight:700;
      text-transform:uppercase; letter-spacing:0.05em;
    }
    .status-active { background:rgba(13,148,136,0.12); color: var(--brand); }
    .status-inactive { background:rgba(239,68,68,0.12); color:#dc2626; }
    .status-on_leave { background:rgba(245,158,11,0.12); color:#d97706; }
    .empty-profile { text-align:center; padding:24px; color:var(--text-muted); }
    .empty-profile mat-icon { font-size:2rem; height:2rem; width:2rem; opacity:0.4; display:block; margin:0 auto 8px; }
    /* Compliance ring */
    .compliance-mini-card { padding:24px !important; min-width:200px; }
    .compliance-body { display:flex; flex-direction:column; align-items:center; gap:16px; }
    .score-ring { position:relative; width:100px; height:100px; }
    .ring-svg { width:100%; height:100%; transform:rotate(-90deg); }
    .ring-bg { fill:none; stroke:var(--border-color); stroke-width:6; }
    .ring-fill {
      fill:none; stroke-width:6; stroke-linecap:round;
      transition:stroke-dasharray 0.5s ease;
    }
    .score-ring.green .ring-fill { stroke:#0d9488; }
    .score-ring.amber .ring-fill { stroke:#d97706; }
    .score-ring.red   .ring-fill { stroke:#dc2626; }
    .ring-label {
      position:absolute; inset:0; display:flex;
      align-items:center; justify-content:center;
      flex-direction:row; gap:1px;
    }
    .ring-num { font-size:1.4rem; font-weight:800; color:var(--text-primary); }
    .ring-pct { font-size:0.8rem; color:var(--text-muted); margin-top:6px; }
    .compliance-ok { display:flex; align-items:center; gap:8px; color: var(--brand); font-size:0.8rem; font-weight:600; text-align:center; }
    .compliance-warn { display:flex; align-items:center; gap:8px; color:#d97706; font-size:0.8rem; font-weight:600; text-align:center; }
    /* Docs */
    .docs-card { padding:24px !important; }
    .doc-list { display:flex; flex-direction:column; gap:1px; }
    .doc-row {
      display:flex; align-items:center; gap:12px; padding:10px 0;
      border-bottom:1px solid var(--border-subtle);
    }
    .doc-row:last-child { border-bottom:none; }
    .doc-row mat-icon { color:var(--text-muted); }
    .doc-info { flex:1; min-width:0; }
    .doc-name { font-size:0.875rem; font-weight:600; color:var(--text-primary); }
    .doc-meta { font-size:0.75rem; color:var(--text-muted); }
    .doc-right { display:flex; align-items:center; gap:8px; }
    .doc-status-chip {
      padding:2px 8px; border-radius:20px; font-size:0.7rem; font-weight:700;
    }
    .chip-active  { background:rgba(13,148,136,0.12); color: var(--brand); }
    .chip-pending { background:rgba(245,158,11,0.12); color:#d97706; }
    .chip-expired { background:rgba(239,68,68,0.12); color:#dc2626; }
    .chip-archived { background:rgba(148,163,184,0.12); color: var(--text-muted); }
    .icon-pdf { color:#ef4444; }
    .icon-image { color:#3b82f6; }
    .icon-excel { color:#16a34a; }
    .icon-default { color:#8b5cf6; }
    /* Payslips */
    .payslips-card { padding:24px !important; }
    .payslip-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px; }
    .payslip-card {
      display:flex; align-items:center; gap:12px; padding:14px 16px;
      border:1px solid var(--border-color); border-radius:12px;
      background:var(--surface-hover); transition:all 0.15s;
    }
    .payslip-card:hover { border-color:var(--brand); background:var(--brand-subtle); }
    .ps-icon { color:var(--brand); }
    .ps-body { flex:1; min-width:0; }
    .ps-title { font-size:0.8rem; font-weight:600; color:var(--text-primary); }
    .ps-date { font-size:0.72rem; color:var(--text-muted); }
    /* Empty */
    .empty-state-mini { text-align:center; padding:32px 16px; color:var(--text-muted); }
    .empty-state-mini mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.35; display:block; margin:0 auto 8px; }
    .empty-state-mini p { margin:0; font-size:0.875rem; }
  `],
})
export class SelfServiceComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly auth   = inject(AuthService);
  private readonly notify = inject(NotificationService);

  loading      = signal(false);
  user         = this.auth.user;
  profile      = signal<EmployeeProfile | null>(null);
  myDocuments  = signal<Doc[]>([]);
  payslips     = signal<Doc[]>([]);
  complianceScore = signal(0);

  initials(): string {
    const u = this.user();
    if (!u) return '?';
    return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || u.email[0].toUpperCase();
  }

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading.set(true);
    const u = this.user();

    // Load employee profile
    this.api.getPaginated<EmployeeProfile>('employees/', { page_size: 5 }).subscribe({
      next: (res) => {
        const emp = res.results[0] ?? null;
        this.profile.set(emp);
        if (emp) {
          // Approximate compliance score from employment status
          this.complianceScore.set(emp.employment_status === 'active' ? 100 : 65);
        }
      },
    });

    // Load my documents
    this.api.getPaginated<Doc>('documents/', { page_size: 50 }).subscribe({
      next: (res) => {
        this.myDocuments.set(res.results);
        this.payslips.set(res.results.filter(d => d.document_type === 'payslip'));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load portal data.'); },
    });
  }

  downloadDoc(doc: Doc): void {
    this.api.downloadBlob(`documents/${doc.id}/download/`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = doc.file_name; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Download failed.'),
    });
  }

  scoreRingClass(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 50) return 'amber';
    return 'red';
  }

  ringDash(score: number): string {
    const circumference = 2 * Math.PI * 32;
    const filled = (score / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'status-active', inactive: 'status-inactive', on_leave: 'status-on_leave',
    };
    return map[status] ?? 'status-active';
  }

  fileIcon(mime: string): string {
    if (mime === 'application/pdf') return 'picture_as_pdf';
    if (mime?.startsWith('image/')) return 'image';
    if (mime?.includes('spreadsheet') || mime?.includes('excel') || mime === 'text/csv') return 'table_chart';
    return 'description';
  }

  fileIconClass(mime: string): string {
    if (mime === 'application/pdf') return 'icon-pdf';
    if (mime?.startsWith('image/')) return 'icon-image';
    if (mime?.includes('spreadsheet') || mime?.includes('excel') || mime === 'text/csv') return 'icon-excel';
    return 'icon-default';
  }

  formatDocType(dt: string): string {
    return dt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  docStatusClass(doc: Doc): string {
    if (doc.is_expired) return 'doc-status-chip chip-expired';
    if (doc.days_until_expiry !== null && doc.days_until_expiry <= 30) return 'doc-status-chip chip-pending';
    if (doc.status === 'active') return 'doc-status-chip chip-active';
    if (doc.status === 'pending') return 'doc-status-chip chip-pending';
    return 'doc-status-chip chip-archived';
  }

  docStatusLabel(doc: Doc): string {
    if (doc.is_expired) return 'Expired';
    if (doc.days_until_expiry !== null && doc.days_until_expiry <= 30) return `${doc.days_until_expiry}d left`;
    return ({ active: 'Active', pending: 'Pending', expired: 'Expired', archived: 'Archived' } as Record<string, string>)[doc.status] ?? doc.status;
  }
}
