import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface DocumentVersion {
  id: string;
  version_number: number;
  file_name: string;
  file_size: number;
  uploaded_by_name: string;
  uploaded_at: string;
  changelog: string;
  is_current: boolean;
}

@Component({
  selector: 'as-version-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Version History</h2>
          <p class="subtitle">{{ documentName || 'Document versions and history' }}</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showUpload = !showUpload">
          <mat-icon>upload</mat-icon> Upload New Version
        </button>
      </div>

      @if (showUpload) {
        <mat-card class="upload-card">
          <div class="upload-title"><mat-icon>cloud_upload</mat-icon> Upload New Version</div>
          <div class="upload-form">
            <div class="file-pick-area" (click)="fileInput.click()">
              <mat-icon class="upload-icon">attach_file</mat-icon>
              <span>{{ selectedFile ? selectedFile.name : 'Click to select file' }}</span>
              <input #fileInput type="file" hidden (change)="onFileSelect($event)" />
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Changelog / What changed?</mat-label>
              <textarea matInput [(ngModel)]="changelog" rows="2" placeholder="Describe what changed in this version…"></textarea>
            </mat-form-field>
            <div class="upload-actions">
              <button mat-raised-button class="btn-brand" (click)="uploadVersion()" [disabled]="saving() || !selectedFile">
                @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
                @else { <mat-icon>upload</mat-icon> }
                Upload Version
              </button>
              <button mat-stroked-button (click)="showUpload = false">Cancel</button>
            </div>
          </div>
        </mat-card>
      }

      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="40" /></div>
      }

      <!-- Version Timeline -->
      <div class="timeline">
        @for (version of versions(); track version.id) {
          <div class="version-item" [class.current]="version.is_current">
            <div class="version-badge" [class.current-badge]="version.is_current">
              v{{ version.version_number }}
            </div>
            <div class="version-content">
              <mat-card class="version-card" [class.current-card]="version.is_current">
                <div class="version-header">
                  <div class="version-meta">
                    <span class="version-label">
                      Version {{ version.version_number }}
                      @if (version.is_current) {
                        <span class="current-chip">Current</span>
                      }
                    </span>
                    <span class="version-date">{{ version.uploaded_at | date:'medium' }}</span>
                  </div>
                  <div class="version-actions">
                    <button mat-icon-button matTooltip="Download" (click)="download(version)">
                      <mat-icon>download</mat-icon>
                    </button>
                    @if (!version.is_current) {
                      <button mat-stroked-button class="restore-btn" (click)="restore(version)">
                        <mat-icon>restore</mat-icon> Restore
                      </button>
                    }
                  </div>
                </div>
                <div class="version-file">
                  <mat-icon class="file-icon">description</mat-icon>
                  <span class="file-name">{{ version.file_name }}</span>
                  <span class="file-size">{{ formatSize(version.file_size) }}</span>
                </div>
                @if (version.changelog) {
                  <div class="changelog">
                    <mat-icon class="changelog-icon">notes</mat-icon>
                    <span>{{ version.changelog }}</span>
                  </div>
                }
                <div class="uploader">
                  <mat-icon class="uploader-icon">person</mat-icon>
                  <span>Uploaded by {{ version.uploaded_by_name }}</span>
                </div>
              </mat-card>
            </div>
          </div>
        }
        @empty {
          @if (!loading()) {
            <div class="empty-state">
              <mat-icon>history</mat-icon>
              <h3>No version history</h3>
              <p>Upload the first version to start tracking document history.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; max-width:800px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .upload-card { padding:20px !important; }
    .upload-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:14px; font-family:'Outfit',sans-serif; }
    .upload-title mat-icon { color:#22c55e; }
    .upload-form { display:flex; flex-direction:column; gap:12px; }
    .file-pick-area { border:2px dashed var(--border-color); border-radius:10px; padding:20px; text-align:center; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.875rem; transition:border-color 0.15s; }
    .file-pick-area:hover { border-color:#22c55e; color:#22c55e; }
    .upload-icon { color:#22c55e; }
    .full-width { width:100%; }
    .upload-actions { display:flex; gap:10px; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .timeline { display:flex; flex-direction:column; gap:0; }
    .version-item { display:flex; gap:16px; padding-bottom:0; }
    .version-item::before { display:none; }
    .version-badge { width:40px; min-width:40px; height:40px; border-radius:50%; background:var(--surface-2); border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size:0.72rem; font-weight:700; color:var(--text-muted); flex-shrink:0; margin-top:20px; position:relative; z-index:1; }
    .current-badge { background:linear-gradient(135deg,#22c55e,#16a34a); border-color:#22c55e; color: var(--brand-mid); }
    .version-content { flex:1; padding-bottom:16px; border-left:2px solid var(--border-color); margin-left:-20px; padding-left:20px; }
    .version-item:last-child .version-content { border-left-color:transparent; }
    .version-card { padding:16px !important; border-radius:12px !important; border:1px solid var(--border-color) !important; margin-left:12px; }
    .current-card { border-color:rgba(34,197,94,0.4) !important; background:rgba(34,197,94,0.04) !important; }
    .version-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .version-meta { display:flex; flex-direction:column; gap:2px; }
    .version-label { font-weight:700; font-size:0.875rem; color:var(--text-primary); display:flex; align-items:center; gap:6px; }
    .current-chip { background:#22c55e; color: var(--brand-mid); padding:1px 8px; border-radius:10px; font-size:0.7rem; font-weight:700; }
    .version-date { font-size:0.75rem; color:var(--text-muted); }
    .version-actions { display:flex; align-items:center; gap:6px; }
    .restore-btn { font-size:0.78rem !important; color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; }
    .version-file { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .file-icon { font-size:1rem; height:1rem; width:1rem; color:#22c55e; }
    .file-name { font-size:0.875rem; color:var(--text-secondary); flex:1; }
    .file-size { font-size:0.75rem; color:var(--text-muted); }
    .changelog { display:flex; align-items:flex-start; gap:6px; font-size:0.8rem; color:var(--text-secondary); margin-bottom:6px; line-height:1.5; font-style:italic; }
    .changelog-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; color:var(--text-muted); margin-top:2px; flex-shrink:0; }
    .uploader { display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--text-muted); }
    .uploader-icon { font-size:0.85rem; height:0.85rem; width:0.85rem; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
  `],
})
export class VersionHistoryComponent implements OnInit {
  @Input() documentId?: string;
  @Input() documentName?: string;

  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  versions    = signal<DocumentVersion[]>([]);
  loading     = signal(false);
  saving      = signal(false);
  showUpload  = false;
  changelog   = '';
  selectedFile: File | null = null;

  ngOnInit(): void {
    const id = this.documentId ?? this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<{ results: DocumentVersion[] } | DocumentVersion[]>(`documents/${id}/versions/`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: DocumentVersion[] }).results ?? [];
        this.versions.set(list);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load version history.'); },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  uploadVersion(): void {
    if (!this.selectedFile) return;
    const id = this.documentId ?? this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const form = new FormData();
    form.append('file', this.selectedFile);
    form.append('changelog', this.changelog);
    this.saving.set(true);
    this.api.postForm(`documents/${id}/versions/`, form).subscribe({
      next: () => {
        this.notify.success('New version uploaded.');
        this.saving.set(false);
        this.showUpload = false;
        this.selectedFile = null;
        this.changelog = '';
        this.load(id);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to upload version.'); },
    });
  }

  download(version: DocumentVersion): void {
    const id = this.documentId ?? this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.downloadBlob(`documents/${id}/versions/${version.id}/download/`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = version.file_name;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Failed to download version.'),
    });
  }

  restore(version: DocumentVersion): void {
    const id = this.documentId ?? this.route.snapshot.paramMap.get('id');
    if (!id || !confirm(`Restore v${version.version_number} as the current version?`)) return;
    this.api.post(`documents/${id}/versions/${version.id}/restore/`, {}).subscribe({
      next: () => { this.notify.success(`Restored to v${version.version_number}.`); this.load(id); },
      error: () => this.notify.error('Failed to restore version.'),
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
