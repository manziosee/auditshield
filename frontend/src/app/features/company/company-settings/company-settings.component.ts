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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Company {
  id: string;
  name: string;
  registration_number: string;
  tax_identifier: string;
  social_security_identifier: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string | null;
  timezone: string;
  logo: string | null;
  fiscal_year_start: number;
  preferred_currency: string;
  employee_count?: number;
}

interface CurrencyOption { code: string; name: string; symbol: string; flag: string; }

@Component({
  selector: 'as-company-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule, MatTabsModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Company Settings</h2>
          <p class="subtitle">Manage your organisation profile, compliance identifiers, and preferences</p>
        </div>
        @if (saving()) {
          <mat-spinner diameter="24" />
        }
      </div>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="48" /></div>
      } @else {
        <mat-tab-group>

          <!-- ── Profile tab ─────────────────────────────────────────────────── -->
          <mat-tab label="Profile">
            <div class="tab-content">
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <mat-card>
                  <mat-card-header>
                    <mat-icon mat-card-avatar>business</mat-icon>
                    <mat-card-title>Organisation Info</mat-card-title>
                    <mat-card-subtitle>Basic company details visible on all reports</mat-card-subtitle>
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
                        <mat-icon matPrefix>phone</mat-icon>
                        <input matInput formControlName="phone" placeholder="+1 555 000 0000" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <mat-icon matPrefix>email</mat-icon>
                        <input matInput formControlName="email" type="email" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Website</mat-label>
                        <mat-icon matPrefix>language</mat-icon>
                        <input matInput formControlName="website" placeholder="https://" />
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-col">
                        <mat-label>Street Address</mat-label>
                        <mat-icon matPrefix>location_on</mat-icon>
                        <input matInput formControlName="address" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>City</mat-label>
                        <input matInput formControlName="city" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>State / Province</mat-label>
                        <input matInput formControlName="state_province" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Postal Code</mat-label>
                        <input matInput formControlName="postal_code" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Country</mat-label>
                        <input matInput formControlName="country" />
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- ── Currency Card ───────────────────────────────────────── -->
                <mat-card class="currency-card">
                  <mat-card-header>
                    <mat-icon mat-card-avatar>currency_exchange</mat-icon>
                    <mat-card-title>Currency &amp; Finance</mat-card-title>
                    <mat-card-subtitle>Default currency used in payroll, reports, and exports</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="currency-grid">
                      <mat-form-field appearance="outline" class="currency-field">
                        <mat-label>Preferred Currency</mat-label>
                        <mat-select formControlName="preferred_currency">
                          @for (c of currencies; track c.code) {
                            <mat-option [value]="c.code">
                              <span class="currency-opt">
                                <span class="currency-flag">{{ c.flag }}</span>
                                <span class="currency-code-label">{{ c.code }}</span>
                                <span class="currency-name-label">{{ c.name }}</span>
                                <span class="currency-symbol-label">{{ c.symbol }}</span>
                              </span>
                            </mat-option>
                          }
                        </mat-select>
                        <mat-hint>Used in payslips, reports, and data exports</mat-hint>
                      </mat-form-field>

                      @if (selectedCurrency()) {
                        <div class="currency-preview">
                          <div class="currency-preview-flag">{{ selectedCurrency()!.flag }}</div>
                          <div class="currency-preview-body">
                            <div class="currency-preview-code">{{ selectedCurrency()!.code }}</div>
                            <div class="currency-preview-name">{{ selectedCurrency()!.name }}</div>
                            <div class="currency-preview-symbol">Symbol: {{ selectedCurrency()!.symbol }}</div>
                          </div>
                        </div>
                      }
                    </div>

                    <div class="info-banner">
                      <mat-icon>info</mat-icon>
                      <p>The selected currency is used as the default for new employees and reports. Individual employee records can override this with a different currency if needed.</p>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || saving()">
                      <mat-icon>save</mat-icon> Save Profile &amp; Currency
                    </button>
                  </mat-card-actions>
                </mat-card>
              </form>
            </div>
          </mat-tab>

          <!-- ── Statutory tab ───────────────────────────────────────────────── -->
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
                        <mat-label>Business Registration Number</mat-label>
                        <input matInput formControlName="registration_number" class="mono-input" placeholder="e.g. COMP/000000" />
                        <mat-hint>Company registration number from your national business registry</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Tax Identification Number (TIN / EIN / UTR)</mat-label>
                        <input matInput formControlName="tax_identifier" class="mono-input" placeholder="e.g. 100000000" />
                        <mat-hint>Tax number issued by your national tax authority</mat-hint>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-col">
                        <mat-label>Social Security Employer Number</mat-label>
                        <input matInput formControlName="social_security_identifier" class="mono-input" placeholder="e.g. SS/000000" />
                        <mat-hint>Employer registration for national social security / pension authority</mat-hint>
                      </mat-form-field>
                    </div>

                    <div class="info-banner">
                      <mat-icon>info</mat-icon>
                      <p>These identifiers are embedded in generated PDF reports and compliance filings. Keep them accurate and up to date.</p>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                      <mat-icon>save</mat-icon> Save Statutory IDs
                    </button>
                  </mat-card-actions>
                </mat-card>
              </form>
            </div>
          </mat-tab>

          <!-- ── Danger Zone tab ────────────────────────────────────────────── -->
          <mat-tab label="Danger Zone">
            <div class="tab-content">

              <!-- Export -->
              <mat-card class="action-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="export-icon">cloud_download</mat-icon>
                  <mat-card-title>Export Company Data</mat-card-title>
                  <mat-card-subtitle>Download a full archive of all your company data</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="action-row">
                    <div class="action-text">
                      <p class="action-desc">
                        Downloads a JSON file containing all employees, documents metadata, compliance records,
                        and audit logs. File can be used for data migration or backup purposes.
                      </p>
                      <div class="action-tags">
                        <span class="tag"><mat-icon>group</mat-icon> Employees</span>
                        <span class="tag"><mat-icon>folder</mat-icon> Documents</span>
                        <span class="tag"><mat-icon>checklist</mat-icon> Compliance</span>
                        <span class="tag"><mat-icon>history</mat-icon> Audit Logs</span>
                      </div>
                    </div>
                    <button mat-stroked-button class="export-btn" (click)="exportData()" [disabled]="saving()">
                      <mat-icon>download</mat-icon> Export All Data
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Delete -->
              <mat-card class="danger-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar class="danger-icon">warning</mat-icon>
                  <mat-card-title class="danger-title-main">Delete Company Account</mat-card-title>
                  <mat-card-subtitle class="danger-subtitle">This action is permanent and cannot be reversed</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="danger-warning-box">
                    <mat-icon>error_outline</mat-icon>
                    <div>
                      <p class="danger-warn-title">Permanent Data Deletion</p>
                      <p class="danger-warn-body">
                        Deleting this account will permanently remove all company data including employees,
                        documents, payroll records, compliance items, and reports.
                        <strong>This cannot be undone.</strong>
                      </p>
                    </div>
                  </div>
                  <div class="danger-checklist">
                    <div class="danger-check-item"><mat-icon>close</mat-icon> All employee records and contracts</div>
                    <div class="danger-check-item"><mat-icon>close</mat-icon> All uploaded documents and files</div>
                    <div class="danger-check-item"><mat-icon>close</mat-icon> All compliance checklists and reports</div>
                    <div class="danger-check-item"><mat-icon>close</mat-icon> All audit trail entries</div>
                    <div class="danger-check-item"><mat-icon>close</mat-icon> All user accounts associated with this company</div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="warn" (click)="deleteAccount()">
                    <mat-icon>delete_forever</mat-icon> Delete Company Account
                  </button>
                </mat-card-actions>
              </mat-card>

            </div>
          </mat-tab>

        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }

    /* ── Header ─────────────────────────────────────────────────────────────── */
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; color:var(--text-primary); }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }

    /* ── Tab content ─────────────────────────────────────────────────────────── */
    .tab-content { padding-top:20px; display:flex; flex-direction:column; gap:20px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
    .full-col { grid-column:1/-1; }
    .mono-input { font-family:monospace; letter-spacing:0.05em; }
    mat-card-actions { display:flex; justify-content:flex-end; padding:16px !important; }

    /* ── Info banner ─────────────────────────────────────────────────────────── */
    .info-banner {
      display:flex; gap:10px;
      background:var(--info-bg);
      border:1px solid color-mix(in srgb, var(--info) 25%, transparent);
      border-radius:10px; padding:12px 16px; margin-top:16px;
    }
    .info-banner mat-icon { color:var(--info); flex-shrink:0; margin-top:1px; }
    .info-banner p { margin:0; font-size:0.875rem; color:var(--text-primary); line-height:1.5; }

    /* ── Currency card ───────────────────────────────────────────────────────── */
    .currency-card { margin-top:0; }
    .currency-grid { display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
    .currency-field { flex:1; min-width:280px; }
    .currency-opt { display:flex; align-items:center; gap:8px; }
    .currency-flag { font-size:1.2rem; line-height:1; }
    .currency-code-label { font-weight:700; font-size:0.875rem; color:var(--text-primary); min-width:36px; }
    .currency-name-label { font-size:0.82rem; color:var(--text-muted); flex:1; }
    .currency-symbol-label { font-size:0.8rem; color:var(--text-faint); font-family:monospace; }

    .currency-preview {
      display:flex; align-items:center; gap:14px;
      background:var(--surface-hover);
      border:1px solid var(--border-color);
      border-radius:12px; padding:14px 18px;
      min-width:200px;
    }
    .currency-preview-flag { font-size:2.5rem; line-height:1; }
    .currency-preview-code { font-size:1.3rem; font-weight:800; color:var(--text-primary); letter-spacing:-0.01em; }
    .currency-preview-name { font-size:0.8rem; color:var(--text-muted); margin-top:2px; }
    .currency-preview-symbol { font-size:0.72rem; color:var(--text-faint); font-family:monospace; margin-top:4px; }

    /* ── Export card ─────────────────────────────────────────────────────────── */
    .action-card { border-top:3px solid var(--info) !important; }
    .export-icon { color:var(--info); }
    .action-row { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; flex-wrap:wrap; }
    .action-text { flex:1; }
    .action-desc { margin:0 0 14px; font-size:0.875rem; color:var(--text-muted); line-height:1.6; }
    .action-tags { display:flex; gap:8px; flex-wrap:wrap; }
    .tag {
      display:inline-flex; align-items:center; gap:4px;
      background:var(--surface-hover); color:var(--text-muted);
      border:1px solid var(--border-color);
      border-radius:999px; padding:4px 10px; font-size:0.72rem; font-weight:600;
    }
    .tag mat-icon { font-size:0.85rem; width:0.85rem; height:0.85rem; }
    .export-btn {
      color:var(--info) !important;
      border-color:var(--info) !important;
      white-space:nowrap; flex-shrink:0;
    }

    /* ── Danger zone ─────────────────────────────────────────────────────────── */
    .danger-card { border:1px solid color-mix(in srgb, var(--danger) 30%, transparent) !important; border-top:3px solid var(--danger) !important; }
    .danger-icon { color:var(--danger); }
    .danger-title-main { color:var(--text-primary) !important; }
    .danger-subtitle { color:var(--text-muted) !important; }

    .danger-warning-box {
      display:flex; gap:14px;
      background:var(--danger-bg);
      border:1px solid color-mix(in srgb, var(--danger) 25%, transparent);
      border-radius:10px; padding:14px 18px; margin-bottom:16px;
    }
    .danger-warning-box mat-icon { color:var(--danger); flex-shrink:0; font-size:1.4rem; margin-top:2px; }
    .danger-warn-title { margin:0 0 4px; font-weight:700; font-size:0.9rem; color:var(--danger); }
    .danger-warn-body { margin:0; font-size:0.8rem; color:var(--text-primary); line-height:1.5; }
    .danger-warn-body strong { color:var(--danger); }

    .danger-checklist { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
    .danger-check-item {
      display:flex; align-items:center; gap:8px;
      font-size:0.82rem; color:var(--text-muted); padding:4px 0;
    }
    .danger-check-item mat-icon { font-size:1rem; width:1rem; height:1rem; color:var(--danger); }

    @media(max-width:600px) {
      .form-grid { grid-template-columns:1fr; }
      .action-row { flex-direction:column; }
      .currency-grid { flex-direction:column; }
    }
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

  readonly currencies: CurrencyOption[] = [
    { code: 'USD', name: 'US Dollar',          symbol: '$',     flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro',               symbol: '€',     flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound',      symbol: '£',     flag: '🇬🇧' },
    { code: 'RWF', name: 'Rwandan Franc',      symbol: 'RF',    flag: '🇷🇼' },
    { code: 'KES', name: 'Kenyan Shilling',    symbol: 'KSh',   flag: '🇰🇪' },
    { code: 'UGX', name: 'Ugandan Shilling',   symbol: 'USh',   flag: '🇺🇬' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh',   flag: '🇹🇿' },
    { code: 'NGN', name: 'Nigerian Naira',     symbol: '₦',     flag: '🇳🇬' },
    { code: 'GHS', name: 'Ghanaian Cedi',      symbol: 'GH₵',   flag: '🇬🇭' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R',     flag: '🇿🇦' },
    { code: 'ETB', name: 'Ethiopian Birr',     symbol: 'Br',    flag: '🇪🇹' },
    { code: 'EGP', name: 'Egyptian Pound',     symbol: 'E£',    flag: '🇪🇬' },
    { code: 'MAD', name: 'Moroccan Dirham',    symbol: 'د.م.',  flag: '🇲🇦' },
    { code: 'XOF', name: 'West African CFA',   symbol: 'CFA',   flag: '🌍' },
    { code: 'CAD', name: 'Canadian Dollar',    symbol: 'CA$',   flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$',    flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc',        symbol: 'Fr',    flag: '🇨🇭' },
    { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',     flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',     flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee',       symbol: '₹',     flag: '🇮🇳' },
    { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ',   flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal',        symbol: '﷼',     flag: '🇸🇦' },
    { code: 'BRL', name: 'Brazilian Real',     symbol: 'R$',    flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso',       symbol: 'MX$',   flag: '🇲🇽' },
    { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$',    flag: '🇸🇬' },
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
    state_province: [''],
    postal_code: [''],
    country: [''],
    timezone: [''],
    preferred_currency: ['USD'],
  });

  readonly statutoryForm = this.fb.group({
    registration_number: [''],
    tax_identifier: [''],
    social_security_identifier: [''],
  });

  private companyId = '';

  selectedCurrency() {
    const code = this.profileForm.get('preferred_currency')?.value;
    return this.currencies.find(c => c.code === code) ?? null;
  }

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
          state_province: c.state_province, postal_code: c.postal_code,
          preferred_currency: c.preferred_currency || 'USD',
        });
        this.statutoryForm.patchValue({
          registration_number: c.registration_number,
          tax_identifier: c.tax_identifier,
          social_security_identifier: c.social_security_identifier,
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
    this.saving.set(true);
    this.api.downloadBlob('companies/export/').subscribe({
      next: (blob) => {
        this.saving.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'company-export.json'; a.click();
        URL.revokeObjectURL(url);
        this.notify.success('Export downloaded successfully.');
      },
      error: () => { this.saving.set(false); this.notify.error('Export failed.'); },
    });
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to DELETE this company account?\n\n' +
      'This will permanently delete ALL data including employees, documents, and reports.\n\n' +
      'This action CANNOT be undone. Proceed?'
    );
    if (!confirmed) return;
    this.notify.warn('Account deletion requires contacting support for final confirmation. Please email support@auditshield.io with your request.');
  }
}
