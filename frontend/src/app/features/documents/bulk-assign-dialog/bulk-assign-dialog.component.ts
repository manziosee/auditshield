import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface EmployeeSuggestion {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'as-bulk-assign-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatAutocompleteModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon>assignment_ind</mat-icon> Bulk Assign Document
        </h2>
        <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="dialog-body">
        <!-- Employee Multi-select -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Search Employees</mat-label>
          <mat-chip-grid #chipGrid>
            @for (emp of selectedEmployees; track emp.id) {
              <mat-chip-row (removed)="removeEmployee(emp)">
                <span class="chip-avatar">{{ emp.name[0] }}</span>
                {{ emp.name }}
                <button matChipRemove><mat-icon>cancel</mat-icon></button>
              </mat-chip-row>
            }
          </mat-chip-grid>
          <input
            #empInput
            [(ngModel)]="empSearch"
            [matChipInputFor]="chipGrid"
            [matAutocomplete]="auto"
            [matChipInputSeparatorKeyCodes]="separatorKeys"
            (input)="searchEmployees()"
            placeholder="Type to search employees…"
          />
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectEmployee($event)">
            @for (emp of suggestions(); track emp.id) {
              <mat-option [value]="emp">
                <div class="suggestion-row">
                  <div class="sugg-avatar">{{ emp.name[0] }}</div>
                  <div>
                    <div class="sugg-name">{{ emp.name }}</div>
                    <div class="sugg-email">{{ emp.email }}</div>
                  </div>
                </div>
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        <!-- Document Type -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Document Type</mat-label>
          <mat-select [(ngModel)]="documentType">
            <mat-option value="id_document">ID Document</mat-option>
            <mat-option value="tax_certificate">Tax Certificate</mat-option>
            <mat-option value="employment_contract">Employment Contract</mat-option>
            <mat-option value="nda">Non-Disclosure Agreement</mat-option>
            <mat-option value="policy_acknowledgment">Policy Acknowledgment</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Due Date -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date</mat-label>
          <input matInput type="date" [(ngModel)]="dueDate" [min]="today()" />
          <mat-icon matPrefix style="color:#22c55e">calendar_today</mat-icon>
        </mat-form-field>

        @if (selectedEmployees.length > 0) {
          <div class="assign-summary">
            <mat-icon style="color:#22c55e">info</mat-icon>
            This will assign "{{ formatDocType(documentType) }}" to
            <strong>{{ selectedEmployees.length }} employee{{ selectedEmployees.length !== 1 ? 's' : '' }}</strong>
            with a due date of <strong>{{ dueDate | date:'mediumDate' }}</strong>
          </div>
        }
      </div>

      <div class="dialog-footer">
        <button mat-stroked-button (click)="close()">Cancel</button>
        <button mat-raised-button class="btn-brand"
          (click)="assignAll()"
          [disabled]="saving() || !selectedEmployees.length || !documentType || !dueDate">
          @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
          @else { <mat-icon>assignment_ind</mat-icon> }
          Assign to All
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container { min-width:520px; max-width:580px; }
    .dialog-header { display:flex; align-items:center; justify-content:space-between; padding:20px 20px 0; }
    .dialog-title { margin:0; display:flex; align-items:center; gap:8px; font-size:1.1rem; font-weight:700; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .dialog-title mat-icon { color:#22c55e; }
    .dialog-body { padding:16px 20px; display:flex; flex-direction:column; gap:14px; }
    .full-width { width:100%; }
    .chip-avatar { width:20px; height:20px; border-radius:50%; background:#22c55e; color: var(--brand-mid); font-size:0.65rem; font-weight:700; display:inline-flex; align-items:center; justify-content:center; margin-right:4px; }
    .suggestion-row { display:flex; align-items:center; gap:10px; }
    .sugg-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color: var(--brand-mid); font-size:0.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sugg-name { font-size:0.875rem; font-weight:600; color:var(--text-primary); }
    .sugg-email { font-size:0.75rem; color:var(--text-muted); }
    .assign-summary { display:flex; align-items:flex-start; gap:8px; padding:12px 14px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:10px; font-size:0.85rem; color:var(--text-secondary); line-height:1.5; }
    .assign-summary mat-icon { font-size:1rem; height:1rem; width:1rem; flex-shrink:0; margin-top:2px; }
    .dialog-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 20px 20px; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    @media(max-width:600px) { .dialog-container { min-width:auto; } }
  `],
})
export class BulkAssignDialogComponent {
  private readonly api     = inject(ApiService);
  private readonly notify  = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<BulkAssignDialogComponent>);

  selectedEmployees: EmployeeSuggestion[] = [];
  suggestions  = signal<EmployeeSuggestion[]>([]);
  saving       = signal(false);
  empSearch    = '';
  documentType = '';
  dueDate      = '';

  separatorKeys = [ENTER, COMMA];
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  searchEmployees(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (!this.empSearch.trim()) { this.suggestions.set([]); return; }
    this.searchTimer = setTimeout(() => {
      this.api.get<{ results: EmployeeSuggestion[] }>('employees/', { search: this.empSearch, page_size: 10 }).subscribe({
        next: (res) => this.suggestions.set(res.results ?? []),
        error: () => {},
      });
    }, 300);
  }

  selectEmployee(event: MatAutocompleteSelectedEvent): void {
    const emp = event.option.value as EmployeeSuggestion;
    if (!this.selectedEmployees.find(e => e.id === emp.id)) {
      this.selectedEmployees = [...this.selectedEmployees, emp];
    }
    this.empSearch = '';
    this.suggestions.set([]);
  }

  removeEmployee(emp: EmployeeSuggestion): void {
    this.selectedEmployees = this.selectedEmployees.filter(e => e.id !== emp.id);
  }

  assignAll(): void {
    if (!this.selectedEmployees.length || !this.documentType || !this.dueDate) return;
    this.saving.set(true);
    this.api.post('documents/bulk-assign/', {
      employee_ids: this.selectedEmployees.map(e => e.id),
      document_type: this.documentType,
      due_date: this.dueDate,
    }).subscribe({
      next: () => {
        this.notify.success(`Document assigned to ${this.selectedEmployees.length} employees.`);
        this.saving.set(false);
        this.dialogRef.close(true);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to assign documents.'); },
    });
  }

  close(): void { this.dialogRef.close(); }

  formatDocType(type: string): string {
    const map: Record<string, string> = {
      id_document: 'ID Document', tax_certificate: 'Tax Certificate',
      employment_contract: 'Employment Contract', nda: 'NDA',
      policy_acknowledgment: 'Policy Acknowledgment', other: 'Document',
    };
    return map[type] ?? type;
  }
}
