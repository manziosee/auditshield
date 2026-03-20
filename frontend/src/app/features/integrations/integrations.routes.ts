import { Routes } from '@angular/router';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./integration-hub/integration-hub.component').then(m => m.IntegrationHubComponent),
    title: 'Integration Hub — AuditShield',
  },
];
