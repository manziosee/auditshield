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
              <label class="field-label">Email address</label>
              <div class="input-wrap"
                [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched"
                [class.input-focused]="emailFocused">
                <mat-icon class="input-icon">email</mat-icon>
                <input
                  type="email" formControlName="email"
                  placeholder="you@company.com" autocomplete="email"
                  (focus)="emailFocused=true" (blur)="emailFocused=false"
                />
              </div>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <span class="field-error"><mat-icon>error_outline</mat-icon>Email is required</span>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <span class="field-error"><mat-icon>error_outline</mat-icon>Enter a valid email</span>
              }
            </div>

            <div class="field-group">
              <div class="label-row">
                <label class="field-label">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-wrap"
                [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched"
                [class.input-focused]="pwFocused">
                <mat-icon class="input-icon">lock</mat-icon>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••" autocomplete="current-password"
                  (focus)="pwFocused=true" (blur)="pwFocused=false"
                />
                <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <span class="field-error"><mat-icon>error_outline</mat-icon>Password is required</span>
              }
            </div>

            @if (errorMessage) {
              <div class="error-alert">
                <mat-icon>error_outline</mat-icon>
                {{ errorMessage }}
              </div>
            }

            <button type="submit" class="submit-btn" [class.loading]="loading()" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" />
                <span>Signing in…</span>
              } @else {
                <mat-icon>login</mat-icon>
                <span>Sign In</span>
              }
            </button>
          </form>

          <p class="register-link">
            Don't have an account?
            <a routerLink="/auth/register">Register your company →</a>
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Page layout ────────────────────────────────────────────────────────── */
    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       LEFT PANEL — always dark
    ═══════════════════════════════════════════════════════════════════════════ */
    .panel-left {
      background: linear-gradient(135deg, #030a04 0%, #071a0c 50%, #0a0a0a 100%);
      padding: 40px 48px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .panel-left::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 500px 400px at 110% 70%, rgba(34,197,94,0.2), transparent),
        radial-gradient(ellipse 300px 200px at -10% 20%, rgba(34,197,94,0.1), transparent);
      pointer-events: none;
    }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.4);
      font-size: 0.82rem; text-decoration: none;
      transition: color 0.15s; position: relative; z-index: 1;
    }
    .back-link:hover { color: rgba(255,255,255,0.85); text-decoration: none; }
    .back-link mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .brand-block {
      flex: 1; display: flex; flex-direction: column;
      justify-content: center; position: relative; z-index: 1;
    }
    .brand-logo {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.12));
      border: 1px solid rgba(74,222,128,0.3);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px; padding: 12px;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.08), 0 8px 24px rgba(34,197,94,0.15);
      animation: logoPulse 3.5s ease-in-out infinite;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s;
    }
    .brand-logo img {
      width: 44px; height: 44px;
      filter: drop-shadow(0 0 8px rgba(34,197,94,0.8)) brightness(1.4) saturate(1.8);
    }
    .brand-block h1 {
      font-size: 3rem; font-weight: 900;
      margin: 0 0 14px; letter-spacing: -2px; line-height: 1;
      background: linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #4ade80 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .brand-block p {
      font-size: 1rem; color: rgba(255,255,255,0.5);
      max-width: 320px; line-height: 1.7; margin: 0;
    }

    /* Stat cards */
    .stat-cards {
      display: flex; gap: 12px; margin-bottom: 24px;
      position: relative; z-index: 1;
    }
    .stat-card {
      flex: 1; display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 14px;
    }
    .stat-icon {
      width: 38px; height: 38px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .stat-icon mat-icon { font-size: 1.2rem; }
    .stat-val { font-size: 1.1rem; font-weight: 800; color: white; line-height: 1; }
    .stat-lbl { font-size: 0.68rem; color: rgba(255,255,255,0.4); margin-top: 2px; }

    .testimonial {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 22px 24px;
      margin-bottom: 24px; position: relative; z-index: 1;
    }
    .testimonial blockquote {
      margin: 0 0 16px;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.7; font-style: italic;
    }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .ta-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #052e16; font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ta-name  { font-size: 0.82rem; font-weight: 700; color: white; }
    .ta-title { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 1px; }

    .left-chips { display: flex; flex-wrap: wrap; gap: 8px; position: relative; z-index: 1; }
    .lchip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.45);
      font-size: 0.75rem; padding: 5px 12px; border-radius: 999px;
    }
    .lchip mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; color: #22c55e; }

    /* ═══════════════════════════════════════════════════════════════════════════
       RIGHT PANEL — theme-aware
    ═══════════════════════════════════════════════════════════════════════════ */
    .panel-right {
      background: var(--surface-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
    }
    .form-card {
      width: 100%; max-width: 460px;
      background: var(--surface-card);
      border-radius: 28px;
      padding: 44px 40px 36px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px var(--border-color);
      border-top: 3px solid #22c55e;
      position: relative; overflow: hidden;
      animation: slideUpFade 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .form-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse 300px 200px at 100% 0%, rgba(34,197,94,0.05), transparent);
      pointer-events: none;
    }

    /* Header */
    .form-header { margin-bottom: 24px; text-align: center; }
    .form-header-icon {
      width: 60px; height: 60px; border-radius: 18px;
      background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08));
      color: #22c55e;
      border: 1px solid rgba(34,197,94,0.25);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 4px 16px rgba(34,197,94,0.15);
    }
    .form-header-icon mat-icon { font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    .form-header h2 {
      font-size: 1.75rem; font-weight: 900;
      color: var(--text-primary);
      margin: 0 0 6px; letter-spacing: -0.04em;
      font-family: 'Outfit', sans-serif;
    }
    .form-header p { font-size: 0.875rem; color: var(--text-muted); margin: 0; }

    /* Fields */
    .field-group { margin-bottom: 16px; }
    .field-label {
      display: block; font-size: 0.8rem; font-weight: 600;
      color: var(--text-secondary); margin-bottom: 6px;
    }
    .label-row {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 6px;
    }
    .forgot-link { font-size: 0.78rem; color: var(--brand); text-decoration: none; }
    .forgot-link:hover { text-decoration: underline; }

    .input-wrap {
      display: flex; align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: 14px;
      background: var(--surface-input);
      transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
      overflow: hidden;
      height: 52px;
    }
    .input-wrap.input-focused {
      border-color: #22c55e;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.10);
      background: var(--surface-card);
    }
    .input-wrap.input-error { border-color: var(--danger); }
    .input-wrap.input-error.input-focused { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

    .input-icon {
      color: var(--text-faint);
      font-size: 1.1rem; width: 1.1rem; height: 1.1rem;
      padding: 0 4px 0 12px; flex-shrink: 0;
    }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      background: transparent;
      padding: 12px;
      font-size: 0.875rem;
      color: var(--text-primary);
      font-family: inherit;
    }
    .input-wrap input::placeholder { color: var(--text-faint); }

    .eye-btn {
      background: none; border: none; cursor: pointer;
      color: var(--text-faint); padding: 0 12px;
      display: flex; align-items: center;
      transition: color 0.15s;
    }
    .eye-btn:hover { color: var(--brand); }
    .eye-btn mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .field-error {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.75rem; color: var(--danger);
      margin-top: 4px;
    }
    .field-error mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; }

    /* Error alert */
    .error-alert {
      display: flex; align-items: center; gap: 8px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      color: var(--danger); border-radius: 10px;
      padding: 10px 14px; font-size: 0.82rem;
      margin-bottom: 16px;
    }
    .error-alert mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; flex-shrink: 0; }

    /* Submit button */
    .submit-btn {
      width: 100%; height: 54px;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
      background-size: 200% 100%; background-position: 0% 50%;
      color: #052e16 !important; border: none; border-radius: 14px;
      font-size: 1rem; font-weight: 800; cursor: pointer;
      transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 6px 20px rgba(34,197,94,0.4), 0 1px 0 rgba(255,255,255,0.3) inset;
      margin-bottom: 20px;
      font-family: 'Outfit', sans-serif;
      letter-spacing: -0.01em;
      position: relative; overflow: hidden;
    }
    .submit-btn:hover:not(:disabled) {
      background-position: 100% 50%;
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 10px 28px rgba(34,197,94,0.55), 0 1px 0 rgba(255,255,255,0.3) inset;
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .submit-btn mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }

    .register-link { text-align: center; font-size: 0.82rem; color: var(--text-muted); margin: 0; }
    .register-link a { color: var(--brand); font-weight: 700; text-decoration: none; }
    .register-link a:hover { text-decoration: underline; }

    /* ══════════════════════════════════════════════════════════════════════════
       ANIMATIONS & INTERACTIONS
    ══════════════════════════════════════════════════════════════════════════ */

    /* Keyframes */
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(28px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes shimmer {
      0%   { left: -100%; }
      60%  { left: 160%;  }
      100% { left: 160%;  }
    }
    @keyframes statFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-7px); }
    }
    @keyframes logoPulse {
      0%, 100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);    }
      50%       { box-shadow: 0 0 0 10px rgba(34,197,94,0.12); }
    }
    @keyframes orbA {
      0%, 100% { transform: translate(0,   0  ) scale(1);    opacity: 0.6; }
      33%       { transform: translate(70px,-50px) scale(1.15); opacity: 0.8; }
      66%       { transform: translate(-30px,40px) scale(0.88); opacity: 0.5; }
    }
    @keyframes orbB {
      0%, 100% { transform: translate(0,   0  ) scale(1);    }
      40%       { transform: translate(-60px,70px) scale(1.2); }
      70%       { transform: translate(50px,-30px) scale(0.9); }
    }

    /* Animated background orbs inside left panel */
    .panel-left::after {
      content: ''; position: absolute;
      width: 380px; height: 380px; border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.13), transparent 70%);
      bottom: -100px; right: -120px;
      animation: orbA 11s ease-in-out infinite;
      pointer-events: none; z-index: 0;
    }

    /* ── Form card: entrance + hover lift ─────────────────────────────────── */
    .form-card {
      animation: slideUpFade 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease;
    }
    .form-card:hover {
      transform: translateY(-10px) scale(1.012);
      box-shadow: 0 32px 80px rgba(0,0,0,0.13), 0 0 0 1.5px color-mix(in srgb, var(--brand) 30%, transparent);
    }

    /* ── Brand logo: pulse + hover spin ──────────────────────────────────── */
    .brand-logo {
      animation: logoPulse 3.5s ease-in-out infinite;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s;
    }
    .brand-logo:hover {
      transform: scale(1.12) rotate(8deg);
      border-color: rgba(74,222,128,0.5);
      animation-play-state: paused;
    }

    /* ── Stat cards: staggered float ─────────────────────────────────────── */
    .stat-card { transition: all 0.3s ease; }
    .stat-card:nth-child(1) { animation: statFloat 4.5s ease-in-out infinite; }
    .stat-card:nth-child(2) { animation: statFloat 4.5s ease-in-out 1.2s infinite; }
    .stat-card:hover {
      background: rgba(255,255,255,0.09) !important;
      border-color: rgba(74,222,128,0.25) !important;
      transform: translateY(-5px) scale(1.03);
      animation-play-state: paused;
    }
    .stat-card:hover .stat-icon { transform: scale(1.15) rotate(-5deg); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

    /* ── Testimonial card ────────────────────────────────────────────────── */
    .testimonial { transition: all 0.3s ease; }
    .testimonial:hover {
      background: rgba(255,255,255,0.07) !important;
      border-color: rgba(74,222,128,0.18) !important;
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    }

    /* ── Trust chips ─────────────────────────────────────────────────────── */
    .lchip {
      transition: all 0.22s ease;
      cursor: default;
    }
    .lchip:hover {
      background: rgba(74,222,128,0.12) !important;
      border-color: rgba(74,222,128,0.25) !important;
      color: rgba(255,255,255,0.75) !important;
      transform: translateY(-3px) scale(1.04);
    }

    /* ── Input fields: hover glow ────────────────────────────────────────── */
    .input-wrap {
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .input-wrap:hover:not(.input-error):not(.input-focused) {
      border-color: color-mix(in srgb, var(--brand) 55%, var(--border-color));
      background: var(--surface-card);
    }
    .input-icon { transition: color 0.2s, transform 0.2s; }
    .input-wrap.input-focused .input-icon {
      color: var(--brand) !important;
      transform: scale(1.12) rotate(-5deg);
    }

    /* ── Submit button: shimmer sweep ────────────────────────────────────── */
    .submit-btn::before {
      content: '';
      position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent);
      animation: shimmer 2.5s ease-in-out infinite;
    }

    /* ── Demo banner: hover glow ─────────────────────────────────────────── */
    .demo-banner { transition: all 0.28s ease; }
    .demo-banner:hover {
      border-color: color-mix(in srgb, var(--brand) 45%, transparent);
      box-shadow: 0 6px 24px color-mix(in srgb, var(--brand) 10%, rgba(0,0,0,0.04));
    }

    /* ── Demo cards: slide + icon bounce ─────────────────────────────────── */
    .demo-card { transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .demo-card:hover {
      transform: translateX(6px) scale(1.015) !important;
      box-shadow: 3px 3px 14px color-mix(in srgb, var(--demo-color) 14%, rgba(0,0,0,0.04));
    }
    .demo-card-icon { transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .demo-card:hover .demo-card-icon {
      transform: scale(1.2) rotate(-8deg);
    }

    /* ── Forgot link hover ───────────────────────────────────────────────── */
    .forgot-link { transition: color 0.15s, transform 0.15s; display: inline-block; }
    .forgot-link:hover { transform: translateX(3px); text-decoration: none !important; }

    /* ── Register link hover ─────────────────────────────────────────────── */
    .register-link a { transition: letter-spacing 0.2s; }
    .register-link a:hover { letter-spacing: 0.01em; text-decoration: none !important; }

    /* ── Responsive ─────────────────────────────────────────────────────────── */
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .panel-left { display: none; }
      .panel-right { padding: 24px 16px; min-height: 100vh; align-items: flex-start; padding-top: 40px; }
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

  readonly loading = signal(false);
  showPassword  = false;
  errorMessage  = '';
  emailFocused  = false;
  pwFocused     = false;

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
