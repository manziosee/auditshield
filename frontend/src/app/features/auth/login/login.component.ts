import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'as-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page">

      <!-- ── Left panel — branding ──────────────────────────────────────────── -->
      <div class="panel-left">
        <a routerLink="/landing" class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to home
        </a>

        <div class="brand-block">
          <div class="brand-logo">
            <img src="logo.svg" alt="AuditShield" width="56" height="56" />
          </div>
          <h1>AuditShield</h1>
          <p>The global compliance platform for growing businesses</p>
        </div>

        <!-- Floating stat cards -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(34,197,94,0.2);color:#4ade80">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div>
              <div class="stat-val">94%</div>
              <div class="stat-lbl">Avg. compliance score</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(34,197,94,0.2);color:#22c55e">
              <mat-icon>description</mat-icon>
            </div>
            <div>
              <div class="stat-val">150k+</div>
              <div class="stat-lbl">Documents secured</div>
            </div>
          </div>
        </div>

        <div class="testimonial">
          <blockquote>
            "AuditShield turned a 3-day regulatory audit into a 2-hour walkthrough.
            Every document was exactly where it should be."
          </blockquote>
          <div class="testimonial-author">
            <div class="ta-avatar">RT</div>
            <div>
              <div class="ta-name">Rachel Torres</div>
              <div class="ta-title">CFO · Pacific Fresh Foods Ltd</div>
            </div>
          </div>
        </div>

        <div class="left-chips">
          <span class="lchip"><mat-icon>lock</mat-icon>AES-256 encrypted</span>
          <span class="lchip"><mat-icon>public</mat-icon>Multi-jurisdiction</span>
          <span class="lchip"><mat-icon>cloud_done</mat-icon>Daily backups</span>
        </div>
      </div>

      <!-- ── Right panel — form ─────────────────────────────────────────────── -->
      <div class="panel-right">
        <div class="form-card">

          <!-- Header -->
          <div class="form-header">
            <div class="form-header-icon">
              <mat-icon>lock_open</mat-icon>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your AuditShield account</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field-group">

              <!-- Email field -->
              <div class="field-wrap">
                <label class="field-label">Email address</label>
                <div class="field-input-wrap">
                  <mat-icon class="field-icon">mail_outline</mat-icon>
                  <input
                    class="field-input"
                    type="email"
                    placeholder="you@company.com"
                    formControlName="email"
                    autocomplete="email"
                  />
                </div>
              </div>

              <!-- Password field -->
              <div class="field-wrap">
                <label class="field-label">Password</label>
                <div class="field-input-wrap">
                  <mat-icon class="field-icon">lock_outline</mat-icon>
                  <input
                    class="field-input"
                    [type]="showPw() ? 'text' : 'password'"
                    placeholder="••••••••"
                    formControlName="password"
                    autocomplete="current-password"
                  />
                  <button type="button" class="toggle-pw" (click)="showPw.set(!showPw())">
                    <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </div>

            </div>

            <div class="field-meta">
              <label class="remember-wrap">
                <input type="checkbox" />
                <span class="remember-label">Remember me</span>
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            @if (errorMessage) {
              <div class="error-msg">
                <mat-icon>error_outline</mat-icon>
                {{ errorMessage }}
              </div>
            }

            <button type="submit" class="btn-submit" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="18"></mat-spinner> Signing in...
              } @else {
                <mat-icon>login</mat-icon> Sign in to AuditShield
              }
            </button>
          </form>

          <div class="form-footer">
            <p>Don't have an account? <a routerLink="/auth/register">Register your company</a></p>
          </div>

          <div class="trust-row">
            <div class="trust-item"><mat-icon>lock</mat-icon>256-bit encryption</div>
            <div class="trust-item"><mat-icon>shield</mat-icon>SOC 2 compliant</div>
            <div class="trust-item"><mat-icon>cloud_done</mat-icon>Daily backups</div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* PAGE LAYOUT */
    .page {
      display: flex; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif;
      background: #070c08;
    }

    /* LEFT PANEL */
    .panel-left {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      padding: 60px 64px;
      background: linear-gradient(160deg, #070c08 0%, #0d1a10 40%, #0a1f12 70%, #081508 100%);
      position: relative; overflow: hidden;
    }
    .panel-left::before {
      content: ''; position: absolute;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 65%);
      top: -150px; left: -150px; pointer-events: none;
    }
    .panel-left::after {
      content: ''; position: absolute;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%);
      bottom: -100px; right: -100px; pointer-events: none;
    }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.45); text-decoration: none;
      font-size: 13px; font-weight: 500; margin-bottom: 48px;
      transition: color 0.2s;
    }
    .back-link:hover { color: #4ade80; }
    .back-link mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .brand-block { margin-bottom: 48px; }
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
      font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin: 0 0 10px; letter-spacing: -0.5px;
    }
    .brand-block p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.6; margin: 0; }

    /* STAT CARDS */
    .stat-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .stat-card {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 14px 18px;
      backdrop-filter: blur(8px);
      transition: border-color 0.2s, background 0.2s;
    }
    .stat-card:hover { background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.2); }
    .stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .stat-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .stat-val { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: #fff; }
    .stat-lbl { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 2px; }

    /* TESTIMONIAL */
    .testimonial {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-left: 3px solid #22c55e;
      border-radius: 14px; padding: 20px 24px; margin-bottom: 24px;
    }
    .testimonial blockquote {
      color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.7;
      margin: 0 0 16px; font-style: italic;
    }
    .testimonial-author { display: flex; align-items: center; gap: 10px; }
    .ta-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .ta-name { font-size: 13px; font-weight: 600; color: #fff; }
    .ta-title { font-size: 11px; color: rgba(255,255,255,0.4); }

    .left-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .lchip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; padding: 5px 12px 5px 8px;
      color: rgba(255,255,255,0.55); font-size: 12px;
    }
    .lchip mat-icon { font-size: 13px; width: 13px; height: 13px; color: #22c55e; }

    /* RIGHT PANEL */
    .panel-right {
      width: 520px; display: flex; align-items: center; justify-content: center;
      padding: 40px 48px;
      background: #0d1610;
      border-left: 1px solid rgba(255,255,255,0.06);
    }

    /* FORM CARD */
    .form-card { width: 100%; max-width: 420px; }

    .form-header { text-align: center; margin-bottom: 32px; }
    .form-header-icon {
      width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px;
      background: linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.05));
      border: 1px solid rgba(34,197,94,0.35);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 32px rgba(34,197,94,0.2);
    }
    .form-header-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: #4ade80; }
    .form-header h2 {
      font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 700;
      color: #fff; margin: 0 0 6px; letter-spacing: -0.3px;
    }
    .form-header p { color: rgba(255,255,255,0.45); font-size: 14px; margin: 0; }

    /* FORM FIELDS */
    .field-group { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }

    .field-wrap { position: relative; }
    .field-label {
      display: block; font-size: 12px; font-weight: 600;
      color: rgba(255,255,255,0.5); letter-spacing: 0.5px; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .field-input-wrap { position: relative; }
    .field-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: rgba(255,255,255,0.3); font-size: 18px; width: 18px; height: 18px;
      pointer-events: none; z-index: 1;
    }
    .field-input {
      width: 100%; padding: 14px 44px;
      background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #fff; font-size: 15px; font-family: inherit;
      outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .field-input:focus {
      border-color: #22c55e; background: rgba(34,197,94,0.06);
      box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
    }
    .field-input::placeholder { color: rgba(255,255,255,0.25); }
    .field-input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 100px #0d1f12 inset !important;
      -webkit-text-fill-color: #fff !important;
    }
    .toggle-pw {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.35); padding: 4px; line-height: 0;
      transition: color 0.2s;
    }
    .toggle-pw:hover { color: #4ade80; }
    .toggle-pw mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .field-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .remember-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .remember-wrap input[type=checkbox] { width: 16px; height: 16px; accent-color: #22c55e; cursor: pointer; }
    .remember-label { font-size: 13px; color: rgba(255,255,255,0.5); }
    .forgot-link { font-size: 13px; color: #4ade80; text-decoration: none; font-weight: 500; }
    .forgot-link:hover { color: #86efac; }

    /* SUBMIT BUTTON */
    .btn-submit {
      width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #fff; font-size: 15px; font-weight: 700; font-family: 'Outfit', sans-serif;
      letter-spacing: 0.3px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
      box-shadow: 0 4px 20px rgba(34,197,94,0.35);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 28px rgba(34,197,94,0.45);
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-submit mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ERROR */
    .error-msg {
      display: flex; align-items: center; gap: 8px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      border-radius: 10px; padding: 12px 14px; color: #f87171; font-size: 13px;
      margin-bottom: 16px;
    }
    .error-msg mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }

    /* DIVIDER + FOOTER */
    .form-divider {
      display: flex; align-items: center; gap: 12px; margin: 20px 0;
    }
    .form-divider span { font-size: 12px; color: rgba(255,255,255,0.25); white-space: nowrap; }
    .form-divider::before, .form-divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1);
    }
    .form-footer { text-align: center; margin-top: 20px; }
    .form-footer p { color: rgba(255,255,255,0.4); font-size: 13px; margin: 0; }
    .form-footer a { color: #4ade80; text-decoration: none; font-weight: 600; }
    .form-footer a:hover { color: #86efac; }

    /* TRUST BADGE */
    .trust-row {
      display: flex; justify-content: center; gap: 20px; margin-top: 24px; flex-wrap: wrap;
    }
    .trust-item {
      display: flex; align-items: center; gap: 5px;
      color: rgba(255,255,255,0.3); font-size: 11px;
    }
    .trust-item mat-icon { font-size: 13px; width: 13px; height: 13px; color: rgba(34,197,94,0.6); }

    @media (max-width: 900px) {
      .panel-left { display: none; }
      .panel-right { width: 100%; padding: 32px 24px; }
    }
  `],
})
export class LoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly fb     = inject(FormBuilder);

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading  = signal(false);
  readonly showPw   = signal(false);
  errorMessage      = '';
  emailFocused      = false;
  pwFocused         = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage = '';

    const { email, password } = this.form.value as { email: string; password: string };

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notify.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage =
          err?.error?.detail?.non_field_errors?.[0] ??
          err?.error?.detail ??
          'Invalid credentials. Please try again.';
      },
    });
  }
}
