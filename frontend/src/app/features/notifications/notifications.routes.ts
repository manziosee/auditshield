import { Routes } from '@angular/router';
export const NOTIFICATIONS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./notifications-list/notifications-list.component').then((m) => m.NotificationsListComponent), title: 'Notifications — AuditShield' },
];
