import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Document as Doc } from '../../../core/models/document.models';

@Component({
  selector: 'as-expiry-timeline',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    MatTooltipModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="timeline-wrapper">
      <div class="tl-header">
        <div class="tl-title">
          <mat-icon>timeline</mat-icon>
          Document Expiry Timeline
        </div>
        <div class="tl-controls">
          <mat-form-field appearance="outline" class="tl-filter">
            <mat-label>Show</mat-label>
            <mat-select [(ngModel)]="filterMode" (ngModelChange)="applyFilter()">
              <mat-option value="expiring">Expiring / Expired only</mat-option>
              <mat-option value="all">All with expiry</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      @if (loading()) {
        <div class="tl-loading"><mat-spinner diameter="32" /></div>
      }

      @if (!loading() && filteredDocs().length === 0) {
        <div class="tl-empty">
          <mat-icon>event_available</mat-icon>
          <p>No expiring documents found.</p>
        </div>
      }

      @if (!loading() && filteredDocs().length > 0) {
        <!-- Scale bar -->
        <div class="scale-bar">
          <span class="scale-label scale-expired">Expired</span>
          <div class="scale-track">
            <div class="red-zone-marker" matTooltip="30-day threshold"></div>
          </div>
          <span class="scale-label scale-safe">&gt; 60 days</span>
        </div>

        <!-- Timeline rows -->
        <div class="tl-list">
          @for (doc of filteredDocs(); track doc.id) {
            <div class="tl-row">
              <div class="tl-name">
                <mat-icon [class]="fileIconClass(doc.mime_type)" class="tl-file-icon">{{ fileIcon(doc.mime_type) }}</mat-icon>
                <div class="tl-name-body">
                  <span class="tl-doc-title" [matTooltip]="doc.title">{{ doc.title }}</span>
                  <span class="tl-doc-type">{{ formatDocType(doc.document_type) }}</span>
                </div>
              </div>
              <div class="tl-bar-wrap">
                <!-- Expired: striped bar going backwards -->
                @if (doc.is_expired) {
                  <div class="tl-bar-track">
                    <div class="tl-bar tl-bar-expired striped" style="width: 100%">
                      <span class="bar-label">Expired</span>
                    </div>
                  </div>
                } @else if (doc.days_until_expiry !== null) {
                  <div class="tl-bar-track">
                    <div
                      class="tl-bar"
                      [class]="barClass(doc.days_until_expiry)"
                      [style.width]="barWidth(doc.days_until_expiry)"
                      [matTooltip]="doc.days_until_expiry + ' days remaining'"
                    >
                      @if (doc.days_until_expiry > 10) {
                        <span class="bar-label">{{ doc.days_until_expiry }}d</span>
                      }
                    </div>
                    <!-- Red zone marker line -->
                    <div class="red-zone-line" [matTooltip]="'30-day threshold'"></div>
                  </div>
                } @else {
                  <div class="tl-bar-track">
                    <div class="tl-no-expiry">No expiry set</div>
                  </div>
                }
              </div>
              <div class="tl-date">
                @if (doc.expiry_date) {
                  <span [class.text-danger]="doc.is_expired"
                        [class.text-warning]="!doc.is_expired && doc.days_until_expiry !== null && doc.days_until_expiry <= 30">
                    {{ doc.expiry_date | date:'MMM d, y' }}
                  </span>
                } @else {
                  <span class="text-faint">—</span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-wrapper {
      background: var(--surface-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }
    .tl-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .tl-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tl-title mat-icon { color: var(--brand); }
    .tl-filter { min-width: 200px; }
    .tl-loading, .tl-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--text-muted);
      gap: 12px;
    }
    .tl-empty mat-icon { font-size: 2.5rem; height: 2.5rem; width: 2.5rem; opacity: 0.4; }
    .tl-empty p { margin: 0; font-size: 0.875rem; }
    /* Scale bar */
    .scale-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      padding: 0 0 0 220px;
    }
    .scale-label { font-size: 0.7rem; color: var(--text-faint); font-weight: 600; white-space: nowrap; }
    .scale-expired { color: #dc2626; }
    .scale-safe { color: #22c55e; }
    .scale-track {
      flex: 1;
      height: 2px;
      background: linear-gradient(to right, #dc2626, #f59e0b 30%, #22c55e);
      border-radius: 2px;
      position: relative;
    }
    .red-zone-marker {
      position: absolute;
      left: 30%;
      top: -4px;
      width: 2px;
      height: 10px;
      background: #f59e0b;
      border-radius: 2px;
    }
    /* Row */
    .tl-list { display: flex; flex-direction: column; gap: 6px; }
    .tl-row {
      display: grid;
      grid-template-columns: 220px 1fr 100px;
      align-items: center;
      gap: 12px;
      padding: 6px 0;
    }
    .tl-name {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .tl-file-icon { font-size: 1.1rem; height: 1.1rem; width: 1.1rem; flex-shrink: 0; }
    .tl-name-body { min-width: 0; }
    .tl-doc-title {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tl-doc-type { font-size: 0.68rem; color: var(--text-faint); }
    /* Bars */
    .tl-bar-wrap { position: relative; }
    .tl-bar-track {
      position: relative;
      background: var(--surface-hover);
      border-radius: 6px;
      height: 22px;
      overflow: visible;
    }
    .tl-bar {
      height: 22px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      min-width: 24px;
      transition: width 0.4s ease;
      position: relative;
    }
    .tl-bar-green  { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .tl-bar-amber  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .tl-bar-red    { background: linear-gradient(90deg, #ef4444, #f87171); }
    .tl-bar-expired { background: repeating-linear-gradient(
      45deg,
      rgba(239,68,68,0.25),
      rgba(239,68,68,0.25) 6px,
      rgba(239,68,68,0.08) 6px,
      rgba(239,68,68,0.08) 12px
    ); border: 1px solid rgba(239,68,68,0.3); }
    .bar-label { font-size: 0.65rem; font-weight: 700; color: white; }
    .tl-bar-expired .bar-label { color: #dc2626; }
    /* Red-zone line at 30% */
    .red-zone-line {
      position: absolute;
      left: 30%;
      top: 0;
      width: 2px;
      height: 100%;
      background: rgba(245,158,11,0.5);
      border-radius: 2px;
      pointer-events: none;
    }
    .tl-no-expiry {
      font-size: 0.72rem;
      color: var(--text-faint);
      height: 22px;
      display: flex;
      align-items: center;
      padding: 0 8px;
    }
    .tl-date { font-size: 0.75rem; color: var(--text-muted); text-align: right; }
    .text-danger  { color: #dc2626 !important; }
    .text-warning { color: #f59e0b !important; }
    .text-faint   { color: var(--text-faint); }
    .icon-pdf   { color: #ef4444; }
    .icon-image { color: #3b82f6; }
    .icon-excel { color: #16a34a; }
    .icon-default { color: #8b5cf6; }
    @media (max-width: 600px) {
      .tl-row { grid-template-columns: 1fr; }
      .scale-bar { padding: 0; }
    }
  `],
})
export class ExpiryTimelineComponent implements OnInit {
  private readonly docService = inject(DocumentService);
  private readonly notify     = inject(NotificationService);

  loading     = signal(false);
  allDocs     = signal<Doc[]>([]);
  filterMode  = 'expiring';
  MAX_DAYS    = 90; // 90 days = 100% width

  filteredDocs = computed(() => {
    const docs = this.allDocs().filter(d => d.expiry_date !== null);
    if (this.filterMode === 'expiring') {
      return docs.filter(d => d.is_expired || (d.days_until_expiry !== null && d.days_until_expiry <= 60));
    }
    return docs;
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.docService.list({ page_size: 100 }).subscribe({
      next: (res) => {
        const sorted = res.results
          .filter(d => d.expiry_date)
          .sort((a, b) => {
            if (a.is_expired && !b.is_expired) return -1;
            if (!a.is_expired && b.is_expired) return 1;
            const da = a.days_until_expiry ?? 999;
            const db = b.days_until_expiry ?? 999;
            return da - db;
          });
        this.allDocs.set(sorted);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load documents.'); },
    });
  }

  applyFilter(): void {
    // filterMode is reactive via computed signal
  }

  barWidth(days: number): string {
    if (days <= 0) return '100%';
    const pct = Math.min((days / this.MAX_DAYS) * 100, 100);
    return `${pct}%`;
  }

  barClass(days: number): string {
    if (days < 0) return 'tl-bar tl-bar-expired striped';
    if (days <= 30) return 'tl-bar tl-bar-red';
    if (days <= 60) return 'tl-bar tl-bar-amber';
    return 'tl-bar tl-bar-green';
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
}
