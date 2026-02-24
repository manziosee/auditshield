import { Routes } from '@angular/router';
export const REPORTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./report-list/report-list.component').then((m) => m.ReportListComponent), title: 'Reports — AuditShield' },
  { path: 'new', loadComponent: () => import('./report-new/report-new.component').then((m) => m.ReportNewComponent), title: 'New Report — AuditShield' },
];
