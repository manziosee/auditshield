import { Routes } from '@angular/router';
export const DOCUMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./document-list/document-list.component').then((m) => m.DocumentListComponent), title: 'Documents — AuditShield' },
  { path: 'expiry-timeline', loadComponent: () => import('./expiry-timeline/expiry-timeline.component').then((m) => m.ExpiryTimelineComponent), title: 'Expiry Timeline — AuditShield' },
  { path: 'upload', loadComponent: () => import('./document-upload/document-upload.component').then((m) => m.DocumentUploadComponent), title: 'Upload Document — AuditShield' },
  { path: ':id', loadComponent: () => import('./document-detail/document-detail.component').then((m) => m.DocumentDetailComponent), title: 'Document — AuditShield' },
];
