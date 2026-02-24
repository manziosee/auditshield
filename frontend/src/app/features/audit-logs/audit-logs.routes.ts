import { Routes } from '@angular/router';
export const AUDIT_LOGS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./audit-logs-list/audit-logs-list.component').then((m) => m.AuditLogsListComponent), title: 'Audit Logs — AuditShield' },
];
