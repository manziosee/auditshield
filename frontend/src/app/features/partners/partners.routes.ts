import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';

export const PARTNERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard('super_admin')],
    loadComponent: () => import('./partner-list/partner-list.component').then(m => m.PartnerListComponent),
    title: 'Partners — AuditShield',
  },
];
