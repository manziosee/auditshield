import { Routes } from '@angular/router';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./onboarding-list/onboarding-list.component').then(m => m.OnboardingListComponent),
    title: 'Onboarding — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./onboarding-detail/onboarding-detail.component').then(m => m.OnboardingDetailComponent),
    title: 'Employee Onboarding — AuditShield',
  },
];
