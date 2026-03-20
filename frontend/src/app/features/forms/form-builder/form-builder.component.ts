import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'signature';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  editing?: boolean;
}

interface FieldPaletteItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'as-form-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">{{ isEdit ? 'Edit Form' : 'Create Form' }}</h2>
          <p class="subtitle">Drag or click fields to build your form</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/forms">Cancel</button>
          <button mat-raised-button class="btn-brand" (click)="save()" [disabled]="saving()">
            @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
            @else { <mat-icon>save</mat-icon> }
            Save Form
          </button>
        </div>
      </div>

      <!-- Form Meta -->
      <mat-card class="meta-card">
        <div class="meta-row">
          <mat-form-field appearance="outline" class="title-field">
            <mat-label>Form Title</mat-label>
            <input matInput [(ngModel)]="formTitle" placeholder="Enter form title…" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="formCategory">
              <mat-option value="compliance">Compliance</mat-option>
              <mat-option value="hr">HR</mat-option>
              <mat-option value="onboarding">Onboarding</mat-option>
              <mat-option value="incident">Incident</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <div class="builder-layout">
        <!-- Left: Field Palette -->
        <mat-card class="palette-card">
          <div class="palette-title"><mat-icon>view_module</mat-icon> Field Types</div>
          <div class="palette-list">
            @for (item of palette; track item.type) {
              <button class="palette-item" (click)="addField(item.type)">
                <mat-icon class="palette-icon">{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
                <mat-icon class="add-icon">add_circle</mat-icon>
              </button>
            }
          </div>
        </mat-card>

        <!-- Right: Canvas -->
        <mat-card class="canvas-card">
          <div class="canvas-title">
            <mat-icon>article</mat-icon> Form Preview
            <span class="field-count">{{ fields().length }} fields</span>
          </div>
          @if (fields().length === 0) {
            <div class="canvas-empty">
              <mat-icon>add_circle_outline</mat-icon>
              <p>Click a field type from the left panel to add it here</p>
            </div>
          }
          <div class="fields-list">
            @for (field of fields(); track field.id; let i = $index) {
              <div class="field-item" [class.editing]="field.editing">
                <div class="field-header">
                  <mat-icon class="field-type-icon">{{ fieldIcon(field.type) }}</mat-icon>
                  @if (field.editing) {
                    <input class="label-input" [(ngModel)]="field.label" placeholder="Field label…" (blur)="field.editing = false" />
                  } @else {
                    <span class="field-label" (click)="field.editing = true">
                      {{ field.label }} <mat-icon class="edit-hint">edit</mat-icon>
                    </span>
                  }
                  <div class="field-actions">
                    <span class="field-type-tag">{{ field.type }}</span>
                    @if (field.required) {
                      <span class="required-star">*</span>
                    }
                    <button class="field-btn" (click)="toggleRequired(field)" [title]="field.required ? 'Required' : 'Optional'">
                      <mat-icon [style.color]="field.required ? '#22c55e' : 'var(--text-muted)'">
                        {{ field.required ? 'check_circle' : 'radio_button_unchecked' }}
                      </mat-icon>
                    </button>
                    <button class="field-btn" (click)="moveUp(i)" [disabled]="i === 0">
                      <mat-icon>arrow_upward</mat-icon>
                    </button>
                    <button class="field-btn" (click)="moveDown(i)" [disabled]="i === fields().length - 1">
                      <mat-icon>arrow_downward</mat-icon>
                    </button>
                    <button class="field-btn danger" (click)="removeField(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
                <!-- Preview render -->
                <div class="field-preview">
                  @switch (field.type) {
                    @case ('text') { <input class="preview-input" [placeholder]="field.placeholder || field.label" disabled /> }
                    @case ('textarea') { <textarea class="preview-textarea" [placeholder]="field.placeholder || field.label" disabled></textarea> }
                    @case ('number') { <input class="preview-input" type="number" [placeholder]="field.label" disabled /> }
                    @case ('date') { <input class="preview-input" type="date" disabled /> }
                    @case ('select') { <select class="preview-select" disabled><option>Select {{ field.label }}…</option></select> }
                    @case ('checkbox') { <label class="preview-check"><input type="checkbox" disabled /> {{ field.label }}</label> }
                    @case ('signature') { <div class="preview-sig"><mat-icon>draw</mat-icon> Signature field</div> }
                  }
                </div>
              </div>
            }
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .header-actions { display:flex; gap:10px; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
    .meta-card { padding:16px 20px !important; }
    .meta-row { display:flex; gap:16px; flex-wrap:wrap; }
    .title-field { flex:2; min-width:220px; }
    .builder-layout { display:grid; grid-template-columns:220px 1fr; gap:16px; align-items:start; }
    .palette-card { padding:16px !important; position:sticky; top:20px; }
    .palette-title { display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:12px; font-family:'Outfit',sans-serif; }
    .palette-title mat-icon { color:#22c55e; font-size:1rem; height:1rem; width:1rem; }
    .palette-list { display:flex; flex-direction:column; gap:4px; }
    .palette-item { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; border:1px solid var(--border-color); background:var(--surface-2); color:var(--text-secondary); font-size:0.8rem; font-weight:500; cursor:pointer; transition:all 0.15s; text-align:left; font-family:'Plus Jakarta Sans',sans-serif; }
    .palette-item:hover { border-color:#22c55e; color:#22c55e; background:rgba(34,197,94,0.06); }
    .palette-icon { font-size:1rem; height:1rem; width:1rem; flex-shrink:0; }
    .add-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; margin-left:auto; opacity:0.4; }
    .palette-item:hover .add-icon { opacity:1; color:#22c55e; }
    .canvas-card { padding:20px !important; min-height:400px; }
    .canvas-title { display:flex; align-items:center; gap:8px; font-size:0.9rem; font-weight:700; color:var(--text-primary); margin-bottom:16px; font-family:'Outfit',sans-serif; }
    .canvas-title mat-icon { color:#22c55e; font-size:1.1rem; height:1.1rem; width:1.1rem; }
    .field-count { margin-left:auto; font-size:0.75rem; background:rgba(34,197,94,0.1); color:#16a34a; padding:2px 8px; border-radius:10px; font-weight:600; }
    .canvas-empty { text-align:center; padding:48px; color:var(--text-muted); }
    .canvas-empty mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.2; display:block; margin:0 auto 12px; }
    .canvas-empty p { margin:0; font-size:0.875rem; }
    .fields-list { display:flex; flex-direction:column; gap:10px; }
    .field-item { border:1px solid var(--border-color); border-radius:10px; overflow:hidden; transition:border-color 0.15s; }
    .field-item.editing { border-color:#22c55e; }
    .field-item:hover { border-color:rgba(34,197,94,0.4); }
    .field-header { display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--surface-2); border-bottom:1px solid var(--border-color); }
    .field-type-icon { font-size:1rem; height:1rem; width:1rem; color:#22c55e; flex-shrink:0; }
    .field-label { font-size:0.875rem; font-weight:600; color:var(--text-primary); flex:1; cursor:pointer; display:flex; align-items:center; gap:4px; }
    .edit-hint { font-size:0.75rem; height:0.75rem; width:0.75rem; opacity:0; transition:opacity 0.1s; }
    .field-label:hover .edit-hint { opacity:0.5; }
    .label-input { font-size:0.875rem; font-weight:600; background:transparent; border:none; border-bottom:1px solid #22c55e; outline:none; flex:1; color:var(--text-primary); font-family:'Plus Jakarta Sans',sans-serif; }
    .field-actions { display:flex; align-items:center; gap:4px; margin-left:auto; flex-shrink:0; }
    .field-type-tag { font-size:0.68rem; background:rgba(34,197,94,0.1); color:#16a34a; padding:1px 6px; border-radius:6px; font-weight:500; }
    .required-star { color:#dc2626; font-weight:700; font-size:1rem; }
    .field-btn { background:none; border:none; cursor:pointer; padding:2px; border-radius:4px; display:flex; align-items:center; color:var(--text-muted); }
    .field-btn:hover { background:rgba(255,255,255,0.06); color:var(--text-primary); }
    .field-btn mat-icon { font-size:0.95rem; height:0.95rem; width:0.95rem; }
    .field-btn.danger:hover { color:#dc2626; }
    .field-btn:disabled { opacity:0.3; cursor:default; }
    .field-preview { padding:10px 14px 12px; }
    .preview-input { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-bg); color:var(--text-muted); font-size:0.875rem; font-family:'Plus Jakarta Sans',sans-serif; box-sizing:border-box; }
    .preview-textarea { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-bg); color:var(--text-muted); font-size:0.875rem; min-height:64px; resize:none; font-family:'Plus Jakarta Sans',sans-serif; box-sizing:border-box; }
    .preview-select { width:100%; padding:7px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--surface-bg); color:var(--text-muted); font-size:0.875rem; font-family:'Plus Jakarta Sans',sans-serif; }
    .preview-check { display:flex; align-items:center; gap:6px; font-size:0.875rem; color:var(--text-secondary); cursor:not-allowed; }
    .preview-sig { display:flex; align-items:center; gap:8px; padding:10px; border:2px dashed var(--border-color); border-radius:8px; color:var(--text-muted); font-size:0.85rem; }
    @media(max-width:768px) { .builder-layout { grid-template-columns:1fr; } .palette-card { position:static; } }
  `],
})
export class FormBuilderComponent {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  formTitle    = '';
  formCategory = 'compliance';
  saving       = signal(false);
  fields       = signal<FormField[]>([]);

  get isEdit(): boolean {
    return !!this.route.snapshot.paramMap.get('id');
  }

  palette: FieldPaletteItem[] = [
    { type: 'text',      label: 'Text Field',   icon: 'short_text' },
    { type: 'textarea',  label: 'Text Area',    icon: 'subject' },
    { type: 'number',    label: 'Number',       icon: 'pin' },
    { type: 'date',      label: 'Date',         icon: 'calendar_today' },
    { type: 'select',    label: 'Dropdown',     icon: 'arrow_drop_down_circle' },
    { type: 'checkbox',  label: 'Checkbox',     icon: 'check_box' },
    { type: 'signature', label: 'Signature',    icon: 'draw' },
  ];

  addField(type: FieldType): void {
    const labelMap: Record<FieldType, string> = {
      text: 'Text Field', textarea: 'Long Text', number: 'Number',
      date: 'Date', select: 'Dropdown', checkbox: 'Checkbox', signature: 'Signature',
    };
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: labelMap[type],
      required: false,
      editing: false,
    };
    this.fields.update(f => [...f, newField]);
  }

  removeField(index: number): void {
    this.fields.update(f => f.filter((_, i) => i !== index));
  }

  toggleRequired(field: FormField): void {
    field.required = !field.required;
    this.fields.update(f => [...f]);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    this.fields.update(f => {
      const arr = [...f];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  moveDown(index: number): void {
    this.fields.update(f => {
      if (index >= f.length - 1) return f;
      const arr = [...f];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  fieldIcon(type: FieldType): string {
    const map: Record<FieldType, string> = {
      text: 'short_text', textarea: 'subject', number: 'pin',
      date: 'calendar_today', select: 'arrow_drop_down_circle', checkbox: 'check_box', signature: 'draw',
    };
    return map[type] ?? 'input';
  }

  save(): void {
    if (!this.formTitle.trim()) { this.notify.error('Please enter a form title.'); return; }
    if (this.fields().length === 0) { this.notify.error('Add at least one field.'); return; }
    this.saving.set(true);
    const payload = {
      title: this.formTitle,
      category: this.formCategory,
      fields: this.fields().map(f => ({ type: f.type, label: f.label, required: f.required })),
    };
    this.api.post('forms/', payload).subscribe({
      next: () => {
        this.notify.success('Form saved successfully.');
        this.saving.set(false);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to save form.'); },
    });
  }
}
