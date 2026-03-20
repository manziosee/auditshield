import { Routes } from '@angular/router';

export const APPROVALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./approval-list/approval-list.component').then(m => m.ApprovalListComponent),
    title: 'Approvals — AuditShield',
  },
];
