import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentType } from '../../../core/models/document.models';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee } from '../../../core/models/employee.models';

@Component({
  selector: 'as-document-upload',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/documents"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h2>Upload Document</h2>
          <p class="subtitle">Files are encrypted at rest with AES-128</p>
        </div>
      </div>

      <div class="upload-layout">
        <!-- Drop zone -->
        <mat-card class="drop-zone" [class.has-file]="selectedFile()"
          (dragover)="$event.preventDefault()" (drop)="onDrop($event)" (click)="fileInput.click()">
          @if (selectedFile(); as f) {
            <mat-icon class="file-icon-lg">{{ fileIcon(f.type) }}</mat-icon>
            <p class="file-name">{{ f.name }}</p>
            <p class="file-size">{{ formatSize(f.size) }}</p>
            <button mat-stroked-button type="button" (click)="$event.stopPropagation(); clearFile()">
              <mat-icon>close</mat-icon> Remove
            </button>
          } @else {
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p class="drop-text">Drag & drop your file here</p>
            <p class="drop-sub">or click to browse</p>
            <p class="drop-formats">PDF, JPEG, PNG, TIFF, XLSX, CSV · Max 50 MB</p>
          }
        </mat-card>
        <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff,.xlsx,.xls,.csv" style="display:none" (change)="onFileChange($event)" />

        <!-- Metadata form -->
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-card>
            <mat-card-header><mat-card-title>Document Details</mat-card-title></mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title *</mat-label>
                <input matInput formControlName="title" placeholder="e.g. PAYE Return March 2025" />
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Document Type *</mat-label>
                <mat-select formControlName="document_type">
                  <mat-option value="employment_contract">Employment Contract</mat-option>
                  <mat-option value="paye_return">PAYE Return</mat-option>
                  <mat-option value="rra_filing">RRA Filing</mat-option>
                  <mat-option value="rssb_declaration">RSSB Declaration</mat-option>
                  <mat-option value="vat_return">VAT Return</mat-option>
                  <mat-option value="payslip">Payslip</mat-option>
                  <mat-option value="tax_clearance">Tax Clearance Certificate</mat-option>
                  <mat-option value="audit_report">Audit Report</mat-option>
                  <mat-option value="business_registration">Business Registration</mat-option>
                  <mat-option value="contract_amendment">Contract Amendment</mat-option>
                  <mat-option value="nda">NDA</mat-option>
                  <mat-option value="warning_letter">Warning Letter</mat-option>
                  <mat-option value="leave_form">Leave Form</mat-option>
                  <mat-option value="termination_letter">Termination Letter</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Related Employee (optional)</mat-label>
                <mat-select formControlName="employee">
                  <mat-option value="">Company-level document</mat-option>
                  @for (emp of employees(); track emp.id) {
                    <mat-option [value]="emp.id">{{ emp.full_name }} — {{ emp.employee_number }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Issue Date</mat-label>
                  <input matInput type="date" formControlName="issue_date" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Expiry Date</mat-label>
                  <input matInput type="date" formControlName="expiry_date" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reference Number</mat-label>
                <input matInput formControlName="reference_number" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </mat-card-content>
            <mat-card-actions>
              <button mat-stroked-button type="button" routerLink="/documents">Cancel</button>
              <button mat-raised-button color="primary" type="submit"
                [disabled]="form.invalid || !selectedFile() || uploading()">
                @if (uploading()) { <mat-spinner diameter="20" /> }
                @else { Upload & Encrypt }
              </button>
            </mat-card-actions>
          </mat-card>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    .upload-layout { display:grid; grid-template-columns:300px 1fr; gap:20px; }
    .drop-zone { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:280px; cursor:pointer; border:2px dashed #e2e8f0 !important; text-align:center; padding:32px 20px !important; transition:border-color 0.2s; }
    .drop-zone:hover { border-color:#3b82f6 !important; }
    .drop-zone.has-file { border-color:#22c55e !important; }
    .upload-icon { font-size:3rem; height:3rem; width:3rem; color:#94a3b8; margin-bottom:12px; }
    .file-icon-lg { font-size:3rem; height:3rem; width:3rem; color:#3b82f6; margin-bottom:8px; }
    .drop-text { font-weight:600; color:#1e293b; margin:0 0 4px; }
    .drop-sub { color:#64748b; margin:0 0 8px; }
    .drop-formats { font-size:0.75rem; color:#94a3b8; margin:0; }
    .file-name { font-weight:600; color:#1e293b; word-break:break-all; margin:0 0 4px; }
    .file-size { color:#64748b; font-size:0.875rem; margin:0 0 12px; }
    .full-width { width:100%; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
    mat-card-actions { display:flex; justify-content:flex-end; gap:8px; padding:16px !important; }
    @media(max-width:768px){ .upload-layout{grid-template-columns:1fr;} }
  `],
})
export class DocumentUploadComponent implements OnInit {
  private readonly docService = inject(DocumentService);
  private readonly empService = inject(EmployeeService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  employees = signal<Employee[]>([]);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    document_type: ['', Validators.required],
    employee: [''],
    issue_date: [''],
    expiry_date: [''],
    reference_number: [''],
    description: [''],
  });

  ngOnInit(): void {
    this.empService.list({ page_size: 200 }).subscribe({ next: (r) => this.employees.set(r.results) });
  }

  onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  clearFile(): void { this.selectedFile.set(null); }

  submit(): void {
    if (this.form.invalid || !this.selectedFile()) { this.form.markAllAsTouched(); return; }
    this.uploading.set(true);
    const v = this.form.value;

    this.docService.upload({
      file: this.selectedFile()!,
      title: v.title!,
      document_type: v.document_type! as DocumentType,
      employee: v.employee || undefined,
      issue_date: v.issue_date || undefined,
      expiry_date: v.expiry_date || undefined,
      reference_number: v.reference_number || undefined,
      description: v.description || undefined,
    }).subscribe({
      next: () => { this.notify.success('Document uploaded and queued for OCR.'); this.router.navigate(['/documents']); },
      error: (err) => { this.uploading.set(false); this.notify.error(err?.error?.detail ?? 'Upload failed.'); },
    });
  }

  fileIcon(mime: string): string {
    if (mime === 'application/pdf') return 'picture_as_pdf';
    if (mime?.startsWith('image/')) return 'image';
    if (mime?.includes('spreadsheet') || mime === 'text/csv') return 'table_chart';
    return 'description';
  }

  formatSize(bytes: number): string {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  }
}
