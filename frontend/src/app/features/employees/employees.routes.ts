import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employee-list/employee-list.component').then((m) => m.EmployeeListComponent),
    title: 'Employees — AuditShield',
  },
  {
    path: 'new',
    loadComponent: () => import('./employee-form/employee-form.component').then((m) => m.EmployeeFormComponent),
    title: 'Add Employee — AuditShield',
  },
  {
    path: ':id',
    loadComponent: () => import('./employee-detail/employee-detail.component').then((m) => m.EmployeeDetailComponent),
    title: 'Employee Profile — AuditShield',
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./employee-form/employee-form.component').then((m) => m.EmployeeFormComponent),
    title: 'Edit Employee — AuditShield',
  },
];
