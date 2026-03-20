import { Routes } from '@angular/router';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./training-list/training-list.component').then(m => m.TrainingListComponent),
    title: 'Training & Certifications — AuditShield',
  },
];
