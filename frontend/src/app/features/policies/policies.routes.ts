import { Routes } from '@angular/router';

export const POLICIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./policy-list/policy-list.component').then(m => m.PolicyListComponent),
    title: 'Policies — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent),
    title: 'Policy — AuditShield',
  },
];
