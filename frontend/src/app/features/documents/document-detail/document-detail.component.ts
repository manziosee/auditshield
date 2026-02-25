import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Document as Doc } from '../../../core/models/document.models';

@Component({
  selector: 'as-document-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/documents"><mat-icon>arrow_back</mat-icon></button>
        <h2>Document Details</h2>
        <span class="spacer"></span>
        @if (doc()) {
          <button mat-stroked-button (click)="download()">
            <mat-icon>download</mat-icon> Download
          </button>
        }
      </div>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="48" /></div>
      } @else if (doc(); as d) {
        <div class="detail-layout">
          <!-- Main info -->
          <mat-card>
            <mat-card-content>
              <div class="doc-header">
                <mat-icon class="doc-type-icon" [class]="iconClass(d.mime_type)">{{ fileIcon(d.mime_type) }}</mat-icon>
                <div>
                  <h3>{{ d.title }}</h3>
                  <p>{{ formatDocType(d.document_type) }}</p>
                  <div class="chips-row">
                    <span class="chip" [class]="statusClass(d)">{{ statusLabel(d) }}</span>
                    @if (d.is_encrypted) {
                      <span class="chip chip-info"><mat-icon style="font-size:12px;height:12px;width:12px">lock</mat-icon> Encrypted</span>
                    }
                    @if (d.ocr_processed) {
                      <span class="chip chip-success">OCR Done</span>
                    }
                  </div>
                </div>
              </div>
              <mat-divider style="margin:16px 0"/>
              <div class="info-grid">
                <div class="info-item"><label>File Name</label><span class="mono">{{ d.file_name }}</span></div>
                <div class="info-item"><label>File Size</label><span>{{ formatSize(d.file_size) }}</span></div>
                <div class="info-item"><label>MIME Type</label><span class="mono">{{ d.mime_type }}</span></div>
                <div class="info-item"><label>SHA-256 Checksum</label><span class="mono small">{{ d.checksum || '—' }}</span></div>
                <div class="info-item"><label>Reference Number</label><span>{{ d.reference_number || '—' }}</span></div>
                <div class="info-item"><label>Uploaded By</label><span>{{ d.uploaded_by_name || '—' }}</span></div>
                <div class="info-item"><label>Employee</label><span>{{ d.employee_name || 'Company document' }}</span></div>
                <div class="info-item"><label>Upload Date</label><span>{{ d.created_at | date:'medium' }}</span></div>
                <div class="info-item"><label>Issue Date</label><span>{{ (d.issue_date | date:'mediumDate') || '—' }}</span></div>
                <div class="info-item">
                  <label>Expiry Date</label>
                  <span [class.text-danger]="d.is_expired" [class.text-warn]="!d.is_expired && d.days_until_expiry !== null && d.days_until_expiry <= 30">
                    {{ d.expiry_date ? (d.expiry_date | date:'mediumDate') : '—' }}
                    @if (d.days_until_expiry !== null && !d.is_expired && d.days_until_expiry <= 30) {
                      <span class="days-tag"> ({{ d.days_until_expiry }} days left)</span>
                    }
                    @if (d.is_expired) { <span class="days-tag"> (Expired)</span> }
                  </span>
                </div>
                @if (d.period_start) {
                  <div class="info-item"><label>Period</label><span>{{ d.period_start | date:'mediumDate' }} — {{ d.period_end | date:'mediumDate' }}</span></div>
                }
                @if (d.description) {
                  <div class="info-item full-col"><label>Description</label><span>{{ d.description }}</span></div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- OCR text -->
          @if (d.ocr_processed && extractedText()) {
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>text_fields</mat-icon>
                <mat-card-title>Extracted Text (OCR)</mat-card-title>
                <mat-card-subtitle>Automatically extracted for search</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <pre class="ocr-text">{{ extractedText() }}</pre>
              </mat-card-content>
            </mat-card>
          } @else if (!d.ocr_processed) {
            <mat-card>
              <mat-card-content>
                <div class="ocr-pending">
                  <mat-icon>hourglass_top</mat-icon>
                  <p>OCR text extraction is pending. Check back shortly.</p>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>folder_off</mat-icon>
          <h3>Document not found</h3>
          <button mat-raised-button color="primary" routerLink="/documents">Back to List</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; }
    .page-header h2 { margin:0; font-size:1.5rem; font-weight:700; }
    .spacer { flex:1; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }
    .detail-layout { display:flex; flex-direction:column; gap:20px; }
    .doc-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:8px; }
    .doc-type-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; }
    .doc-header h3 { margin:0 0 4px; font-size:1.2rem; font-weight:700; }
    .doc-header p { margin:0 0 8px; color:#64748b; }
    .chips-row { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
    .chip { display:inline-flex; align-items:center; gap:4px; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-neutral { background:#f1f5f9; color:#475569; }
    .chip-success { background:#dcfce7; color:#16a34a; }
    .chip-warning { background:#fef9c3; color:#a16207; }
    .chip-danger { background:#fee2e2; color:#dc2626; }
    .chip-info { background:#dbeafe; color:#1d4ed8; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .full-col { grid-column:1/-1; }
    .info-item { display:flex; flex-direction:column; gap:4px; }
    .info-item label { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; font-weight:600; }
    .info-item span { font-size:0.875rem; color:#1e293b; }
    .mono { font-family:monospace; font-size:0.8rem; }
    .small { font-size:0.7rem; word-break:break-all; }
    .text-danger { color:#dc2626; }
    .text-warn { color:#f59e0b; }
    .days-tag { font-size:0.75rem; }
    .icon-pdf { color:#ef4444; }
    .icon-image { color:#3b82f6; }
    .icon-excel { color:#16a34a; }
    .icon-default { color:#8b5cf6; }
    .ocr-text { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; font-size:0.8rem; max-height:300px; overflow-y:auto; white-space:pre-wrap; word-break:break-word; margin:0; }
    .ocr-pending { display:flex; align-items:center; gap:12px; color:#64748b; padding:8px; }
    .empty-state { text-align:center; padding:60px; color:#64748b; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; display:block; margin:0 auto 12px; }
    @media(max-width:600px){ .info-grid{grid-template-columns:1fr;} }
  `],
})
export class DocumentDetailComponent implements OnInit {
  private readonly docService = inject(DocumentService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  doc = signal<Doc | null>(null);
  loading = signal(false);
  extractedText = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.docService.get(id).subscribe({
      next: (d) => {
        this.doc.set(d);
        this.loading.set(false);
        if (d.ocr_processed) this.loadOcrText(id);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load document.'); },
    });
  }

  loadOcrText(id: string): void {
    this.docService.getExtractedText(id).subscribe({
      next: (res: { extracted_text: string }) => this.extractedText.set(res.extracted_text ?? ''),
    });
  }

  download(): void {
    const d = this.doc();
    if (!d) return;
    this.docService.download(d.id, d.file_name).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = d.file_name; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Download failed.'),
    });
  }

  fileIcon(mime: string): string {
    if (mime === 'application/pdf') return 'picture_as_pdf';
    if (mime?.startsWith('image/')) return 'image';
    if (mime?.includes('spreadsheet') || mime === 'text/csv') return 'table_chart';
    return 'description';
  }

  iconClass(mime: string): string {
    if (mime === 'application/pdf') return 'icon-pdf';
    if (mime?.startsWith('image/')) return 'icon-image';
    if (mime?.includes('spreadsheet') || mime === 'text/csv') return 'icon-excel';
    return 'icon-default';
  }

  formatDocType(dt: string): string {
    return dt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatSize(bytes: number): string {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  }

  statusClass(d: Doc): string {
    if (d.is_expired) return 'chip chip-danger';
    if (d.days_until_expiry !== null && d.days_until_expiry <= 30) return 'chip chip-warning';
    if (d.status === 'active') return 'chip chip-success';
    return 'chip chip-neutral';
  }

  statusLabel(d: Doc): string {
    if (d.is_expired) return 'Expired';
    if (d.days_until_expiry !== null && d.days_until_expiry <= 30) return 'Expiring Soon';
    return ({ active:'Active', pending:'Pending', archived:'Archived' } as Record<string,string>)[d.status] ?? d.status;
  }
}
