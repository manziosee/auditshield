import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompanyService } from '../../../core/services/company.service';
import { GeoService } from '../../../core/services/geo.service';
import { NotificationService } from '../../../core/services/notification.service';

const COMPANY_TYPES = [
  { value: 'sme',           label: 'Small & Medium Enterprise' },
  { value: 'ngo',           label: 'NGO / Non-profit' },
  { value: 'accounting',    label: 'Accounting Firm' },
  { value: 'hr_consultancy',label: 'HR Consultancy' },
  { value: 'other',         label: 'Other' },
];

@Component({
  selector: 'as-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page">

      <!-- ── Left panel — always dark ──────────────────────────────────────── -->
      <div class="panel-left">
        <a routerLink="/landing" class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to home
        </a>

        <div class="brand-block">
          <div class="brand-logo">
            <img src="logo.svg" alt="AuditShield" width="44" height="44" />
          </div>
          <h1>AuditShield</h1>
          <p>Set up your company compliance workspace in minutes</p>
        </div>

        <!-- What you get list -->
        <div class="benefits-list">
          @for (b of benefits; track b.title) {
            <div class="benefit-item">
              <div class="benefit-icon" [style.background]="b.bg" [style.color]="b.color">
                <mat-icon>{{ b.icon }}</mat-icon>
              </div>
              <div>
                <div class="benefit-title">{{ b.title }}</div>
                <div class="benefit-desc">{{ b.desc }}</div>
              </div>
            </div>
          }
        </div>

        <div class="trust-row">
          <div class="trust-item"><mat-icon>lock</mat-icon>AES-256 encrypted</div>
          <div class="trust-item"><mat-icon>verified</mat-icon>ISO-ready audit trail</div>
          <div class="trust-item"><mat-icon>cloud_done</mat-icon>99.9% uptime</div>
        </div>
      </div>

      <!-- ── Right panel — theme-aware ─────────────────────────────────────── -->
      <div class="panel-right">
        <div class="form-card">

          <!-- Step indicator -->
          <div class="steps-indicator">
            <div class="step-dot" [class.active]="currentStep() === 1" [class.done]="currentStep() > 1">
              @if (currentStep() > 1) { <mat-icon>check</mat-icon> } @else { 1 }
            </div>
            <div class="step-line" [class.done]="currentStep() > 1"></div>
            <div class="step-dot" [class.active]="currentStep() === 2" [class.done]="currentStep() > 2">
              @if (currentStep() > 2) { <mat-icon>check</mat-icon> } @else { 2 }
            </div>
          </div>
          <div class="step-labels">
            <span [class.active-label]="currentStep() === 1">Company Info</span>
            <span [class.active-label]="currentStep() === 2">Admin Account</span>
          </div>

          <!-- Form header -->
          <div class="form-header">
            <h2>
              @if (currentStep() === 1) { Tell us about your company }
              @else { Create your admin account }
            </h2>
            <p>
              @if (currentStep() === 1) { Step 1 of 2 — Basic company information }
              @else { Step 2 of 2 — The admin who manages everything }
            </p>
          </div>

          <!-- ── STEP 1: Company ────────────────────────────────────────────── -->
          @if (currentStep() === 1) {
            <form [formGroup]="companyForm" (ngSubmit)="nextStep()">

              <div class="field-group">
                <label class="field-label">Company Name <span class="req">*</span></label>
                <div class="input-wrap" [class.input-error]="companyForm.get('company_name')?.invalid && companyForm.get('company_name')?.touched">
                  <mat-icon class="input-icon">business</mat-icon>
                  <input type="text" formControlName="company_name" placeholder="Acme Corp Ltd" />
                </div>
                @if (companyForm.get('company_name')?.invalid && companyForm.get('company_name')?.touched) {
                  <span class="field-error"><mat-icon>error_outline</mat-icon> Company name is required</span>
                }
              </div>

              <div class="field-group">
                <label class="field-label">Company Type <span class="req">*</span></label>
                <div class="select-wrap" [class.input-error]="companyForm.get('company_type')?.invalid && companyForm.get('company_type')?.touched">
                  <mat-icon class="input-icon">category</mat-icon>
                  <select formControlName="company_type">
                    @for (t of companyTypes; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>
                  <mat-icon class="select-chevron">expand_more</mat-icon>
                </div>
              </div>

              <div class="two-col">
                <div class="field-group">
                  <label class="field-label">Company Email <span class="req">*</span></label>
                  <div class="input-wrap" [class.input-error]="companyForm.get('company_email')?.invalid && companyForm.get('company_email')?.touched">
                    <mat-icon class="input-icon">email</mat-icon>
                    <input type="email" formControlName="company_email" placeholder="info@company.com" />
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Phone Number <span class="req">*</span></label>
                  <div class="input-wrap" [class.input-error]="companyForm.get('company_phone')?.invalid && companyForm.get('company_phone')?.touched">
                    <mat-icon class="input-icon">phone</mat-icon>
                    <input type="tel" formControlName="company_phone" placeholder="+1 555 000 0000" />
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Country <span class="req">*</span></label>
                <div class="select-wrap" [class.input-error]="companyForm.get('country')?.invalid && companyForm.get('country')?.touched">
                  <mat-icon class="input-icon">public</mat-icon>
                  <select formControlName="country">
                    <option value="" disabled>Select your country</option>
                    @for (c of countries(); track c.id) {
                      <option [value]="c.id">{{ c.flag_emoji }} {{ c.name }}</option>
                    }
                  </select>
                  <mat-icon class="select-chevron">expand_more</mat-icon>
                </div>
                @if (companyForm.get('country')?.invalid && companyForm.get('country')?.touched) {
                  <span class="field-error"><mat-icon>error_outline</mat-icon> Country is required</span>
                }
              </div>

              <div class="field-group">
                <label class="field-label">Tax Identifier <span class="optional">(optional)</span></label>
                <div class="input-wrap">
                  <mat-icon class="input-icon">receipt_long</mat-icon>
                  <input type="text" formControlName="tax_identifier" placeholder="e.g. TIN / EIN / VAT number" />
                </div>
              </div>

              <button type="submit" class="submit-btn" [disabled]="companyForm.invalid">
                Continue <mat-icon>arrow_forward</mat-icon>
              </button>
            </form>
          }

          <!-- ── STEP 2: Admin account ──────────────────────────────────────── -->
          @if (currentStep() === 2) {
            <form [formGroup]="adminForm" (ngSubmit)="submit()">

              <div class="two-col">
                <div class="field-group">
                  <label class="field-label">First Name <span class="req">*</span></label>
                  <div class="input-wrap" [class.input-error]="adminForm.get('admin_first_name')?.invalid && adminForm.get('admin_first_name')?.touched">
                    <mat-icon class="input-icon">person</mat-icon>
                    <input type="text" formControlName="admin_first_name" placeholder="Alex" />
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Last Name <span class="req">*</span></label>
                  <div class="input-wrap" [class.input-error]="adminForm.get('admin_last_name')?.invalid && adminForm.get('admin_last_name')?.touched">
                    <mat-icon class="input-icon">person</mat-icon>
                    <input type="text" formControlName="admin_last_name" placeholder="Johnson" />
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Admin Email <span class="req">*</span></label>
                <div class="input-wrap" [class.input-error]="adminForm.get('admin_email')?.invalid && adminForm.get('admin_email')?.touched">
                  <mat-icon class="input-icon">email</mat-icon>
                  <input type="email" formControlName="admin_email" placeholder="admin@company.com" />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Password <span class="req">*</span></label>
                <div class="input-wrap" [class.input-error]="adminForm.get('admin_password')?.invalid && adminForm.get('admin_password')?.touched">
                  <mat-icon class="input-icon">lock</mat-icon>
                  <input [type]="showPassword ? 'text' : 'password'" formControlName="admin_password" placeholder="Min. 10 characters" />
                  <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                    <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (adminForm.get('admin_password')?.hasError('minlength') && adminForm.get('admin_password')?.touched) {
                  <span class="field-error"><mat-icon>error_outline</mat-icon> Must be at least 10 characters</span>
                }
              </div>

              @if (errorMessage) {
                <div class="error-alert">
                  <mat-icon>error_outline</mat-icon> {{ errorMessage }}
                </div>
              }

              <div class="step2-actions">
                <button type="button" class="back-btn" (click)="currentStep.set(1)">
                  <mat-icon>arrow_back</mat-icon> Back
                </button>
                <button type="submit" class="submit-btn submit-btn--flex" [disabled]="adminForm.invalid || loading">
                  @if (loading) { <mat-spinner diameter="20" /> <span>Creating…</span> }
                  @else { <mat-icon>rocket_launch</mat-icon> <span>Create Account</span> }
                </button>
              </div>
            </form>
          }

          <p class="signin-link">
            Already have an account? <a routerLink="/auth/login">Sign in →</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* PAGE */
    .page {
      min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
      background: #070c08; font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* LEFT PANEL */
    .panel-left {
      background: linear-gradient(160deg, #070c08 0%, #0d1a10 40%, #0a1f12 70%, #081508 100%);
      padding: 40px 48px; display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .panel-left::before {
      content: ''; position: absolute;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%);
      top: -150px; left: -150px; pointer-events: none;
    }
    .panel-left::after {
      content: ''; position: absolute;
      width: 360px; height: 360px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%);
      bottom: -80px; right: -80px; pointer-events: none;
    }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.45); text-decoration: none;
      font-size: 13px; font-weight: 500; margin-bottom: 32px;
      transition: color 0.2s; position: relative; z-index: 1;
    }
    .back-link:hover { color: #4ade80; }
    .back-link mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .brand-block { margin-bottom: 32px; position: relative; z-index: 1; }
    .brand-logo {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05));
      border: 1px solid rgba(34,197,94,0.3);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 0 24px rgba(34,197,94,0.15);
    }
    .brand-logo img { filter: drop-shadow(0 0 8px rgba(34,197,94,0.4)); }
    .brand-block h1 {
      font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 800;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin: 0 0 8px; letter-spacing: -0.5px;
    }
    .brand-block p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; }

    .benefits-list { display: flex; flex-direction: column; gap: 14px; flex: 1; position: relative; z-index: 1; padding-bottom: 24px; }
    .benefit-item { display: flex; align-items: flex-start; gap: 14px; }
    .benefit-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .benefit-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .benefit-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .benefit-desc  { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

    .trust-row {
      display: flex; flex-wrap: wrap; gap: 10px; position: relative; z-index: 1;
    }
    .trust-item {
      display: flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.45); font-size: 12px; padding: 5px 10px; border-radius: 20px;
    }
    .trust-item mat-icon { font-size: 13px; width: 13px; height: 13px; color: #22c55e; }

    /* RIGHT PANEL */
    .panel-right {
      background: #0d1610; display: flex; align-items: center; justify-content: center;
      padding: 40px 32px; overflow-y: auto;
      border-left: 1px solid rgba(255,255,255,0.06);
    }
    .form-card {
      width: 100%; max-width: 480px;
      background: transparent;
    }

    /* STEP INDICATOR */
    .steps-indicator { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 8px; }
    .step-dot {
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif;
      border: 2px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.35);
      background: transparent; transition: all 0.3s ease; position: relative; z-index: 1;
    }
    .step-dot.active { background: #22c55e; border-color: #22c55e; color: #fff; box-shadow: 0 0 16px rgba(34,197,94,0.4); }
    .step-dot.done { background: rgba(34,197,94,0.15); border-color: #22c55e; color: #22c55e; }
    .step-dot.done mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .step-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); max-width: 48px; }
    .step-line.done { background: linear-gradient(90deg, #22c55e, rgba(34,197,94,0.3)); }
    .step-labels {
      display: flex; justify-content: space-around;
      font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 24px; font-weight: 500;
    }
    .active-label { color: #22c55e !important; font-weight: 700; }

    .form-header { margin-bottom: 24px; }
    .form-header h2 {
      font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700;
      color: #fff; margin: 0 0 6px; letter-spacing: -0.3px;
    }
    .form-header p { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; }

    /* FIELDS */
    .field-group { margin-bottom: 14px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
    .req { color: #ef4444; }
    .optional { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 400; text-transform: none; }

    .input-wrap, .select-wrap {
      display: flex; align-items: center;
      border: 1.5px solid rgba(255,255,255,0.1); border-radius: 12px;
      background: rgba(255,255,255,0.05);
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      overflow: hidden; height: 50px;
    }
    .input-wrap:focus-within, .select-wrap:focus-within {
      border-color: #22c55e; background: rgba(34,197,94,0.06);
      box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
    }
    .input-wrap.input-error, .select-wrap.input-error { border-color: #ef4444; }

    .input-icon {
      color: rgba(255,255,255,0.3); font-size: 18px; width: 18px; height: 18px;
      padding: 0 4px 0 12px; flex-shrink: 0;
    }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      background: transparent; padding: 11px 10px;
      font-size: 14px; color: #fff; font-family: inherit;
    }
    .input-wrap input::placeholder { color: rgba(255,255,255,0.25); }
    .input-wrap input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d1f12 inset !important; -webkit-text-fill-color: #fff !important; }

    .select-wrap select {
      flex: 1; border: none; outline: none;
      background: transparent; padding: 11px 4px;
      font-size: 14px; color: #fff; font-family: inherit;
      cursor: pointer; appearance: none; -webkit-appearance: none;
    }
    .select-wrap select option { background: #0d1610; color: #fff; }
    .select-chevron {
      color: rgba(255,255,255,0.3) !important; font-size: 18px !important;
      width: 18px !important; height: 18px !important;
      padding-right: 8px; pointer-events: none;
    }

    .eye-btn {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.35); padding: 0 10px;
      display: flex; align-items: center; transition: color 0.15s;
    }
    .eye-btn:hover { color: #4ade80; }
    .eye-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .field-error {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: #f87171; margin-top: 4px;
    }
    .field-error mat-icon { font-size: 13px; width: 13px; height: 13px; }

    .error-alert {
      display: flex; align-items: center; gap: 8px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      color: #f87171; border-radius: 10px;
      padding: 12px 14px; font-size: 13px; margin-bottom: 14px;
    }
    .error-alert mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }

    .submit-btn {
      width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #fff; font-size: 15px; font-weight: 700; font-family: 'Outfit', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px rgba(34,197,94,0.35); margin-top: 8px;
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(34,197,94,0.45); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .submit-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .submit-btn--flex { flex: 1; width: auto; }

    .step2-actions { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .back-btn {
      display: flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      height: 50px; padding: 0 16px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: background 0.2s; font-family: inherit;
    }
    .back-btn:hover { background: rgba(255,255,255,0.1); }
    .back-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .signin-link { text-align: center; margin: 20px 0 0; font-size: 13px; color: rgba(255,255,255,0.4); }
    .signin-link a { color: #4ade80; font-weight: 600; text-decoration: none; }
    .signin-link a:hover { color: #86efac; }

    @keyframes stepPop {
      0%   { transform: scale(1);    }
      50%  { transform: scale(1.18); }
      100% { transform: scale(1);    }
    }
    .step-dot.active { animation: stepPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .panel-left { display: none; }
      .panel-right { padding: 24px 16px; border-left: none; }
    }
    @media (max-width: 480px) {
      .two-col { grid-template-columns: 1fr; }
    }
  `],
})
export class RegisterComponent {
  private readonly company = inject(CompanyService);
  private readonly geo     = inject(GeoService);
  private readonly router  = inject(Router);
  private readonly notify  = inject(NotificationService);
  private readonly fb      = inject(FormBuilder);

  readonly currentStep = signal(1);
  readonly countries   = signal<any[]>([]);

  readonly companyForm = this.fb.group({
    company_name:   ['', Validators.required],
    company_type:   ['sme', Validators.required],
    company_email:  ['', [Validators.required, Validators.email]],
    company_phone:  ['', Validators.required],
    country:        ['', Validators.required],
    tax_identifier: [''],
  });

  readonly adminForm = this.fb.group({
    admin_first_name: ['', Validators.required],
    admin_last_name:  ['', Validators.required],
    admin_email:      ['', [Validators.required, Validators.email]],
    admin_password:   ['', [Validators.required, Validators.minLength(8)]],
  });

  loading      = false;
  showPassword = false;
  errorMessage = '';

  readonly companyTypes = COMPANY_TYPES;

  constructor() {
    this.loadCountries();
  }

  loadCountries(): void {
    this.geo.listCountries({ page_size: 250 }).subscribe({
      next: (res) => {
        console.log('Countries loaded:', res.results?.length);
        this.countries.set(res.results || []);
      },
      error: (err) => {
        console.error('Failed to load countries:', err);
        this.countries.set([]);
      }
    });
  }

  readonly benefits = [
    { icon: 'folder_special',    title: 'Secure Document Vault',    desc: 'AES-256 encrypted storage for all HR and compliance documents.', bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
    { icon: 'checklist_rtl',     title: 'Compliance Checklists',    desc: 'Real-time tracking of regulatory filings and deadlines.', bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    { icon: 'notifications_active', title: 'Smart Deadline Alerts', desc: 'Get notified weeks before expiry — never miss a filing.', bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
    { icon: 'description',       title: 'One-Click Audit Reports',  desc: 'Generate PDF audit packs for inspectors in seconds.',    bg: 'rgba(10,10,10,0.12)',   color: '#1c1f26' },
  ];

  nextStep(): void {
    if (this.companyForm.valid) this.currentStep.set(2);
    else this.companyForm.markAllAsTouched();
  }

  submit(): void {
    if (this.companyForm.invalid || this.adminForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const selectedCountry = this.countries().find(c => c.id === this.companyForm.value.country);

    const payload = {
      company_name: this.companyForm.value.company_name,
      company_type: this.companyForm.value.company_type,
      company_email: this.companyForm.value.company_email,
      company_phone: this.companyForm.value.company_phone,
      country_iso: selectedCountry?.iso_code || '',
      tax_identifier: this.companyForm.value.tax_identifier || '',
      ...this.adminForm.value
    };
    
    this.company.onboard(payload as any).subscribe({
      next: (res) => {
        this.notify.success('Company registered! Please log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        const errorDetail = err?.error?.detail || err?.error?.message;
        const fieldErrors = err?.error ? Object.entries(err.error)
          .filter(([key]) => !['detail', 'message'].includes(key))
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('; ') : '';
        this.errorMessage = errorDetail || fieldErrors || 'Registration failed. Please try again.';
      },
    });
  }
}
