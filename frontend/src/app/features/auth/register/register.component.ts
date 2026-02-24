import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'as-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatStepperModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-wrapper">
      <mat-card class="register-card">
        <div class="auth-header">
          <span class="auth-logo">🛡️</span>
          <h1>Register Your Company</h1>
          <p>Join Rwanda's compliance platform</p>
        </div>

        <mat-stepper [linear]="true" #stepper orientation="horizontal">
          <!-- Step 1: Company Info -->
          <mat-step [stepControl]="companyForm" label="Company">
            <form [formGroup]="companyForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Name</mat-label>
                <input matInput formControlName="company_name" />
                <mat-icon matPrefix>business</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Type</mat-label>
                <mat-select formControlName="company_type">
                  <mat-option value="sme">Small & Medium Enterprise</mat-option>
                  <mat-option value="ngo">NGO</mat-option>
                  <mat-option value="accounting">Accounting Firm</mat-option>
                  <mat-option value="hr_consultancy">HR Consultancy</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Email</mat-label>
                <input matInput type="email" formControlName="company_email" />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Phone</mat-label>
                <input matInput formControlName="company_phone" placeholder="+250 7XX XXX XXX" />
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>RRA TIN Number (optional)</mat-label>
                <input matInput formControlName="tin_number" />
              </mat-form-field>

              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext [disabled]="companyForm.invalid">
                  Next <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Admin User -->
          <mat-step [stepControl]="adminForm" label="Admin Account">
            <form [formGroup]="adminForm">
              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="admin_first_name" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="admin_last_name" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Admin Email</mat-label>
                <input matInput type="email" formControlName="admin_email" />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password (min 10 characters)</mat-label>
                <input matInput type="password" formControlName="admin_password" />
                <mat-icon matPrefix>lock</mat-icon>
              </mat-form-field>

              @if (errorMessage) {
                <div class="error-banner"><mat-icon>error</mat-icon> {{ errorMessage }}</div>
              }

              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button
                  mat-raised-button color="primary"
                  [disabled]="adminForm.invalid || loading"
                  (click)="submit()"
                >
                  @if (loading) { <mat-spinner diameter="20" /> } @else { Create Account }
                </button>
              </div>
            </form>
          </mat-step>
        </mat-stepper>

        <p class="auth-footer-text">
          Already registered? <a routerLink="/auth/login">Sign in</a>
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px; }
    .register-card { width: 100%; max-width: 540px; border-radius: 16px; padding: 8px; }
    .auth-header { text-align: center; padding: 24px 0 16px; }
    .auth-logo { font-size: 3rem; }
    .auth-header h1 { font-size: 1.6rem; font-weight: 700; margin: 8px 0 4px; }
    .auth-header p { color: #64748b; margin: 0; font-size: 0.9rem; }
    .full-width { width: 100%; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .step-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .error-banner { display: flex; align-items: center; gap: 8px; background: #fef2f2; color: #dc2626; border-radius: 8px; padding: 10px 14px; font-size: 0.875rem; margin-bottom: 12px; }
    .auth-footer-text { text-align: center; margin-top: 20px; color: #64748b; font-size: 0.875rem; padding-bottom: 16px; }
    .auth-footer-text a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  `],
})
export class RegisterComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly companyForm = this.fb.group({
    company_name: ['', Validators.required],
    company_type: ['sme', Validators.required],
    company_email: ['', [Validators.required, Validators.email]],
    company_phone: ['', Validators.required],
    tin_number: [''],
  });

  readonly adminForm = this.fb.group({
    admin_first_name: ['', Validators.required],
    admin_last_name: ['', Validators.required],
    admin_email: ['', [Validators.required, Validators.email]],
    admin_password: ['', [Validators.required, Validators.minLength(10)]],
  });

  loading = false;
  errorMessage = '';

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
