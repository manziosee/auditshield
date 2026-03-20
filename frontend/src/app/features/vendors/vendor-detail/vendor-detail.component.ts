import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface VendorDocument {
  id: string;
  document_type: string;
  file_name: string;
  uploaded_at: string;
  expiry_date: string | null;
  status: 'valid' | 'expired' | 'expiring_soon';
}

interface VendorDetail {
  id: string;
  name: string;
  vendor_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  compliance_score: number;
  status: string;
  address: string;
  notes: string;
  documents: VendorDocument[];
}

@Component({
  selector: 'as-vendor-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTabsModule, MatTableModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="48" /></div>
      }
      @if (!loading() && vendor()) {
        <!-- Vendor Header -->
        <mat-card class="header-card">
          <div class="vendor-header">
            <div class="vendor-avatar-lg">{{ vendor()!.name[0] }}</div>
            <div class="vendor-info">
              <h2 class="vendor-name">{{ vendor()!.name }}</h2>
              <div class="vendor-meta">
                <span class="type-chip">{{ vendor()!.vendor_type }}</span>
                <span class="status-badge" [class]="statusClass(vendor()!.status)">{{ vendor()!.status | titlecase }}</span>
              </div>
              @if (vendor()!.address) {
                <div class="vendor-address"><mat-icon class="inline-icon">location_on</mat-icon>{{ vendor()!.address }}</div>
              }
            </div>
            <!-- Compliance Score Ring -->
            <div class="score-ring-container">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
                <circle cx="50" cy="50" r="40" fill="none"
                  [attr.stroke]="scoreColor(vendor()!.compliance_score)"
                  stroke-width="10" stroke-linecap="round"
                  [attr.stroke-dasharray]="251.33"
                  [attr.stroke-dashoffset]="251.33 - (251.33 * vendor()!.compliance_score / 100)"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="score-ring-inner">
                <div class="score-num" [style.color]="scoreColor(vendor()!.compliance_score)">{{ vendor()!.compliance_score }}</div>
                <div class="score-sub">Score</div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-tab-group class="tabs" animationDuration="200ms">
          <!-- Info Tab -->
          <mat-tab label="Details">
            <mat-card class="info-card">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Contact Person</div>
                  <div class="info-value">{{ vendor()!.contact_name }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{ vendor()!.contact_email }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">{{ vendor()!.contact_phone || '—' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Address</div>
                  <div class="info-value">{{ vendor()!.address || '—' }}</div>
                </div>
              </div>
              @if (vendor()!.notes) {
                <div class="notes-section">
                  <div class="info-label">Notes</div>
                  <p class="notes-text">{{ vendor()!.notes }}</p>
                </div>
              }
            </mat-card>
          </mat-tab>

          <!-- Documents Tab -->
          <mat-tab label="Documents ({{ vendor()!.documents.length }})">
            <mat-card class="docs-card">
              <div class="docs-header">
                <div class="docs-title">Vendor Documents</div>
                <button mat-stroked-button class="upload-btn">
                  <mat-icon>upload</mat-icon> Upload Document
                </button>
              </div>
              <div class="table-wrapper">
                <table mat-table [dataSource]="vendor()!.documents">
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Document Type</th>
                    <td mat-cell *matCellDef="let d"><strong>{{ d.document_type }}</strong></td>
                  </ng-container>
                  <ng-container matColumnDef="filename">
                    <th mat-header-cell *matHeaderCellDef>File</th>
                    <td mat-cell *matCellDef="let d">
                      <span class="file-name"><mat-icon class="file-icon">attach_file</mat-icon>{{ d.file_name }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="uploaded">
                    <th mat-header-cell *matHeaderCellDef>Uploaded</th>
                    <td mat-cell *matCellDef="let d">{{ d.uploaded_at | date:'mediumDate' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="expiry">
                    <th mat-header-cell *matHeaderCellDef>Expiry</th>
                    <td mat-cell *matCellDef="let d">{{ d.expiry_date ? (d.expiry_date | date:'mediumDate') : '—' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let d">
                      <span class="chip" [class]="docStatusClass(d.status)">{{ d.status | titlecase }}</span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="docColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: docColumns;"></tr>
                </table>
              </div>
              @if (vendor()!.documents.length === 0) {
                <div class="empty-docs">
                  <mat-icon>folder_open</mat-icon>
                  <p>No documents uploaded yet</p>
                </div>
              }
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; max-width:960px; }
    .center-spin { display:flex; justify-content:center; padding:80px; }
    .header-card { padding:24px !important; }
    .vendor-header { display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
    .vendor-avatar-lg { width:64px; height:64px; border-radius:16px; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:1.5rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .vendor-info { flex:1; }
    .vendor-name { margin:0 0 8px; font-size:1.4rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .vendor-meta { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
    .type-chip { background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600; }
    .status-badge { padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600; }
    .status-active { background:rgba(34,197,94,0.12); color:#4ade80; }
    .status-suspended { background:rgba(239,68,68,0.12); color:#f87171; }
    .status-pending { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .vendor-address { display:flex; align-items:center; gap:4px; font-size:0.8rem; color:var(--text-muted); }
    .inline-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; color:#22c55e; }
    .score-ring-container { position:relative; width:100px; height:100px; flex-shrink:0; }
    .score-ring-container svg { position:absolute; inset:0; }
    .score-ring-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .score-num { font-size:1.5rem; font-weight:800; line-height:1; }
    .score-sub { font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .tabs { background:var(--surface-1); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; }
    .info-card { padding:24px !important; margin:16px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-bottom:20px; }
    .info-item {}
    .info-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
    .info-value { font-size:0.9rem; color:var(--text-primary); font-weight:500; }
    .notes-section { border-top:1px solid var(--border-color); padding-top:16px; }
    .notes-text { margin:8px 0 0; color:var(--text-secondary); line-height:1.6; font-size:0.875rem; }
    .docs-card { padding:20px !important; margin:16px; border-radius:12px !important; border:1px solid var(--border-color) !important; }
    .docs-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .docs-title { font-weight:700; font-size:0.95rem; color:var(--text-primary); font-family:'Outfit',sans-serif; }
    .upload-btn { color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .file-name { display:flex; align-items:center; gap:4px; font-size:0.875rem; }
    .file-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; color:#22c55e; }
    .chip { display:inline-block; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:500; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .empty-docs { text-align:center; padding:32px; color:var(--text-muted); }
    .empty-docs mat-icon { font-size:2rem; height:2rem; width:2rem; opacity:0.3; display:block; margin:0 auto 8px; }
    .empty-docs p { margin:0; }
    @media(max-width:600px) { .info-grid { grid-template-columns:1fr; } }
  `],
})
export class VendorDetailComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  vendor  = signal<VendorDetail | null>(null);
  loading = signal(false);

  docColumns = ['type', 'filename', 'uploaded', 'expiry', 'status'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<VendorDetail>(`vendors/${id}/`).subscribe({
      next: (res) => { this.vendor.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load vendor.'); },
    });
  }

  scoreColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'status-badge status-active', suspended: 'status-badge status-suspended',
      pending: 'status-badge status-pending',
    };
    return map[status] ?? 'status-badge';
  }

  docStatusClass(status: string): string {
    const map: Record<string, string> = {
      valid: 'chip chip-green', expired: 'chip chip-red', expiring_soon: 'chip chip-amber',
    };
    return map[status] ?? 'chip';
  }
}
