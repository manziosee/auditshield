import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'as-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-wrapper">
      <mat-card class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <span class="auth-logo">🛡️</span>
          <h1>AuditShield</h1>
          <p>Rwanda's SME Compliance Platform</p>
        </div>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              <mat-icon matPrefix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <div class="error-banner">
                <mat-icon>error</mat-icon> {{ errorMessage }}
              </div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="loading || form.invalid"
            >
              @if (loading) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="auth-footer-text">
            New to AuditShield?
            <a routerLink="/auth/register">Register your company</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      padding: 8px;
    }
    .auth-header {
      text-align: center;
      padding: 24px 0 16px;
    }
    .auth-logo { font-size: 3rem; }
    .auth-header h1 { font-size: 1.8rem; font-weight: 700; margin: 8px 0 4px; color: #1e293b; }
    .auth-header p { color: #64748b; font-size: 0.9rem; margin: 0; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; font-weight: 600; margin-top: 8px; }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.875rem;
      margin-bottom: 12px;
    }
    .auth-footer-text {
      text-align: center;
      margin-top: 20px;
      color: #64748b;
      font-size: 0.875rem;
    }
    .auth-footer-text a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  showPassword = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.form.value as { email: string; password: string }).subscribe({
      next: () => {
        this.notify.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.detail?.non_field_errors?.[0] ??
          err?.error?.detail ??
          'Invalid credentials. Please try again.';
      },
    });
  }
}
