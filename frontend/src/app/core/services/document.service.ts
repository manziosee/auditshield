import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Document, DocumentUpload } from '../models/document.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiService);

  list(params?: QueryParams): Observable<PaginatedResponse<Document>> {
    return this.api.getPaginated<Document>('documents/', params);
  }

  get(id: string): Observable<Document> {
    return this.api.get<Document>(`documents/${id}/`);
  }

  upload(data: DocumentUpload): Observable<Document> {
    const fd = new FormData();
    fd.append('file', data.file);
    fd.append('title', data.title);
    fd.append('document_type', data.document_type);
    if (data.employee) fd.append('employee', data.employee);
    if (data.description) fd.append('description', data.description);
    if (data.expiry_date) fd.append('expiry_date', data.expiry_date);
    if (data.issue_date) fd.append('issue_date', data.issue_date);
    if (data.reference_number) fd.append('reference_number', data.reference_number);
    if (data.tags) fd.append('tags', JSON.stringify(data.tags));
    return this.api.postForm<Document>('documents/', fd);
  }

  download(id: string, fileName: string): Observable<Blob> {
    return this.api.downloadBlob(`documents/${id}/download/`);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`documents/${id}/`);
  }

  getExtractedText(id: string): Observable<{ extracted_text: string; ocr_processed: boolean }> {
    return this.api.get(`documents/${id}/preview_text/`);
  }
}
