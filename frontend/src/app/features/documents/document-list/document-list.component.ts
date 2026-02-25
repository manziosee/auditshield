import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Document as Doc } from '../../../core/models/document.models';

@Component({
  selector: 'as-document-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatMenuModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Documents</h2>
          <p class="subtitle">{{ total() }} documents in the encrypted vault</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/documents/upload">
          <mat-icon>upload_file</mat-icon> Upload Document
        </button>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search documents</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Title, reference number…" />
            <mat-icon matPrefix>search</mat-icon>
            @if (searchQuery) {
              <button mat-icon-button matSuffix type="button" (click)="searchQuery=''; onSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="typeFilter" (ngModelChange)="loadDocuments()">
              <mat-option value="">All types</mat-option>
              <mat-option value="employment_contract">Employment Contract</mat-option>
              <mat-option value="paye_return">PAYE Return</mat-option>
              <mat-option value="rra_filing">RRA Filing</mat-option>
              <mat-option value="rssb_declaration">RSSB Declaration</mat-option>
              <mat-option value="vat_return">VAT Return</mat-option>
              <mat-option value="payslip">Payslip</mat-option>
              <mat-option value="tax_clearance">Tax Clearance</mat-option>
              <mat-option value="audit_report">Audit Report</mat-option>
              <mat-option value="business_registration">Business Registration</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadDocuments()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="expired">Expired</mat-option>
              <mat-option value="archived">Archived</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Expiry</mat-label>
            <mat-select [(ngModel)]="expiryFilter" (ngModelChange)="loadDocuments()">
              <mat-option value="">All</mat-option>
              <mat-option value="expiring">Expiring within 30 days</mat-option>
              <mat-option value="expired">Already expired</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="documents()">
            <ng-container matColumnDef="icon">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let doc">
                <mat-icon [class]="fileIconClass(doc.mime_type)">{{ fileIcon(doc.mime_type) }}</mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Document</th>
              <td mat-cell *matCellDef="let doc">
                <div class="doc-name">{{ doc.title }}</div>
                <div class="doc-sub">{{ formatDocType(doc.document_type) }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let doc">{{ doc.employee_name || 'Company' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let doc">
                <span class="chip" [class]="docStatusClass(doc)">{{ docStatusLabel(doc) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="expiry_date">
              <th mat-header-cell *matHeaderCellDef>Expiry</th>
              <td mat-cell *matCellDef="let doc">
                @if (doc.expiry_date) {
                  <span [class.text-danger]="doc.is_expired" [class.text-warn]="!doc.is_expired && doc.days_until_expiry !== null && doc.days_until_expiry <= 30">
                    {{ doc.expiry_date | date:'mediumDate' }}
                    @if (!doc.is_expired && doc.days_until_expiry !== null && doc.days_until_expiry <= 30) {
                      <span class="days-tag">({{ doc.days_until_expiry }}d)</span>
                    }
                  </span>
                } @else { <span class="text-muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Uploaded</th>
              <td mat-cell *matCellDef="let doc">{{ doc.created_at | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let doc" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/documents', doc.id]"><mat-icon>visibility</mat-icon> View</button>
                  <button mat-menu-item (click)="download(doc)"><mat-icon>download</mat-icon> Download</button>
                  <mat-divider />
                  <button mat-menu-item class="danger-item" (click)="confirmDelete(doc)"><mat-icon>delete</mat-icon> Delete</button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row" [routerLink]="['/documents', row.id]"></tr>
          </table>
        </div>
        @if (!loading() && documents().length === 0) {
          <div class="empty-state">
            <mat-icon>folder_off</mat-icon>
            <h3>No documents found</h3>
            <p>{{ hasFilters() ? 'Adjust your filters.' : 'Upload your first document.' }}</p>
            @if (!hasFilters()) {
              <button mat-raised-button color="primary" routerLink="/documents/upload"><mat-icon>upload_file</mat-icon> Upload Document</button>
            }
          </div>
        }
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[10,25,50]"
          (page)="onPageChange($event)" showFirstLastButtons />
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-field { flex:1; min-width:220px; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .doc-name { font-weight:500; font-size:0.875rem; }
    .doc-sub { font-size:0.75rem; color:#64748b; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-neutral { background:#f1f5f9; color:#475569; }
    .chip-success { background:#dcfce7; color:#16a34a; }
    .chip-warning { background:#fef9c3; color:#a16207; }
    .chip-danger { background:#fee2e2; color:#dc2626; }
    .chip-info { background:#dbeafe; color:#1d4ed8; }
    .text-danger { color:#dc2626; }
    .text-warn { color:#f59e0b; }
    .text-muted { color:#94a3b8; }
    .days-tag { font-size:0.7rem; }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover { background:#f8fafc; }
    .danger-item { color:#dc2626; }
    .empty-state { text-align:center; padding:48px 24px; color:#64748b; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:#1e293b; }
    .empty-state p { margin:0 0 20px; }
    .icon-pdf { color:#ef4444; }
    .icon-image { color:#3b82f6; }
    .icon-excel { color:#16a34a; }
    .icon-default { color:#8b5cf6; }
  `],
})
export class DocumentListComponent implements OnInit {
  private readonly docService = inject(DocumentService);
  private readonly notify = inject(NotificationService);

  documents = signal<Doc[]>([]);
  total = signal(0);
  loading = signal(false);

  columns = ['icon','title','employee','status','expiry_date','created_at','actions'];
  pageSize = 25;
  currentPage = 1;
  searchQuery = '';
  typeFilter = '';
  statusFilter = '';
  expiryFilter = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void { this.loadDocuments(); }

  loadDocuments(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { page: this.currentPage, page_size: this.pageSize };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.typeFilter) params['document_type'] = this.typeFilter;
    if (this.statusFilter) params['status'] = this.statusFilter;
    if (this.expiryFilter === 'expiring') params['expiring_soon'] = true;
    if (this.expiryFilter === 'expired') params['status'] = 'expired';

    this.docService.list(params).subscribe({
      next: (res) => { this.documents.set(res.results); this.total.set(res.count); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load documents.'); },
    });
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadDocuments(); }, 350);
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1; this.pageSize = e.pageSize; this.loadDocuments();
  }

  hasFilters(): boolean { return !!(this.searchQuery || this.typeFilter || this.statusFilter || this.expiryFilter); }

  download(doc: Doc): void {
    this.docService.download(doc.id, doc.file_name).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = doc.file_name; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Download failed.'),
    });
  }

  confirmDelete(doc: Doc): void {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    this.docService.delete(doc.id).subscribe({
      next: () => { this.notify.success('Document deleted.'); this.loadDocuments(); },
      error: () => this.notify.error('Failed to delete.'),
    });
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
    return dt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  docStatusClass(doc: Doc): string {
    if (doc.is_expired) return 'chip chip-danger';
    if (doc.days_until_expiry !== null && doc.days_until_expiry <= 30) return 'chip chip-warning';
    if (doc.status === 'active') return 'chip chip-success';
    if (doc.status === 'pending') return 'chip chip-info';
    return 'chip chip-neutral';
  }

  docStatusLabel(doc: Doc): string {
    if (doc.is_expired) return 'Expired';
    if (doc.days_until_expiry !== null && doc.days_until_expiry <= 30) return `Expiring soon`;
    return ({ active:'Active', pending:'Pending', expired:'Expired', archived:'Archived' } as Record<string,string>)[doc.status] ?? doc.status;
  }
}
