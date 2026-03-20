import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface SignatureRequest {
  id: string;
  title: string;
  document_name: string;
  signers_count: number;
  signed_count: number;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  expires_at: string;
  created_at: string;
}

interface SignatureStats {
  total: number;
  pending: number;
  completed: number;
  expired: number;
}

@Component({
  selector: 'as-signature-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatMenuModule, MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">E-Signatures</h2>
          <p class="subtitle">Manage document signature requests</p>
        </div>
        <button mat-raised-button class="btn-brand" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> New Request
        </button>
      </div>

      @if (showCreate()) {
        <div class="create-panel">
          <h3 class="create-panel-title">New Signature Request</h3>
          <div class="create-form">
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Request Title</mat-label>
              <input matInput [value]="newTitle()" (input)="newTitle.set($any($event.target).value)" placeholder="e.g. Employment Contract — John Doe">
            </mat-form-field>
            <mat-form-field appearance="outline" class="create-field">
              <mat-label>Message (optional)</mat-label>
              <textarea matInput rows="2" [value]="newMessage()" (input)="newMessage.set($any($event.target).value)" placeholder="Please review and sign..."></textarea>
            </mat-form-field>
          </div>
          <div class="create-actions">
            <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
            <button mat-raised-button class="btn-brand" (click)="createRequest()" [disabled]="creating() || !newTitle().trim()">
              <mat-icon>send</mat-icon> {{ creating() ? 'Creating...' : 'Create Request' }}
            </button>
          </div>
        </div>
      }

      <!-- Stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon icon-neutral">draw</mat-icon>
          <div class="stat-body">
            <span class="stat-num">{{ stats().total }}</span>
            <span class="stat-label">Total Requests</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon icon-amber">schedule</mat-icon>
          <div class="stat-body">
            <span class="stat-num amber">{{ stats().pending }}</span>
            <span class="stat-label">Pending</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon icon-green">check_circle</mat-icon>
          <div class="stat-body">
            <span class="stat-num green">{{ stats().completed }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon icon-red">cancel</mat-icon>
          <div class="stat-body">
            <span class="stat-num red">{{ stats().expired }}</span>
            <span class="stat-label">Expired</span>
          </div>
        </mat-card>
      </div>

      <!-- Table -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        @if (!loading() && requests().length === 0) {
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <h3>No signature requests yet</h3>
            <p>Create a new request to get documents signed electronically.</p>
          </div>
        }
        @if (!loading() && requests().length > 0) {
          <div class="table-wrapper">
            <table mat-table [dataSource]="requests()">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let r">
                  <div class="req-name">{{ r.title }}</div>
                </td>
              </ng-container>
              <ng-container matColumnDef="document">
                <th mat-header-cell *matHeaderCellDef>Document</th>
                <td mat-cell *matCellDef="let r">
                  <span class="doc-name"><mat-icon class="doc-icon">description</mat-icon>{{ r.document_name }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="signers">
                <th mat-header-cell *matHeaderCellDef>Signers</th>
                <td mat-cell *matCellDef="let r">
                  <span class="signers-badge">{{ r.signed_count }}/{{ r.signers_count }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  <span class="chip" [class]="statusClass(r.status)">{{ r.status | titlecase }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="expires">
                <th mat-header-cell *matHeaderCellDef>Expires</th>
                <td mat-cell *matCellDef="let r">{{ r.expires_at | date:'mediumDate' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let r" (click)="$event.stopPropagation()">
                  <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item [routerLink]="['/signatures', r.id]">
                      <mat-icon>visibility</mat-icon> View
                    </button>
                    @if (r.status === 'pending' || r.status === 'partial') {
                      <button mat-menu-item (click)="cancel(r)" class="danger-item">
                        <mat-icon>cancel</mat-icon> Cancel
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"
                  [routerLink]="['/signatures', row.id]" class="clickable-row"></tr>
            </table>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; color:var(--text-primary); font-family:'Outfit',sans-serif; letter-spacing:-0.03em;
      background: linear-gradient(135deg, #fff 0%, #d1fae5 60%, #22c55e 100%);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .stat-card { padding:20px !important; display:flex; align-items:center; gap:14px; }
    .stat-icon { font-size:2rem; height:2rem; width:2rem; }
    .icon-neutral { color:#22c55e; }
    .icon-amber { color:#d97706; }
    .icon-green { color:#16a34a; }
    .icon-red { color:#dc2626; }
    .stat-body { display:flex; flex-direction:column; }
    .stat-num { font-size:1.6rem; font-weight:700; color:var(--text-primary); }
    .stat-num.amber { color:#d97706; }
    .stat-num.green { color:#16a34a; }
    .stat-num.red { color:#dc2626; }
    .stat-label { font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; min-height:200px; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .req-name { font-weight:600; font-size:0.875rem; }
    .doc-name { display:flex; align-items:center; gap:4px; font-size:0.875rem; color:var(--text-secondary); }
    .doc-icon { font-size:1rem; height:1rem; width:1rem; color:#22c55e; }
    .signers-badge { background:rgba(34,197,94,0.12); color:#16a34a; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:600; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .chip-blue { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-neutral { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover td { background:var(--surface-2) !important; }
    .danger-item { color:#dc2626 !important; }
    .empty-state { text-align:center; padding:60px 24px; color:var(--text-muted); display:flex; flex-direction:column; align-items:center; gap:12px; }
    .empty-state svg { display:block; }
    .empty-state h3 { margin:0; color:var(--text-primary); font-size:1.1rem; }
    .empty-state p { margin:0; font-size:0.875rem; }
    @media(max-width:768px) { .stats-row { grid-template-columns:repeat(2,1fr); } }
    .create-panel { background:var(--surface-1); border:1px solid var(--brand); border-radius:16px; padding:24px; margin-bottom:24px; animation:slideDown 0.2s ease; }
    .create-panel-title { font-family:'Outfit',sans-serif; font-size:18px; font-weight:600; color:var(--text-primary); margin:0 0 16px; }
    .create-form { display:flex; flex-direction:column; gap:12px; }
    .create-field { width:100%; }
    .create-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:16px; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  `],
})
export class SignatureListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  requests   = signal<SignatureRequest[]>([]);
  loading    = signal(false);
  stats      = signal<SignatureStats>({ total: 0, pending: 0, completed: 0, expired: 0 });
  showCreate = signal(false);
  creating   = signal(false);
  newTitle   = signal('');
  newMessage = signal('');

  columns = ['title', 'document', 'signers', 'status', 'expires', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: SignatureRequest[] }>('signatures/requests/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: SignatureRequest[] }).results ?? [];
        this.requests.set(list);
        this.stats.set({
          total: list.length,
          pending: list.filter(r => r.status === 'pending').length,
          completed: list.filter(r => r.status === 'completed').length,
          expired: list.filter(r => r.status === 'expired').length,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load signature requests.'); },
    });
  }

  createRequest(): void {
    if (!this.newTitle().trim()) return;
    this.creating.set(true);
    this.api.post('signatures/requests/', {
      title: this.newTitle(),
      message: this.newMessage(),
    }).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newTitle.set('');
        this.newMessage.set('');
        this.creating.set(false);
        this.load();
      },
      error: () => this.creating.set(false),
    });
  }

  cancel(req: SignatureRequest): void {
    if (!confirm(`Cancel signature request "${req.title}"?`)) return;
    this.api.patch(`signatures/requests/${req.id}/`, { status: 'cancelled' }).subscribe({
      next: () => { this.notify.success('Request cancelled.'); this.load(); },
      error: () => this.notify.error('Failed to cancel request.'),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'chip chip-amber', partial: 'chip chip-blue',
      completed: 'chip chip-green', expired: 'chip chip-red',
    };
    return map[status] ?? 'chip chip-neutral';
  }
}
