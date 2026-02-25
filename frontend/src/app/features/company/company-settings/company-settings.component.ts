import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Company {
  id: string;
  name: string;
  registration_number: string;
  tin_number: string;
  rssb_number: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  country: string;
  logo: string | null;
  fiscal_year_start: number;
  employee_count?: number;
}

@Component({
  selector: 'as-company-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule, MatTabsModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Company Settings</h2>
          <p class="subtitle">Manage your organisation profile and compliance identifiers</p>
        </div>
        @if (saving()) {
          <mat-spinner diameter="24" />
        }
      </div>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="48" /></div>
      } @else {
        <mat-tab-group>
          <!-- Profile tab -->
          <mat-tab label="Profile">
            <div class="tab-content">
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <mat-card>
                  <mat-card-header>
                    <mat-icon mat-card-avatar>business</mat-icon>
                    <mat-card-title>Organisation Info</mat-card-title>
                    <mat-card-subtitle>Basic company details</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="form-grid">
                      <mat-form-field appearance="outline" class="full-col">
                        <mat-label>Company Name *</mat-label>
                        <input matInput formControlName="name" />
                        @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                          <mat-error>Required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Industry</mat-label>
                        <mat-select formControlName="industry">
                          <mat-option value="retail">Retail</mat-option>
                          <mat-option value="manufacturing">Manufacturing</mat-option>
                          <mat-option value="services">Professional Services</mat-option>
                          <mat-option value="hospitality">Hospitality</mat-option>
                          <mat-option value="construction">Construction</mat-option>
                          <mat-option value="agriculture">Agriculture</mat-option>
                          <mat-option value="technology">Technology</mat-option>
                          <mat-option value="healthcare">Healthcare</mat-option>
                          <mat-option value="education">Education</mat-option>
                          <mat-option value="financial">Financial Services</mat-option>
                          <mat-option value="ngo">NGO / Non-profit</mat-option>
                          <mat-option value="other">Other</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Fiscal Year Start (month)</mat-label>
                        <mat-select formControlName="fiscal_year_start">
                          @for (m of months; track m.value) {
                            <mat-option [value]="m.value">{{ m.label }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Phone</mat-label>
                        <input matInput formControlName="phone" placeholder="+250 xxx xxx xxx" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput formControlName="email" type="email" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Website</mat-label>
                        <input matInput formControlName="website" placeholder="https://" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-col">
                        <mat-label>Address</mat-label>
                        <input matInput formControlName="address" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>City</mat-label>
                        <input matInput formControlName="city" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Country</mat-label>
                        <input matInput formControlName="country" />
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || saving()">
                      Save Profile
                    </button>
                  </mat-card-actions>
                </mat-card>
              </form>
            </div>
          </mat-tab>

          <!-- Statutory tab -->
          <mat-tab label="Statutory IDs">
            <div class="tab-content">
              <form [formGroup]="statutoryForm" (ngSubmit)="saveStatutory()">
                <mat-card>
                  <mat-card-header>
                    <mat-icon mat-card-avatar>badge</mat-icon>
                    <mat-card-title>Regulatory Identifiers</mat-card-title>
                    <mat-card-subtitle>Used in tax filings and compliance reports</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>RDB Registration Number</mat-label>
                        <input matInput formControlName="registration_number" class="mono-input" placeholder="RDB/COMP/000000" />
                        <mat-hint>Rwanda Development Board company number</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>TIN Number (RRA)</mat-label>
                        <input matInput formControlName="tin_number" class="mono-input" placeholder="100000000" />
                        <mat-hint>Rwanda Revenue Authority TIN</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>RSSB Employer Number</mat-label>
                        <input matInput formControlName="rssb_number" class="mono-input" placeholder="RSSB/000000" />
                        <mat-hint>Social Security employer registration</mat-hint>
                      </mat-form-field>
                    </div>

                    <div class="info-banner">
                      <mat-icon>info</mat-icon>
                      <p>These identifiers are embedded in generated PDF reports and compliance filings. Keep them accurate.</p>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                      Save Statutory IDs
                    </button>
                  </mat-card-actions>
                </mat-card>
              </form>
            </div>
          </mat-tab>

          <!-- Danger zone -->
          <mat-tab label="Danger Zone">
            <div class="tab-content">
              <mat-card class="danger-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="danger-icon">warning</mat-icon>
                  <mat-card-title>Danger Zone</mat-card-title>
                  <mat-card-subtitle>Irreversible actions — proceed with caution</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="danger-item">
                    <div>
                      <p class="danger-title">Export All Data</p>
                      <p class="danger-desc">Download a full export of all your company data in JSON format.</p>
                    </div>
                    <button mat-stroked-button (click)="exportData()">
                      <mat-icon>download</mat-icon> Export
                    </button>
                  </div>
                  <mat-divider style="margin:16px 0" />
                  <div class="danger-item">
                    <div>
                      <p class="danger-title">Delete Company Account</p>
                      <p class="danger-desc">Permanently delete all company data, employees, documents, and reports. This cannot be undone.</p>
                    </div>
                    <button mat-raised-button color="warn" (click)="deleteAccount()">
                      <mat-icon>delete_forever</mat-icon> Delete Account
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }
    .tab-content { padding-top:20px; display:flex; flex-direction:column; gap:20px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
    .full-col { grid-column:1/-1; }
    .mono-input { font-family:monospace; }
    mat-card-actions { display:flex; justify-content:flex-end; padding:16px !important; }
    .info-banner { display:flex; gap:10px; background:#f0f9ff; border-radius:8px; padding:12px 16px; margin-top:8px; }
    .info-banner mat-icon { color:#0284c7; flex-shrink:0; }
    .info-banner p { margin:0; font-size:0.875rem; color:#0c4a6e; }
    .danger-card { border:1px solid #fee2e2 !important; }
    .danger-icon { color:#dc2626; }
    .danger-item { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:8px 0; }
    .danger-title { margin:0 0 4px; font-weight:600; font-size:0.875rem; color:#1e293b; }
    .danger-desc { margin:0; font-size:0.8rem; color:#64748b; }
    @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} .danger-item{flex-direction:column;align-items:flex-start;} }
  `],
})
export class CompanySettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  loading = signal(false);
  saving = signal(false);

  readonly months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  readonly profileForm = this.fb.group({
    name: ['', Validators.required],
    industry: [''],
    fiscal_year_start: [1],
    phone: [''],
    email: [''],
    website: [''],
    address: [''],
    city: [''],
    country: ['Rwanda'],
  });

  readonly statutoryForm = this.fb.group({
    registration_number: [''],
    tin_number: [''],
    rssb_number: [''],
  });

  private companyId = '';

  ngOnInit(): void {
    this.loading.set(true);
    this.api.get<Company>('companies/me/').subscribe({
      next: (c) => {
        this.companyId = c.id;
        this.profileForm.patchValue({
          name: c.name, industry: c.industry,
          fiscal_year_start: c.fiscal_year_start,
          phone: c.phone, email: c.email, website: c.website,
          address: c.address, city: c.city, country: c.country,
        });
        this.statutoryForm.patchValue({
          registration_number: c.registration_number,
          tin_number: c.tin_number, rssb_number: c.rssb_number,
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load company settings.'); },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.patch<Company>(`companies/${this.companyId}/`, this.profileForm.value).subscribe({
      next: () => { this.saving.set(false); this.notify.success('Company profile saved.'); },
      error: (err) => { this.saving.set(false); this.notify.error(err?.error?.detail ?? 'Save failed.'); },
    });
  }

  saveStatutory(): void {
    this.saving.set(true);
    this.api.patch<Company>(`companies/${this.companyId}/`, this.statutoryForm.value).subscribe({
      next: () => { this.saving.set(false); this.notify.success('Statutory IDs saved.'); },
      error: (err) => { this.saving.set(false); this.notify.error(err?.error?.detail ?? 'Save failed.'); },
    });
  }

  exportData(): void {
    this.api.downloadBlob('companies/export/').subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'company-export.json'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Export failed.'),
    });
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to DELETE this company account?\n\n' +
      'This will permanently delete ALL data including employees, documents, and reports.\n\n' +
      'Type "DELETE" to confirm:'
    );
    if (!confirmed) return;
    this.notify.warn('Account deletion requires contacting support for final confirmation.');
  }
}
