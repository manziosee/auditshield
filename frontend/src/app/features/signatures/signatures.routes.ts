import { Routes } from '@angular/router';

export const SIGNATURES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./signature-list/signature-list.component').then(m => m.SignatureListComponent),
    title: 'E-Signatures — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./signature-detail/signature-detail.component').then(m => m.SignatureDetailComponent),
    title: 'Signature Request — AuditShield',
  },
];
