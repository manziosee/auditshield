import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification, NotificationType } from '../../../core/models/notification.models';

@Component({
  selector: 'as-notifications-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatTooltipModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Notifications</h2>
          <p class="subtitle">
            {{ total() }} total
            @if (unreadCount() > 0) { · <strong>{{ unreadCount() }} unread</strong> }
          </p>
        </div>
        @if (unreadCount() > 0) {
          <button mat-stroked-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon> Mark all read
          </button>
        }
      </div>

      <div class="filter-row">
        <mat-form-field appearance="outline" style="min-width:180px">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="typeFilter" (ngModelChange)="loadNotifications()">
            <mat-option value="">All types</mat-option>
            <mat-option value="document_expiry">Document Expiry</mat-option>
            <mat-option value="compliance_due">Compliance Due</mat-option>
            <mat-option value="contract_renewal">Contract Renewal</mat-option>
            <mat-option value="system">System</mat-option>
            <mat-option value="reminder">Reminder</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" style="min-width:160px">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="readFilter" (ngModelChange)="loadNotifications()">
            <mat-option value="">All</mat-option>
            <mat-option value="unread">Unread</mat-option>
            <mat-option value="read">Read</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="40" /></div>
      } @else if (notifications().length === 0) {
        <mat-card class="empty-card">
          <mat-icon>notifications_none</mat-icon>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </mat-card>
      } @else {
        <mat-card class="notif-card">
          @for (n of notifications(); track n.id; let last = $last) {
            <div class="notif-item" [class.unread]="!n.is_read" (click)="markRead(n)">
              <div class="notif-icon-wrap" [class]="typeIconWrap(n.notification_type)">
                <mat-icon>{{ typeIcon(n.notification_type) }}</mat-icon>
              </div>
              <div class="notif-body">
                <p class="notif-title">{{ n.title }}</p>
                <p class="notif-msg">{{ n.body }}</p>
                <p class="notif-time">{{ n.created_at | date:'medium' }}</p>
              </div>
              <div class="notif-meta">
                @if (!n.is_read) {
                  <span class="unread-dot" matTooltip="Unread"></span>
                }
                <span class="chip" [class]="typeChipClass(n.notification_type)">{{ typeLabel(n.notification_type) }}</span>
              </div>
            </div>
            @if (!last) { <mat-divider /> }
          }
        </mat-card>
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[20,50,100]"
          (page)="onPageChange($event)" showFirstLastButtons />
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color: var(--text-muted); font-size:0.875rem; }
    .filter-row { display:flex; gap:12px; flex-wrap:wrap; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }
    .notif-card { padding:0 !important; overflow:hidden; }
    .notif-item { display:flex; align-items:flex-start; gap:16px; padding:16px 20px; cursor:pointer; transition:background 0.15s; }
    .notif-item:hover { background: var(--surface-2); }
    .notif-item.unread { background:#f0f9ff; }
    .notif-item.unread:hover { background:#e0f2fe; }
    .notif-icon-wrap { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .notif-icon-wrap mat-icon { font-size:1.2rem; height:1.2rem; width:1.2rem; }
    .wrap-orange { background:rgba(249,115,22,0.12); color:#fb923c; }
    .wrap-red { background:#fff1f2; color:#e11d48; }
    .wrap-blue { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .wrap-purple { background:rgba(139,92,246,0.12); color:#a78bfa; }
    .wrap-gray { background: var(--surface-2); color: var(--text-muted); }
    .notif-body { flex:1; min-width:0; }
    .notif-title { margin:0 0 2px; font-weight:600; font-size:0.875rem; color: var(--text-primary); }
    .notif-msg { margin:0 0 4px; font-size:0.8rem; color: var(--text-muted); }
    .notif-time { margin:0; font-size:0.7rem; color: var(--text-faint); }
    .notif-meta { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .unread-dot { width:8px; height:8px; border-radius:50%; background:#3b82f6; display:inline-block; }
    .chip { display:inline-block; padding:2px 8px; border-radius:20px; font-size:0.7rem; font-weight:500; }
    .chip-orange { background:rgba(249,115,22,0.12); color:#fb923c; }
    .chip-red { background:#fff1f2; color:#9f1239; }
    .chip-blue { background:rgba(59,130,246,0.12); color:#60a5fa; }
    .chip-purple { background:rgba(168,85,247,0.12); color:#c084fc; }
    .chip-gray { background: var(--surface-2); color: var(--text-secondary); }
    .empty-card { text-align:center; padding:60px !important; color: var(--text-muted); }
    .empty-card mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; display:block; margin:0 auto 12px; }
    .empty-card h3 { margin:0 0 8px; color: var(--text-primary); }
    .empty-card p { margin:0; }
  `],
})
export class NotificationsListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);

  notifications = signal<AppNotification[]>([]);
  total = signal(0);
  unreadCount = signal(0);
  loading = signal(false);

  pageSize = 20;
  currentPage = 1;
  typeFilter = '';
  readFilter = '';

  ngOnInit(): void { this.loadNotifications(); }

  loadNotifications(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { page: this.currentPage, page_size: this.pageSize };
    if (this.typeFilter) params['notification_type'] = this.typeFilter;
    if (this.readFilter === 'unread') params['is_read'] = false;
    if (this.readFilter === 'read') params['is_read'] = true;

    this.api.getPaginated<AppNotification>('notifications/', params).subscribe({
      next: (res) => {
        this.notifications.set(res.results);
        this.total.set(res.count);
        this.unreadCount.set(res.results.filter((n) => !n.is_read).length);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load notifications.'); },
    });
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1; this.pageSize = e.pageSize; this.loadNotifications();
  }

  markRead(n: AppNotification): void {
    if (n.is_read) return;
    this.api.patch<AppNotification>(`notifications/${n.id}/`, { is_read: true }).subscribe({
      next: () => {
        this.notifications.update((list) => list.map((item) => item.id === n.id ? { ...item, is_read: true } : item));
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  markAllRead(): void {
    this.api.post<void>('notifications/mark-all-read/', {}).subscribe({
      next: () => { this.notify.success('All notifications marked as read.'); this.loadNotifications(); },
      error: () => this.notify.error('Failed to mark all read.'),
    });
  }

  typeIcon(t: NotificationType): string {
    const map: Record<NotificationType, string> = {
      document_expiry: 'folder_off', compliance_due: 'assignment_late',
      contract_renewal: 'autorenew', system: 'info', reminder: 'alarm',
    };
    return map[t] ?? 'notifications';
  }

  typeIconWrap(t: NotificationType): string {
    const map: Record<NotificationType, string> = {
      document_expiry: 'wrap-orange', compliance_due: 'wrap-red',
      contract_renewal: 'wrap-blue', system: 'wrap-gray', reminder: 'wrap-purple',
    };
    return map[t] ?? 'wrap-gray';
  }

  typeChipClass(t: NotificationType): string {
    const map: Record<NotificationType, string> = {
      document_expiry: 'chip chip-orange', compliance_due: 'chip chip-red',
      contract_renewal: 'chip chip-blue', system: 'chip chip-gray', reminder: 'chip chip-purple',
    };
    return map[t] ?? 'chip chip-gray';
  }

  typeLabel(t: NotificationType): string {
    const map: Record<NotificationType, string> = {
      document_expiry: 'Doc Expiry', compliance_due: 'Compliance',
      contract_renewal: 'Contract', system: 'System', reminder: 'Reminder',
    };
    return map[t] ?? t;
  }
}
