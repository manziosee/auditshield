import { Routes } from '@angular/router';

export const VENDORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./vendor-list/vendor-list.component').then(m => m.VendorListComponent),
    title: 'Vendors — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent),
    title: 'Vendor — AuditShield',
  },
];
