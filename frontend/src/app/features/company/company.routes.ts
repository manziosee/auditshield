import { Routes } from '@angular/router';
export const COMPANY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./company-settings/company-settings.component').then((m) => m.CompanySettingsComponent), title: 'Company Settings — AuditShield' },
];
