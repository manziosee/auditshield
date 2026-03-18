import { Routes } from '@angular/router';
export const COMPLIANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./compliance-list/compliance-list.component').then((m) => m.ComplianceListComponent), title: 'Compliance — AuditShield' },
  { path: 'gap-analysis', loadComponent: () => import('./gap-analysis/gap-analysis.component').then((m) => m.GapAnalysisComponent), title: 'Gap Analysis — AuditShield' },
];
