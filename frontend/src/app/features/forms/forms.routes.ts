import { Routes } from '@angular/router';

export const FORMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./form-list/form-list.component').then(m => m.FormListComponent),
    title: 'Forms — AuditShield',
  },
  {
    path: 'builder',
    loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent),
    title: 'Form Builder — AuditShield',
  },
  {
    path: 'builder/:id',
    loadComponent: () => import('./form-builder/form-builder.component').then(m => m.FormBuilderComponent),
    title: 'Edit Form — AuditShield',
  },
];
