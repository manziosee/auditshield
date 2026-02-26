import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

const COMPANY_TYPES = [
  { value: 'sme',           label: 'Small & Medium Enterprise' },
  { value: 'ngo',           label: 'NGO / Non-profit' },
  { value: 'accounting',    label: 'Accounting Firm' },
  { value: 'hr_consultancy',label: 'HR Consultancy' },
  { value: 'other',         label: 'Other' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
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
                    @for (c of countries; track c.code) {
                      <option [value]="c.code">{{ c.name }}</option>
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
    /* ── Page ───────────────────────────────────────────────────────────────── */
    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       LEFT PANEL
    ═══════════════════════════════════════════════════════════════════════════ */
    .panel-left {
      background: linear-gradient(145deg, #060c18 0%, #0d1525 45%, #1a1060 100%);
      padding: 40px 44px;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .panel-left::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse 500px 400px at 110% 60%, rgba(99,102,241,0.2), transparent);
      pointer-events: none;
    }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.4); font-size: 0.82rem; text-decoration: none;
      transition: color 0.15s; position: relative; z-index: 1;
    }
    .back-link:hover { color: rgba(255,255,255,0.85); text-decoration: none; }
    .back-link mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .brand-block {
      padding: 32px 0 28px; position: relative; z-index: 1;
    }
    .brand-logo {
      width: 56px; height: 56px; border-radius: 14px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px; padding: 8px;
    }
    .brand-logo img { width: 40px; height: 40px; }
    .brand-block h1 {
      font-size: 2.2rem; font-weight: 900; color: white;
      margin: 0 0 10px; letter-spacing: -1px;
    }
    .brand-block p { font-size: 0.9rem; color: rgba(255,255,255,0.5); line-height: 1.7; margin: 0; }

    /* Benefits */
    .benefits-list { display: flex; flex-direction: column; gap: 14px; flex: 1; position: relative; z-index: 1; padding-bottom: 24px; }
    .benefit-item { display: flex; align-items: flex-start; gap: 14px; }
    .benefit-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .benefit-icon mat-icon { font-size: 1.2rem; }
    .benefit-title { font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 2px; }
    .benefit-desc  { font-size: 0.75rem; color: rgba(255,255,255,0.45); line-height: 1.5; }

    .trust-row {
      display: flex; flex-wrap: wrap; gap: 10px; position: relative; z-index: 1;
    }
    .trust-item {
      display: flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.45);
      font-size: 0.72rem; padding: 5px 10px; border-radius: 999px;
    }
    .trust-item mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; color: #818cf8; }

    /* ═══════════════════════════════════════════════════════════════════════════
       RIGHT PANEL
    ═══════════════════════════════════════════════════════════════════════════ */
    .panel-right {
      background: var(--surface-bg);
      display: flex; align-items: center; justify-content: center;
      padding: 40px 32px;
      overflow-y: auto;
    }
    .form-card {
      width: 100%; max-width: 480px;
      background: var(--surface-card);
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.08);
      border: 1px solid var(--border-color);
    }

    /* Steps indicator */
    .steps-indicator {
      display: flex; align-items: center;
      margin-bottom: 8px;
    }
    .step-dot {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 700;
      background: var(--surface-hover);
      color: var(--text-muted);
      border: 2px solid var(--border-color);
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .step-dot.active {
      background: var(--brand); color: white;
      border-color: var(--brand);
      box-shadow: 0 0 0 4px var(--brand-subtle);
    }
    .step-dot.done {
      background: rgba(34,197,94,0.12); color: #22c55e;
      border-color: #22c55e;
    }
    .step-dot mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .step-line {
      flex: 1; height: 2px; background: var(--border-color);
      margin: 0 8px; transition: background 0.2s;
    }
    .step-line.done { background: #22c55e; }
    .step-labels {
      display: flex; justify-content: space-between;
      margin-bottom: 24px;
    }
    .step-labels span { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }
    .step-labels .active-label { color: var(--brand); font-weight: 700; }

    .form-header { margin-bottom: 24px; }
    .form-header h2 {
      font-size: 1.4rem; font-weight: 800;
      color: var(--text-primary);
      margin: 0 0 6px; letter-spacing: -0.5px;
    }
    .form-header p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

    /* Fields */
    .field-group { margin-bottom: 14px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 600;
      color: var(--text-secondary); margin-bottom: 5px;
    }
    .req { color: var(--danger); }
    .optional { font-size: 0.7rem; color: var(--text-faint); font-weight: 400; }

    .input-wrap, .select-wrap {
      display: flex; align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      background: var(--surface-input);
      transition: border-color 0.15s, box-shadow 0.15s;
      overflow: hidden;
    }
    .input-wrap:focus-within, .select-wrap:focus-within {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-subtle);
      background: var(--surface-card);
    }
    .input-wrap.input-error, .select-wrap.input-error { border-color: var(--danger); }

    .input-icon {
      color: var(--text-faint); font-size: 1rem; width: 1rem; height: 1rem;
      padding: 0 4px 0 10px; flex-shrink: 0;
    }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      background: transparent; padding: 11px 10px;
      font-size: 0.875rem; color: var(--text-primary); font-family: inherit;
    }
    .input-wrap input::placeholder { color: var(--text-faint); }

    .select-wrap select {
      flex: 1; border: none; outline: none;
      background: transparent; padding: 11px 4px;
      font-size: 0.875rem; color: var(--text-primary);
      font-family: inherit; cursor: pointer;
      appearance: none; -webkit-appearance: none;
    }
    .select-wrap select option { background: var(--surface-card); color: var(--text-primary); }
    .select-chevron {
      color: var(--text-faint) !important; font-size: 1.1rem !important;
      width: 1.1rem !important; height: 1.1rem !important;
      padding-right: 8px; pointer-events: none;
    }

    .eye-btn {
      background: none; border: none; cursor: pointer;
      color: var(--text-faint); padding: 0 10px;
      display: flex; align-items: center; transition: color 0.15s;
    }
    .eye-btn:hover { color: var(--brand); }
    .eye-btn mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .field-error {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.72rem; color: var(--danger); margin-top: 4px;
    }
    .field-error mat-icon { font-size: 0.8rem; width: 0.8rem; height: 0.8rem; }

    .error-alert {
      display: flex; align-items: center; gap: 8px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      color: var(--danger); border-radius: 10px;
      padding: 10px 14px; font-size: 0.82rem; margin-bottom: 14px;
    }
    .error-alert mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; flex-shrink: 0; }

    .submit-btn {
      width: 100%; height: 48px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: white; border: none; border-radius: 12px;
      font-size: 0.92rem; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 4px 16px var(--brand-glow);
      margin-top: 8px; font-family: inherit;
    }
    .submit-btn:hover:not(:disabled) {
      opacity: 0.92; transform: translateY(-1px);
      box-shadow: 0 8px 24px var(--brand-glow);
    }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .submit-btn mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    .submit-btn--flex { flex: 1; width: auto; }

    .step2-actions { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .back-btn {
      display: flex; align-items: center; gap: 5px;
      background: var(--surface-hover); color: var(--text-secondary);
      border: 1.5px solid var(--border-color); border-radius: 12px;
      height: 48px; padding: 0 16px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: background 0.15s, border-color 0.15s; font-family: inherit;
    }
    .back-btn:hover { background: var(--border-color); border-color: var(--text-faint); }
    .back-btn mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .signin-link { text-align: center; margin: 20px 0 0; font-size: 0.82rem; color: var(--text-muted); }
    .signin-link a { color: var(--brand); font-weight: 700; text-decoration: none; }
    .signin-link a:hover { text-decoration: underline; }

    /* ══════════════════════════════════════════════════════════════════════════
       ANIMATIONS & INTERACTIONS
    ══════════════════════════════════════════════════════════════════════════ */

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes shimmer {
      0%   { left: -100%; }
      60%  { left: 160%;  }
      100% { left: 160%;  }
    }
    @keyframes benefitIn {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0);     }
    }
    @keyframes orbDrift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      40%       { transform: translate(-55px, 65px) scale(1.15); }
      70%       { transform: translate(45px, -25px) scale(0.88); }
    }
    @keyframes logoPulse {
      0%, 100% { box-shadow: 0 0 0 0   rgba(99,102,241,0);    }
      50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0.12); }
    }
    @keyframes stepPop {
      0%   { transform: scale(1);    }
      50%  { transform: scale(1.22); }
      100% { transform: scale(1);    }
    }

    /* ── Animated orb in left panel ──────────────────────────────────────── */
    .panel-left::after {
      content: ''; position: absolute;
      width: 340px; height: 340px; border-radius: 50%;
      background: radial-gradient(circle, rgba(99,102,241,0.13), transparent 70%);
      bottom: -80px; right: -100px;
      animation: orbDrift 12s ease-in-out infinite;
      pointer-events: none;
    }

    /* ── Form card ───────────────────────────────────────────────────────── */
    .form-card {
      animation: slideUpFade 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease;
    }
    .form-card:hover {
      transform: translateY(-9px) scale(1.01);
      box-shadow: 0 28px 72px rgba(0,0,0,0.12), 0 0 0 1.5px color-mix(in srgb, var(--brand) 28%, transparent);
    }

    /* ── Brand logo ──────────────────────────────────────────────────────── */
    .brand-logo {
      animation: logoPulse 3.5s ease-in-out infinite;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s;
    }
    .brand-logo:hover {
      transform: scale(1.12) rotate(8deg);
      border-color: rgba(165,180,252,0.5);
      animation-play-state: paused;
    }

    /* ── Benefits: staggered slide-in ────────────────────────────────────── */
    .benefit-item:nth-child(1) { animation: benefitIn 0.4s ease-out 0.15s both; }
    .benefit-item:nth-child(2) { animation: benefitIn 0.4s ease-out 0.28s both; }
    .benefit-item:nth-child(3) { animation: benefitIn 0.4s ease-out 0.41s both; }
    .benefit-item:nth-child(4) { animation: benefitIn 0.4s ease-out 0.54s both; }
    .benefit-item { transition: transform 0.25s ease; }
    .benefit-item:hover { transform: translateX(6px); }
    .benefit-icon { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .benefit-item:hover .benefit-icon { transform: scale(1.18) rotate(-8deg); }
    .benefit-title { transition: color 0.2s; }
    .benefit-item:hover .benefit-title { color: rgba(255,255,255,0.98); }

    /* ── Trust items ─────────────────────────────────────────────────────── */
    .trust-item { transition: all 0.22s ease; }
    .trust-item:hover {
      background: rgba(255,255,255,0.09) !important;
      border-color: rgba(165,180,252,0.22) !important;
      color: rgba(255,255,255,0.72) !important;
      transform: translateY(-3px) scale(1.04);
    }

    /* ── Step dots: pop on active ────────────────────────────────────────── */
    .step-dot { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .step-dot.active { animation: stepPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .step-line { transition: background 0.4s ease; }

    /* ── Input / select: hover glow ──────────────────────────────────────── */
    .input-wrap, .select-wrap { transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
    .input-wrap:hover:not(.input-error):not(:focus-within),
    .select-wrap:hover:not(.input-error):not(:focus-within) {
      border-color: color-mix(in srgb, var(--brand) 55%, var(--border-color));
      background: var(--surface-card);
    }
    .input-icon { transition: color 0.2s, transform 0.2s; }
    .input-wrap:focus-within .input-icon,
    .select-wrap:focus-within .input-icon {
      color: var(--brand) !important;
      transform: scale(1.12) rotate(-5deg);
    }

    /* ── Submit button: shimmer sweep ────────────────────────────────────── */
    .submit-btn { position: relative; overflow: hidden; }
    .submit-btn::before {
      content: ''; position: absolute; top: 0; left: -100%;
      width: 55%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
      animation: shimmer 2.8s ease-in-out infinite;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.015) !important;
      box-shadow: 0 14px 36px var(--brand-glow) !important;
    }
    .submit-btn:active:not(:disabled) {
      transform: translateY(0) scale(0.98) !important;
      transition: transform 0.1s;
    }

    /* ── Back button ─────────────────────────────────────────────────────── */
    .back-btn { transition: all 0.22s ease !important; }
    .back-btn:hover {
      transform: translateX(-4px) !important;
      border-color: var(--brand) !important;
      color: var(--brand) !important;
      background: var(--brand-subtle) !important;
    }

    /* ── Sign-in link ─────────────────────────────────────────────────────── */
    .signin-link a { transition: letter-spacing 0.2s; }
    .signin-link a:hover { letter-spacing: 0.01em; text-decoration: none !important; }

    /* ── Responsive ─────────────────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .panel-left { display: none; }
      .panel-right { padding: 24px 16px; align-items: flex-start; padding-top: 40px; }
    }
    @media (max-width: 480px) {
      .two-col { grid-template-columns: 1fr; }
    }
  `],
})
export class RegisterComponent {
  private readonly api    = inject(ApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly fb     = inject(FormBuilder);

  readonly currentStep = signal(1);

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
    admin_password:   ['', [Validators.required, Validators.minLength(10)]],
  });

  loading      = false;
  showPassword = false;
  errorMessage = '';

  readonly companyTypes = COMPANY_TYPES;
  readonly countries    = COUNTRIES;

  readonly benefits = [
    { icon: 'folder_special',    title: 'Secure Document Vault',    desc: 'AES-256 encrypted storage for all HR and compliance documents.', bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
    { icon: 'checklist_rtl',     title: 'Compliance Checklists',    desc: 'Real-time tracking of regulatory filings and deadlines.', bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    { icon: 'notifications_active', title: 'Smart Deadline Alerts', desc: 'Get notified weeks before expiry — never miss a filing.', bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
    { icon: 'description',       title: 'One-Click Audit Reports',  desc: 'Generate PDF audit packs for inspectors in seconds.',    bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
  ];

  nextStep(): void {
    if (this.companyForm.valid) this.currentStep.set(2);
    else this.companyForm.markAllAsTouched();
  }

  submit(): void {
    if (this.companyForm.invalid || this.adminForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const payload = { ...this.companyForm.value, ...this.adminForm.value };
    this.api.post('companies/onboard/', payload).subscribe({
      next: () => {
        this.notify.success('Company registered! Please log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail ?? 'Registration failed. Please try again.';
      },
    });
  }
}
