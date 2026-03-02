import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../models/notification.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InAppNotificationService {
  private readonly api = inject(ApiService);
  readonly unreadCount = signal<number>(0);

  list(params?: QueryParams): Observable<PaginatedResponse<Notification>> {
    return this.api.getPaginated<Notification>('notifications/', params);
  }

  get(id: string): Observable<Notification> {
    return this.api.get<Notification>(`notifications/${id}/`);
  }

  markAsRead(id: string): Observable<Notification> {
    return this.api.patch<Notification>(`notifications/${id}/`, { is_read: true }).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('notifications/mark-all-read/', {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`notifications/${id}/`).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('notifications/unread-count/').pipe(
      tap((res) => this.unreadCount.set(res.count))
    );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
