import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./incident-list/incident-list.component').then(m => m.IncidentListComponent),
    title: 'Incidents — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./incident-detail/incident-detail.component').then(m => m.IncidentDetailComponent),
    title: 'Incident — AuditShield',
  },
];
