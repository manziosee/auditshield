import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Landing (public) ────────────────────────────────────────────────────────
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },

  // ── Auth (public) ───────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ── Protected shell ─────────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'employees',
        canActivate: [roleGuard('super_admin', 'admin', 'hr')],
        loadChildren: () => import('./features/employees/employees.routes').then((m) => m.EMPLOYEES_ROUTES),
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
      },
      {
        path: 'compliance',
        loadChildren: () => import('./features/compliance/compliance.routes').then((m) => m.COMPLIANCE_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES),
      },
      {
        path: 'audit-logs',
        canActivate: [roleGuard('super_admin', 'admin')],
        loadChildren: () => import('./features/audit-logs/audit-logs.routes').then((m) => m.AUDIT_LOGS_ROUTES),
      },
      {
        path: 'company',
        canActivate: [roleGuard('super_admin', 'admin')],
        loadChildren: () => import('./features/company/company.routes').then((m) => m.COMPANY_ROUTES),
      },
      {
        path: 'portfolio',
        canActivate: [roleGuard('super_admin')],
        loadChildren: () => import('./features/portfolio/portfolio.routes').then((m) => m.PORTFOLIO_ROUTES),
      },
      {
        path: 'self-service',
        loadComponent: () => import('./features/self-service/self-service.component').then((m) => m.SelfServiceComponent),
        title: 'My Profile — AuditShield',
      },
      {
        path: 'signatures',
        loadChildren: () => import('./features/signatures/signatures.routes').then(m => m.SIGNATURES_ROUTES),
      },
      {
        path: 'onboarding',
        loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES),
      },
      {
        path: 'training',
        loadChildren: () => import('./features/training/training.routes').then(m => m.TRAINING_ROUTES),
      },
      {
        path: 'policies',
        loadChildren: () => import('./features/policies/policies.routes').then(m => m.POLICIES_ROUTES),
      },
      {
        path: 'incidents',
        loadChildren: () => import('./features/incidents/incidents.routes').then(m => m.INCIDENTS_ROUTES),
      },
      {
        path: 'approvals',
        loadChildren: () => import('./features/approvals/approvals.routes').then(m => m.APPROVALS_ROUTES),
      },
      {
        path: 'vendors',
        loadChildren: () => import('./features/vendors/vendors.routes').then(m => m.VENDORS_ROUTES),
      },
      {
        path: 'forms',
        loadChildren: () => import('./features/forms/forms.routes').then(m => m.FORMS_ROUTES),
      },
      {
        path: 'partners',
        canActivate: [roleGuard('super_admin')],
        loadChildren: () => import('./features/partners/partners.routes').then(m => m.PARTNERS_ROUTES),
      },
      {
        path: 'integrations',
        loadChildren: () => import('./features/integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: 'landing' },
];
