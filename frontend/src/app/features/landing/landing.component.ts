import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Feature      { icon: string; title: string; desc: string; accent: string; }
interface Step         { num: string; title: string; desc: string; icon: string; bullets: string[]; }
interface Testimonial  { quote: string; name: string; role: string; company: string; avatar: string; }
interface PricingPlan  {
  name: string; price: string; period: string;
  annualPrice?: string; annualNote?: string;
  desc: string; features: string[]; cta: string; highlight: boolean; badge?: string;
}

@Component({
  selector: 'as-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- ══ NAVBAR ═══════════════════════════════════════════════════════════ -->
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/landing" class="nav-brand">
          <div class="brand-icon-wrap">
            <img src="logo.svg" class="brand-shield" alt="AuditShield" />
          </div>
          <span class="brand-name">AuditShield</span>
        </a>
        <div class="nav-center">
          <a href="#features"     class="nav-link">Features</a>
          <a href="#how-it-works" class="nav-link">How It Works</a>
          <a href="#pricing"      class="nav-link">Pricing</a>
        </div>
        <div class="nav-end">
          <a routerLink="/auth/login"    class="btn-ghost">Sign In</a>
          <a routerLink="/auth/register" class="btn-primary">
            <mat-icon>rocket_launch</mat-icon> Get Started Free
          </a>
        </div>
      </div>
    </nav>

    <!-- ══ HERO ══════════════════════════════════════════════════════════════ -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-label">
          <mat-icon>verified</mat-icon>
          Trusted by 500+ SMEs Worldwide
        </div>
        <h1 class="hero-h1">
          The <em>Compliance Platform</em><br />for growing businesses<br />everywhere
        </h1>
        <p class="hero-p">
          AuditShield keeps all your employee records, contracts, and statutory
          compliance documents secure and organised — so audits become
          routine instead of emergencies, wherever you operate.
        </p>
        <div class="hero-actions">
          <a routerLink="/auth/register" class="btn-primary btn-lg">
            <mat-icon>rocket_launch</mat-icon> Start for Free
          </a>
          <a routerLink="/auth/register" class="btn-outline-white btn-lg">
            <mat-icon>play_circle_outline</mat-icon> See It In Action
          </a>
        </div>
        <div class="hero-chips">
          <span class="chip"><mat-icon>lock</mat-icon>AES-256 encrypted</span>
          <span class="chip"><mat-icon>cloud_done</mat-icon>Daily backups</span>
          <span class="chip"><mat-icon>public</mat-icon>Multi-jurisdiction</span>
          <span class="chip"><mat-icon>shield</mat-icon>99.9% uptime</span>
        </div>
      </div>

      <!-- App mockup -->
      <div class="mockup-wrap">
        <div class="mockup">
          <div class="mockup-chrome">
            <span class="chrome-dot c-red"></span>
            <span class="chrome-dot c-yellow"></span>
            <span class="chrome-dot c-green"></span>
            <span class="chrome-url">app.auditshield.io · Dashboard</span>
          </div>
          <div class="mockup-ui">
            <div class="m-sidebar">
              <div class="m-logo">🛡️</div>
              <div class="m-nav-item m-active"><mat-icon>dashboard</mat-icon></div>
              <div class="m-nav-item"><mat-icon>group</mat-icon></div>
              <div class="m-nav-item"><mat-icon>folder_open</mat-icon></div>
              <div class="m-nav-item"><mat-icon>verified_user</mat-icon></div>
              <div class="m-nav-item"><mat-icon>assessment</mat-icon></div>
            </div>
            <div class="m-content">
              <div class="m-topbar">
                <span class="m-greeting">Good morning, James 👋</span>
                <span class="m-company-chip"><mat-icon>business</mat-icon>GlobalCo International</span>
              </div>
              <div class="m-kpi-row">
                <div class="m-kpi indigo"><div class="m-kv">47</div><div class="m-kl">Employees</div></div>
                <div class="m-kpi purple"><div class="m-kv">183</div><div class="m-kl">Documents</div></div>
                <div class="m-kpi green"><div class="m-kv">94%</div><div class="m-kl">Compliance</div></div>
                <div class="m-kpi amber"><div class="m-kv">2</div><div class="m-kl">Expiring</div></div>
              </div>
              <div class="m-two-col">
                <div class="m-card">
                  <div class="m-card-title">Compliance Score</div>
                  <div class="m-score-ring"><span>94%</span></div>
                  <div class="m-bar-row">
                    <div class="m-bar"><div class="m-bar-fill" style="width:94%"></div></div>
                    <span class="m-bar-label">94/100</span>
                  </div>
                </div>
                <div class="m-card">
                  <div class="m-card-title">Upcoming Deadlines</div>
                  <div class="m-deadline"><span class="m-dot red"></span><span>Tax filing — 3 days</span></div>
                  <div class="m-deadline"><span class="m-dot amber"></span><span>Soc. Security — 8 days</span></div>
                  <div class="m-deadline"><span class="m-dot green"></span><span>VAT Q4 — Submitted ✓</span></div>
                </div>
              </div>
              <div class="m-card m-activity">
                <div class="m-card-title">Recent Activity</div>
                <div class="m-act-item"><span class="m-act-dot green"></span><span>Contract uploaded — Sarah Chen</span></div>
                <div class="m-act-item"><span class="m-act-dot indigo"></span><span>Payroll run completed — Mar 2026</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-notif">
          <mat-icon>notifications_active</mat-icon>
          <div>
            <div class="notif-title">Deadline in 3 days</div>
            <div class="notif-sub">Payroll tax filing due Mar 15</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ STATS ══════════════════════════════════════════════════════════════ -->
    <section class="stats-bar">
      @for (s of stats; track s.label) {
        <div class="stat">
          <mat-icon class="stat-icon">{{ s.icon }}</mat-icon>
          <div class="stat-val">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      }
    </section>

    <!-- ══ FEATURES ═══════════════════════════════════════════════════════════ -->
    <section class="section" id="features">
      <div class="section-tag">Everything you need</div>
      <h2 class="section-h2">Built for SME compliance, globally</h2>
      <p class="section-p">One secure platform replaces paper files, scattered spreadsheets, and audit-day panic — for businesses everywhere.</p>

      <!-- Hero feature card -->
      <div class="feat-hero">
        <div class="feat-hero-left">
          <div class="feat-hero-eyebrow">
            <mat-icon>star</mat-icon> Core platform feature
          </div>
          <h3>Live Compliance Score — always audit-ready</h3>
          <p>Your score updates in real time as you upload documents, complete checklists, and resolve overdue items. Walk into any regulatory inspection with confidence — no last-minute panic.</p>
          <div class="feat-hero-stats">
            <div class="feat-stat">
              <span class="feat-stat-val">94%</span>
              <span class="feat-stat-lbl">Avg. user score</span>
            </div>
            <div class="feat-stat">
              <span class="feat-stat-val">48h</span>
              <span class="feat-stat-lbl">To audit-ready</span>
            </div>
            <div class="feat-stat">
              <span class="feat-stat-val">0</span>
              <span class="feat-stat-lbl">Compliance fines</span>
            </div>
          </div>
          <a routerLink="/auth/register" class="btn-primary" style="margin-top:28px;width:fit-content">
            <mat-icon>rocket_launch</mat-icon> Start for Free
          </a>
        </div>
        <div class="feat-hero-right">
          <svg viewBox="0 0 160 160" class="feat-score-svg">
            <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(34,197,94,0.12)" stroke-width="12"/>
            <circle cx="80" cy="80" r="68" fill="none" stroke="url(#sg)" stroke-width="12"
                    stroke-linecap="round"
                    stroke-dasharray="427.3" stroke-dashoffset="25.6"
                    transform="rotate(-90 80 80)"
                    style="transition:stroke-dashoffset 1s ease"/>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#4ade80"/>
                <stop offset="100%" stop-color="#22c55e"/>
              </linearGradient>
            </defs>
            <text x="80" y="72" text-anchor="middle" dominant-baseline="middle"
                  fill="#22c55e" style="font-size:28px;font-weight:900;font-family:Inter,sans-serif">94%</text>
            <text x="80" y="95" text-anchor="middle" dominant-baseline="middle"
                  fill="#94a3b8" style="font-size:9px;font-family:Inter,sans-serif;letter-spacing:0.06em">COMPLIANCE SCORE</text>
          </svg>
          <div class="feat-score-breakdown">
            <div class="feat-score-item feat-green">
              <mat-icon>check_circle</mat-icon>
              <div><div class="fsv">47</div><div class="fsl">Compliant</div></div>
            </div>
            <div class="feat-score-item feat-amber">
              <mat-icon>schedule</mat-icon>
              <div><div class="fsv">3</div><div class="fsl">Pending</div></div>
            </div>
            <div class="feat-score-item feat-red">
              <mat-icon>error_outline</mat-icon>
              <div><div class="fsv">1</div><div class="fsl">Overdue</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature cards grid -->
      <div class="features-grid">
        @for (f of features; track f.title) {
          <div class="feat-card" [style.--fa]="f.accent">
            <div class="feat-icon" [style.background]="f.accent + '18'" [style.color]="f.accent">
              <mat-icon>{{ f.icon }}</mat-icon>
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
            <div class="feat-card-footer" [style.color]="f.accent">
              <span>Learn more</span><mat-icon>arrow_forward</mat-icon>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ══ AUTHORITY STRIP ════════════════════════════════════════════════════ -->
    <div class="auth-strip">
      <span class="auth-strip-label">Trusted across multiple jurisdictions including</span>
      <div class="auth-badges">
        <div class="auth-badge"><mat-icon>account_balance</mat-icon>Revenue Authorities Worldwide</div>
        <div class="auth-badge"><mat-icon>health_and_safety</mat-icon>Social Security Boards</div>
        <div class="auth-badge"><mat-icon>gavel</mat-icon>Labour Law Compliance</div>
        <div class="auth-badge"><mat-icon>public</mat-icon>Multi-Country Operations</div>
      </div>
    </div>

    <!-- ══ HOW IT WORKS ════════════════════════════════════════════════════════ -->
    <section class="section section--dark" id="how-it-works">
      <div class="section-tag section-tag--light">Simple 3-step setup</div>
      <h2 class="section-h2 section-h2--light">From paper chaos to audit-ready in days</h2>
      <p class="section-p section-p--light">No IT skills needed. No consultants. No spreadsheet migrations. Just three steps and you're live.</p>

      <div class="steps-timeline">
        @for (s of steps; track s.num; let last = $last) {
          <div class="step-col">
            <div class="step-head-row">
              <div class="step-icon-circle">
                <div class="step-num-chip">{{ s.num }}</div>
                <mat-icon class="step-big-icon">{{ s.icon }}</mat-icon>
              </div>
              @if (!last) { <div class="step-connector-line"></div> }
            </div>
            <div class="step-body">
              <h3>{{ s.title }}</h3>
              <p>{{ s.desc }}</p>
              <ul class="step-bullets">
                @for (b of s.bullets; track b) {
                  <li><mat-icon>check</mat-icon>{{ b }}</li>
                }
              </ul>
            </div>
          </div>
        }
      </div>

      <!-- Bottom CTA in dark section -->
      <div class="hiw-cta">
        <a routerLink="/auth/register" class="btn-primary btn-lg">
          <mat-icon>start</mat-icon> Get Started Free — 5 Minutes
        </a>
      </div>
    </section>

    <!-- ══ TESTIMONIALS ════════════════════════════════════════════════════════ -->
    <section class="section testimonials-section" id="testimonials">
      <div class="section-tag">Real customers</div>
      <h2 class="section-h2">Teams that use AuditShield every day</h2>
      <p class="section-p">See how growing businesses across the globe stay audit-ready with us.</p>
      <div class="testimonials-grid">
        @for (t of testimonials; track t.name) {
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <blockquote class="testimonial-quote">"{{ t.quote }}"</blockquote>
            <div class="testimonial-author">
              <div class="testimonial-avatar">{{ t.avatar }}</div>
              <div>
                <div class="testimonial-name">{{ t.name }}</div>
                <div class="testimonial-role">{{ t.role }}</div>
                <div class="testimonial-company">{{ t.company }}</div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ══ PRICING ════════════════════════════════════════════════════════════ -->
    <section class="section section--alt pricing-section" id="pricing">
      <div class="section-tag">Simple, transparent pricing</div>
      <h2 class="section-h2">Pick the plan that fits your team</h2>
      <p class="section-p">All plans include a 14-day free trial. No credit card required.</p>

      <!-- Billing toggle -->
      <div class="billing-toggle">
        <span class="billing-opt" [class.billing-active]="!isAnnual()">Monthly</span>
        <button class="toggle-pill" (click)="toggleBilling()" [class.is-annual]="isAnnual()" aria-label="Toggle billing period">
          <span class="toggle-thumb"></span>
        </button>
        <span class="billing-opt" [class.billing-active]="isAnnual()">Annual</span>
        @if (isAnnual()) {
          <span class="save-badge">🎉 Save 20%</span>
        }
      </div>

      <div class="pricing-grid">
        @for (p of plans; track p.name) {
          <div class="plan-card" [class.plan-highlight]="p.highlight">
            @if (p.badge) { <div class="plan-badge">{{ p.badge }}</div> }
            <div class="plan-name">{{ p.name }}</div>
            <div class="plan-price-row">
              <span class="plan-price">{{ isAnnual() && p.annualPrice ? p.annualPrice : p.price }}</span>
              <span class="plan-period">{{ p.period }}</span>
            </div>
            @if (isAnnual() && p.annualNote) {
              <div class="plan-annual-note">{{ p.annualNote }}</div>
            }
            <div class="plan-desc">{{ p.desc }}</div>
            <ul class="plan-features">
              @for (f of p.features; track f) {
                <li><mat-icon>check_circle</mat-icon>{{ f }}</li>
              }
            </ul>
            <a routerLink="/auth/register" class="plan-cta" [class.plan-cta-primary]="p.highlight">
              {{ p.cta }}
            </a>
          </div>
        }
      </div>

      <p class="pricing-note">
        <mat-icon>info</mat-icon>
        All plans include end-to-end encryption, daily backups, and GDPR-compliant data handling. Enterprise plans include a dedicated SLA.
      </p>
    </section>

    <!-- ══ FOOTER ═════════════════════════════════════════════════════════════ -->
    <footer class="footer">
      <!-- Green glow bar at top -->
      <div class="footer-glow-bar"></div>

      <div class="footer-inner">
        <!-- Brand column -->
        <div class="footer-brand-col">
          <div class="footer-brand">
            <div class="footer-logo-wrap">
              <img src="logo.svg" class="footer-shield" alt="AuditShield" />
            </div>
            <span class="footer-name">AuditShield</span>
          </div>
          <p class="footer-tagline">
            The global compliance platform that keeps SMEs audit-ready — wherever they operate.
          </p>
          <div class="footer-trust-chips">
            <span class="footer-chip"><mat-icon>lock</mat-icon>AES-256 Encrypted</span>
            <span class="footer-chip"><mat-icon>public</mat-icon>Multi-jurisdiction</span>
          </div>
          <a routerLink="/auth/register" class="btn-primary footer-cta-btn">
            <mat-icon>rocket_launch</mat-icon> Start for Free
          </a>
        </div>

        <!-- Link columns -->
        <div class="footer-cols">
          <div class="footer-col">
            <div class="footer-col-title">Product</div>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how-it-works">How It Works</a>
            <a routerLink="/auth/register">Get Started</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Platform</div>
            <a routerLink="/auth/login">Sign In</a>
            <a href="#">API Docs</a>
            <a href="#">Security</a>
            <a href="#">System Status</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Support</div>
            <a href="mailto:support@auditshield.io">Contact Us</a>
            <a href="#">Help Centre</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <span class="footer-copy">© 2026 AuditShield — Global Compliance Platform</span>
          <span class="footer-sep">·</span>
          <span class="footer-author">Built by Osee Manzi</span>
        </div>
        <div class="footer-bottom-right">
          <span class="footer-status-dot"></span>
          <span class="footer-status-text">All systems operational</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ── reset ── */
    :host { display: block; }
    * { box-sizing: border-box; }

    /* ═══ SHARED BUTTONS ═══════════════════════════════════════════════════ */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%);
      background-size: 200% 100%; background-position: 0% 50%;
      color: var(--brand-mid) !important;
      border: none; border-radius: 12px;
      padding: 11px 24px;
      font-size: 0.875rem; font-weight: 700;
      font-family: 'Outfit', sans-serif;
      letter-spacing: -0.01em;
      cursor: pointer; text-decoration: none;
      transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px rgba(34,197,94,0.4), 0 1px 0 rgba(255,255,255,0.3) inset;
      position: relative; overflow: hidden;
    }
    .btn-primary::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
      transform: translateX(-100%);
      transition: transform 0.5s;
    }
    .btn-primary:hover {
      background-position: 100% 50%;
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(34,197,94,0.55), 0 1px 0 rgba(255,255,255,0.3) inset;
      text-decoration: none;
    }
    .btn-primary:hover::after { transform: translateX(100%); }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.7); background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      padding: 10px 20px; border-radius: 12px;
      font-size: 0.875rem; font-weight: 500;
      font-family: 'Outfit', sans-serif;
      cursor: pointer; text-decoration: none;
      transition: all 0.15s;
    }
    .btn-ghost:hover {
      color: white; background: rgba(255,255,255,0.07);
      border-color: rgba(255,255,255,0.18);
      text-decoration: none;
    }
    .btn-outline-white {
      display: inline-flex; align-items: center; gap: 8px;
      color: rgba(255,255,255,0.9) !important;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;
      padding: 11px 24px; font-size: 0.875rem; font-weight: 600;
      font-family: 'Outfit', sans-serif; letter-spacing: -0.01em;
      cursor: pointer; text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset;
    }
    .btn-outline-white:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.28);
      transform: translateY(-2px);
      text-decoration: none;
    }
    .btn-lg { height: 54px; padding: 0 32px; font-size: 1rem; border-radius: 14px; }
    .btn-primary mat-icon, .btn-outline-white mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* ═══ NAVBAR ═══════════════════════════════════════════════════════════ */
    .nav {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      width: calc(100% - 48px); max-width: 1100px;
      z-index: 1000;
    }
    .nav-inner {
      display: grid; grid-template-columns: auto 1fr auto;
      align-items: center;
      background: rgba(7, 12, 8, 0.85);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(34,197,94,0.15);
      border-radius: 16px;
      padding: 10px 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none;
    }
    .brand-icon-wrap {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.05));
      border: 1px solid rgba(34,197,94,0.3);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 12px rgba(34,197,94,0.15);
    }
    .brand-icon-wrap img { width: 22px; height: 22px; }
    .brand-shield {
      width: 22px; height: 22px; display: block;
      filter: drop-shadow(0 0 6px rgba(34,197,94,0.8)) brightness(1.4) saturate(1.8) hue-rotate(10deg);
    }
    .brand-name {
      font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800;
      background: linear-gradient(135deg, #4ade80, #22c55e);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      letter-spacing: -0.3px;
    }
    .nav-center {
      display: flex; align-items: center; justify-content: center; gap: 4px;
    }
    .nav-link {
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-size: 14px; font-weight: 500; padding: 7px 14px; border-radius: 8px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); text-decoration: none; }
    .nav-end { display: flex; align-items: center; gap: 8px; }

    /* ═══ HERO ══════════════════════════════════════════════════════════════ */
    .hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #030a04 0%, #071a0c 40%, #0a0a0a 100%);
      display: flex; align-items: center;
      padding: 80px 56px; gap: 64px;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 700px 600px at 20% 60%, rgba(34,197,94,0.14), transparent),
        radial-gradient(ellipse 500px 400px at 80% 20%, rgba(34,197,94,0.10), transparent),
        radial-gradient(ellipse 300px 300px at 60% 80%, rgba(22,163,74,0.08), transparent);
      pointer-events: none;
    }
    .hero-inner { flex: 1; max-width: 540px; position: relative; }
    .hero-label {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(34,197,94,0.18); border: 1px solid rgba(34,197,94,0.35);
      color: #4ade80; border-radius: 999px;
      padding: 7px 18px; font-size: 0.82rem; font-weight: 600; margin-bottom: 28px;
    }
    .hero-label mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .hero-h1 {
      font-size: clamp(2.4rem, 4.5vw, 3.8rem); font-weight: 900;
      color: white; line-height: 1.07; margin: 0 0 22px; letter-spacing: -2px;
    }
    .hero-h1 em {
      font-style: normal;
      background: linear-gradient(135deg, #4ade80, #22c55e);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-p { font-size: 1.1rem; color: rgba(255,255,255,0.62); line-height: 1.75; margin: 0 0 36px; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 32px; }
    .hero-chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5); font-size: 0.78rem; padding: 5px 12px; border-radius: 999px;
    }
    .chip mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; color: #22c55e; }

    /* Mockup */
    .mockup-wrap { flex: 1; max-width: 600px; position: relative; display: flex; justify-content: center; }
    .mockup {
      width: 100%; border-radius: 16px; overflow: hidden;
      box-shadow: 0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
    }
    .mockup-chrome {
      display: flex; align-items: center; gap: 7px;
      background: #1e293b; padding: 10px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .chrome-dot { width: 11px; height: 11px; border-radius: 50%; }
    .c-red { background: #ff5f57; } .c-yellow { background: #febc2e; } .c-green { background: #28c840; }
    .chrome-url { flex: 1; text-align: center; font-size: 0.72rem; color: rgba(255,255,255,0.3); font-family: monospace; }
    .mockup-ui { display: flex; background: #f1f5f9; }
    .m-sidebar {
      width: 52px; background: #0f172a;
      display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 6px; flex-shrink: 0;
    }
    .m-logo { font-size: 1.4rem; margin-bottom: 10px; }
    .m-nav-item { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: rgba(255,255,255,0.35); }
    .m-nav-item mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .m-active { background: rgba(34,197,94,0.25); color: #4ade80 !important; }
    .m-content { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .m-topbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 0; }
    .m-greeting { font-size: 0.65rem; font-weight: 700; color: var(--text-primary); }
    .m-company-chip {
      display: flex; align-items: center; gap: 3px;
      background: #dcfce7; color: #16a34a;
      font-size: 0.58rem; font-weight: 700;
      padding: 2px 7px; border-radius: 999px;
    }
    .m-company-chip mat-icon { font-size: 0.65rem; width: 0.65rem; height: 0.65rem; }
    .m-kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
    .m-kpi { padding: 8px; border-radius: 8px; }
    .m-kpi.indigo { background: #f0fdf4; } .m-kpi.purple { background: #dcfce7; }
    .m-kpi.green  { background: #f0fdf4; } .m-kpi.amber  { background: #fffbeb; }
    .m-kv { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); }
    .m-kl { font-size: 0.6rem; color: var(--text-muted); }
    .m-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .m-card { background: white; border-radius: 8px; padding: 10px; border: 1px solid #e2e8f0; }
    .m-card-title { font-size: 0.65rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .m-score-ring {
      width: 48px; height: 48px; border-radius: 50%;
      border: 5px solid #22c55e;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 8px; font-size: 0.78rem; font-weight: 800; color: var(--text-primary);
    }
    .m-bar-row { display: flex; align-items: center; gap: 5px; }
    .m-bar { flex: 1; height: 5px; background: var(--border-color); border-radius: 3px; overflow: hidden; }
    .m-bar-fill { height: 100%; background: #22c55e; border-radius: 3px; }
    .m-bar-label { font-size: 0.6rem; color: var(--text-muted); white-space: nowrap; }
    .m-deadline { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 5px; }
    .m-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .m-dot.red { background: #ef4444; } .m-dot.amber { background: #f59e0b; } .m-dot.green { background: #22c55e; }
    .m-activity { margin-top: 2px; }
    .m-act-item { display: flex; align-items: center; gap: 6px; font-size: 0.62rem; color: var(--text-secondary); margin-bottom: 4px; }
    .m-act-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .m-act-dot.green { background: #22c55e; } .m-act-dot.indigo { background: #22c55e; }
    .hero-notif {
      position: absolute; bottom: -20px; left: -20px;
      background: white; border-radius: 14px;
      padding: 12px 16px; display: flex; align-items: center; gap: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      border: 1px solid #e2e8f0; min-width: 220px;
    }
    .hero-notif mat-icon { color: #22c55e; font-size: 1.4rem; width: 1.4rem; height: 1.4rem; flex-shrink: 0; }
    .notif-title { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
    .notif-sub   { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

    /* ═══ STATS BAR ═════════════════════════════════════════════════════════ */
    .stats-bar {
      display: flex; justify-content: center; flex-wrap: wrap;
      background: #060810; padding: 48px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .stat { text-align: center; padding: 0 56px; }
    .stat + .stat { border-left: 1px solid rgba(255,255,255,0.08); }
    .stat-icon { color: #22c55e !important; font-size: 1.6rem !important; width: 1.6rem !important; height: 1.6rem !important; margin-bottom: 8px; display: block; }
    .stat-val { font-size: 3rem; font-weight: 900; color: white; letter-spacing: -2px; }
    .stat-label { font-size: 0.875rem; color: rgba(255,255,255,0.45); margin-top: 4px; }

    /* ═══ SECTION COMMON ════════════════════════════════════════════════════ */
    .section { padding: 96px 56px; text-align: center; background: var(--surface-2); }
    .section--dark { background: #0f172a; }
    .section--alt  { background: #f1f5f9; }
    .section-tag {
      display: inline-block; background: #dcfce7; color: #16a34a;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 5px 16px; border-radius: 999px; margin-bottom: 16px;
    }
    .section-tag--light { background: rgba(34,197,94,0.18); color: #4ade80; }
    .section-h2 { font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight: 900; color: var(--text-primary); margin: 0 0 14px; letter-spacing: -1px; }
    .section-h2--light { color: white; }
    .section-p { color: var(--text-muted); font-size: 1rem; line-height: 1.75; max-width: 560px; margin: 0 auto 56px; }
    .section-p--light { color: rgba(255,255,255,0.55); }

    /* ═══ FEATURES — hero card ══════════════════════════════════════════════ */
    .feat-hero {
      max-width: 1080px; margin: 0 auto 48px;
      background: linear-gradient(135deg, #030a04 0%, #071a0c 60%, #0a0a0a 100%);
      border-radius: 24px; padding: 48px;
      display: grid; grid-template-columns: 1fr auto;
      gap: 48px; align-items: center; text-align: left;
      position: relative; overflow: hidden;
      border: 1px solid rgba(34,197,94,0.2);
      box-shadow: 0 24px 64px rgba(34,197,94,0.15);
    }
    .feat-hero::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse 600px 400px at 80% -20%, rgba(34,197,94,0.18), transparent);
      pointer-events: none;
    }
    .feat-hero-eyebrow {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.35);
      color: #4ade80; border-radius: 999px;
      padding: 5px 14px; font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 18px;
    }
    .feat-hero-eyebrow mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; color: #fbbf24; }
    .feat-hero-left h3 {
      font-size: 1.8rem; font-weight: 900; color: white;
      letter-spacing: -0.5px; line-height: 1.2; margin: 0 0 16px;
    }
    .feat-hero-left p { font-size: 1rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0 0 28px; max-width: 480px; }
    .feat-hero-stats { display: flex; gap: 32px; }
    .feat-stat { display: flex; flex-direction: column; gap: 3px; }
    .feat-stat-val {
      font-size: 1.8rem; font-weight: 900; color: white; letter-spacing: -1px; line-height: 1;
    }
    .feat-stat-lbl { font-size: 0.72rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06em; }

    /* Score ring visual */
    .feat-hero-right { display: flex; flex-direction: column; align-items: center; gap: 20px; flex-shrink: 0; }
    .feat-score-svg { width: 180px; height: 180px; flex-shrink: 0; }
    .feat-score-breakdown { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .feat-score-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 14px; border-radius: 10px;
      font-size: 0.82rem;
    }
    .feat-score-item mat-icon { font-size: 1rem; width: 1rem; height: 1rem; flex-shrink: 0; }
    .feat-score-item .fsv { font-size: 1rem; font-weight: 800; line-height: 1; }
    .feat-score-item .fsl { font-size: 0.65rem; opacity: 0.7; }
    .feat-green { background: rgba(34,197,94,0.12); color: #22c55e; }
    .feat-amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .feat-red   { background: rgba(239,68,68,0.12);  color: #ef4444; }

    /* ═══ FEATURES — cards grid ═════════════════════════════════════════════ */
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px; max-width: 1080px; margin: 0 auto; text-align: left;
    }
    .feat-card {
      background: white; border-radius: 18px; padding: 26px;
      border: 1px solid #e8eaf0;
      border-top: 3px solid var(--fa, #22c55e);
      display: flex; flex-direction: column;
      transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
      position: relative; overflow: hidden;
    }
    .feat-card::before {
      content: '';
      position: absolute; top: -30px; right: -30px;
      width: 100px; height: 100px; border-radius: 50%;
      background: radial-gradient(ellipse, color-mix(in srgb, var(--fa, #22c55e) 8%, transparent), transparent 70%);
      pointer-events: none;
    }
    .feat-card:hover {
      box-shadow: 0 16px 40px color-mix(in srgb, var(--fa, #22c55e) 12%, rgba(0,0,0,0.05));
      transform: translateY(-5px);
    }
    .feat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px; flex-shrink: 0;
    }
    .feat-icon mat-icon { font-size: 1.4rem; }
    .feat-card h3 { font-size: 0.98rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
    .feat-card p  { font-size: 0.865rem; color: var(--text-muted); margin: 0; line-height: 1.65; flex: 1; }
    .feat-card-footer {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.75rem; font-weight: 700;
      margin-top: 16px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .feat-card-footer mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; transition: transform 0.2s; }
    .feat-card:hover .feat-card-footer { opacity: 1; }
    .feat-card:hover .feat-card-footer mat-icon { transform: translateX(4px); }

    /* ═══ AUTHORITY STRIP ════════════════════════════════════════════════════ */
    .auth-strip { background: white; padding: 32px 56px; border-top: 1px solid #e8eaf0; border-bottom: 1px solid #e8eaf0; text-align: center; }
    .auth-strip-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-faint); display: block; margin-bottom: 18px; }
    .auth-badges { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
    .auth-badge {
      display: flex; align-items: center; gap: 8px;
      background: var(--surface-2); border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 10px 18px; font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .auth-badge:hover { border-color: #86efac; box-shadow: 0 4px 12px rgba(34,197,94,0.1); }
    .auth-badge mat-icon { color: #22c55e; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* ═══ HOW IT WORKS — timeline ════════════════════════════════════════════ */
    .steps-timeline {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 0; max-width: 1000px; margin: 0 auto 56px;
      position: relative;
    }
    .step-col { display: flex; flex-direction: column; padding: 0 24px; }
    .step-head-row {
      display: flex; align-items: center; margin-bottom: 28px;
    }
    .step-icon-circle {
      width: 80px; height: 80px; flex-shrink: 0;
      border-radius: 50%;
      background: rgba(34,197,94,0.15);
      border: 2px solid rgba(34,197,94,0.3);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .step-num-chip {
      position: absolute; top: -6px; right: -6px;
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, #4ade80, #22c55e);
      color: var(--brand-mid); font-size: 0.75rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 10px rgba(34,197,94,0.4);
    }
    .step-big-icon {
      font-size: 2rem !important; width: 2rem !important; height: 2rem !important;
      color: #4ade80 !important;
    }
    .step-connector-line {
      flex: 1; height: 2px;
      background: linear-gradient(90deg, rgba(34,197,94,0.4), rgba(34,197,94,0.1));
      margin: 0 8px;
    }
    .step-body { text-align: left; }
    .step-body h3 { font-size: 1.1rem; font-weight: 800; color: white; margin: 0 0 10px; }
    .step-body p  { font-size: 0.875rem; color: rgba(255,255,255,0.55); line-height: 1.65; margin: 0 0 16px; }
    .step-bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 7px; }
    .step-bullets li {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.82rem; color: rgba(255,255,255,0.65);
    }
    .step-bullets mat-icon {
      font-size: 0.9rem !important; width: 0.9rem !important; height: 0.9rem !important;
      color: #22c55e !important; flex-shrink: 0;
    }
    .hiw-cta { text-align: center; }

    /* ═══ TESTIMONIALS ════════════════════════════════════════════════════════ */
    .testimonials-section { background: white; }
    .testimonials-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px; max-width: 1000px; margin: 0 auto; text-align: left;
    }
    .testimonial-card {
      background: var(--surface-2); border-radius: 20px;
      padding: 28px; border: 1px solid #e8eaf0;
      display: flex; flex-direction: column; gap: 16px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .testimonial-card:hover { box-shadow: 0 12px 32px rgba(34,197,94,0.1); transform: translateY(-3px); }
    .testimonial-stars { color: #f59e0b; font-size: 1rem; letter-spacing: 2px; }
    .testimonial-quote { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin: 0; font-style: italic; flex: 1; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .testimonial-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white; font-size: 1.4rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .testimonial-name    { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
    .testimonial-role    { font-size: 0.78rem; color: #16a34a; font-weight: 600; }
    .testimonial-company { font-size: 0.78rem; color: var(--text-faint); }

    /* ═══ PRICING ════════════════════════════════════════════════════════════ */
    .pricing-section { }

    /* Billing toggle */
    .billing-toggle {
      display: inline-flex; align-items: center; gap: 12px;
      margin-bottom: 48px;
    }
    .billing-opt { font-size: 0.9rem; font-weight: 600; color: var(--text-faint); transition: color 0.2s; }
    .billing-active { color: var(--text-primary); }
    .toggle-pill {
      width: 52px; height: 28px; border-radius: 999px;
      background: var(--border-color); border: none; cursor: pointer;
      position: relative; transition: background 0.25s;
      padding: 0;
    }
    .toggle-pill.is-annual { background: #22c55e; }
    .toggle-thumb {
      position: absolute; top: 3px; left: 3px;
      width: 22px; height: 22px; border-radius: 50%;
      background: white; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .toggle-pill.is-annual .toggle-thumb { transform: translateX(24px); }
    .save-badge {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white; font-size: 0.72rem; font-weight: 700;
      padding: 4px 12px; border-radius: 999px;
      box-shadow: 0 4px 12px rgba(34,197,94,0.3);
    }

    .pricing-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px; max-width: 1080px; margin: 0 auto 32px;
    }
    .plan-card {
      background: white; border-radius: 20px; padding: 28px;
      border: 1px solid #e8eaf0; display: flex; flex-direction: column;
      position: relative; transition: box-shadow 0.2s, transform 0.2s;
    }
    .plan-card:hover { box-shadow: 0 16px 40px rgba(34,197,94,0.1); transform: translateY(-4px); }
    .plan-highlight {
      background: linear-gradient(145deg, #030a04, #071a0c);
      border-color: rgba(34,197,94,0.4);
      box-shadow: 0 24px 60px rgba(34,197,94,0.25);
    }
    .plan-badge {
      position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #4ade80, #22c55e); color: var(--brand-mid);
      font-size: 0.7rem; font-weight: 700; padding: 4px 16px; border-radius: 999px;
      white-space: nowrap;
    }
    .plan-name { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #16a34a; margin-bottom: 14px; }
    .plan-highlight .plan-name { color: #4ade80; }
    .plan-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
    .plan-price { font-size: 2.8rem; font-weight: 900; color: var(--text-primary); letter-spacing: -2px; transition: all 0.3s; }
    .plan-highlight .plan-price { color: white; }
    .plan-period { font-size: 0.85rem; color: var(--text-muted); }
    .plan-highlight .plan-period { color: rgba(255,255,255,0.5); }
    .plan-annual-note {
      font-size: 0.72rem; color: #22c55e; font-weight: 600;
      margin-bottom: 8px;
    }
    .plan-highlight .plan-annual-note { color: #4ade80; }
    .plan-desc { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }
    .plan-highlight .plan-desc { color: rgba(255,255,255,0.5); }
    .plan-features { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .plan-features li { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); }
    .plan-highlight .plan-features li { color: rgba(255,255,255,0.8); }
    .plan-features mat-icon { color: #22c55e; font-size: 1rem; width: 1rem; height: 1rem; flex-shrink: 0; }
    .plan-cta {
      display: flex; align-items: center; justify-content: center;
      height: 46px; border-radius: 12px;
      font-size: 0.9rem; font-weight: 700; text-decoration: none;
      background: #f1f5f9; color: var(--text-primary);
      border: 1px solid #e2e8f0;
      transition: all 0.15s; margin-top: auto;
    }
    .plan-cta:hover { background: var(--border-color); text-decoration: none; }
    .plan-cta-primary {
      background: linear-gradient(135deg, #4ade80, #22c55e); color: var(--brand-mid);
      border: none; box-shadow: 0 8px 24px rgba(34,197,94,0.4);
    }
    .plan-cta-primary:hover { opacity: 0.92; transform: translateY(-1px); }
    .pricing-note {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      font-size: 0.8rem; color: var(--text-faint); max-width: 600px; margin: 0 auto;
    }
    .pricing-note mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #22c55e; flex-shrink: 0; }

    /* ═══ DEMO CTA ════════════════════════════════════════════════════════════ */
    /* ═══ FOOTER ══════════════════════════════════════════════════════════════ */
    .footer {
      background: #060810;
      position: relative;
      overflow: hidden;
    }
    .footer::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 500px 300px at 10% 100%, rgba(34,197,94,0.07), transparent),
        radial-gradient(ellipse 400px 300px at 90% 0%, rgba(34,197,94,0.05), transparent);
      pointer-events: none;
    }
    .footer-glow-bar {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.4) 30%, rgba(34,197,94,0.7) 50%, rgba(34,197,94,0.4) 70%, transparent 100%);
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 32px 40px;
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 64px;
      align-items: flex-start;
      position: relative; z-index: 1;
    }
    .footer-brand-col { display: flex; flex-direction: column; gap: 20px; }
    .footer-brand { display: flex; align-items: center; gap: 12px; }
    .footer-logo-wrap {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, rgba(34,197,94,0.25), rgba(22,163,74,0.15));
      border: 1px solid rgba(74,222,128,0.22);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 14px rgba(34,197,94,0.2);
    }
    .footer-shield {
      width: 22px; height: 22px; display: block;
      filter: drop-shadow(0 0 6px rgba(34,197,94,0.8)) brightness(1.4) saturate(1.8) hue-rotate(10deg);
    }
    .footer-name {
      font-size: 1.25rem; font-weight: 900; letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #4ade80 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .footer-tagline { font-size: 0.875rem; color: rgba(255,255,255,0.4); line-height: 1.7; margin: 0; max-width: 300px; }
    .footer-trust-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .footer-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.18);
      color: rgba(74,222,128,0.8); font-size: 0.73rem; font-weight: 600;
      padding: 4px 12px; border-radius: 999px;
    }
    .footer-chip mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; }
    .footer-cta-btn { align-self: flex-start; }
    .footer-cols { display: flex; gap: 48px; justify-content: flex-end; padding-top: 4px; }
    .footer-col { display: flex; flex-direction: column; gap: 12px; min-width: 120px; }
    .footer-col-title {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: rgba(255,255,255,0.55);
      margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px;
    }
    .footer-col a {
      color: rgba(255,255,255,0.38); font-size: 0.875rem;
      text-decoration: none; transition: color 0.15s, padding-left 0.15s;
    }
    .footer-col a:hover { color: #4ade80; padding-left: 4px; }
    .footer-divider {
      max-width: 1200px; margin: 0 auto;
      height: 1px; background: rgba(255,255,255,0.05);
      position: relative; z-index: 1;
    }
    .footer-bottom {
      max-width: 1200px; margin: 0 auto;
      padding: 20px 32px;
      display: flex; justify-content: space-between; align-items: center;
      gap: 16px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .footer-bottom-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .footer-copy, .footer-author { font-size: 0.78rem; color: rgba(255,255,255,0.22); }
    .footer-sep { color: rgba(255,255,255,0.12); }
    .footer-bottom-right { display: flex; align-items: center; gap: 8px; }
    .footer-status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34,197,94,0.6);
      animation: status-pulse 2s ease-in-out infinite;
    }
    @keyframes status-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .footer-status-text { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

    /* ═══ RESPONSIVE ══════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .hero { flex-direction: column; padding: 64px 32px; text-align: center; }
      .hero-inner { max-width: 100%; }
      .hero-chips, .hero-actions { justify-content: center; }
      .mockup-wrap { max-width: 100%; }
      .feat-hero { grid-template-columns: 1fr; }
      .feat-hero-stats { justify-content: center; }
      .feat-hero-right { flex-direction: row; }
      .feat-score-svg { width: 140px; height: 140px; }
      .demo-inner { grid-template-columns: 1fr; gap: 40px; }
      .steps-timeline { grid-template-columns: 1fr; gap: 32px; }
      .step-connector-line { display: none; }
      .footer-inner { grid-template-columns: 1fr; gap: 40px; }
      .footer-cols { gap: 32px; flex-wrap: wrap; justify-content: flex-start; }
    }
    @media (max-width: 768px) {
      .nav { padding: 8px 12px; }
      .nav-center { display: none; }
      .hero, .section, .demo-section { padding: 60px 24px; }
      .footer-inner { padding: 40px 20px 28px; }
      .footer-bottom { padding: 16px 20px; }
      .nav-inner { padding: 0 16px; }
      .stats-bar { padding: 32px 24px; }
      .stat { padding: 16px 24px; }
      .stat + .stat { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); }
      .auth-strip { padding: 32px 24px; }
      .m-two-col { grid-template-columns: 1fr; }
      .hero-notif { display: none; }
      .pricing-grid { grid-template-columns: 1fr; max-width: 380px; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .footer-cols { flex-direction: column; gap: 24px; }
      .feat-hero { padding: 28px; }
      .feat-hero-left h3 { font-size: 1.4rem; }
      .billing-toggle { flex-wrap: wrap; justify-content: center; }
    }
  `],
})
export class LandingComponent {

  isAnnual = signal(false);
  toggleBilling() { this.isAnnual.update(v => !v); }

  readonly features: Feature[] = [
    { icon: 'folder_special',       title: 'Secure Document Vault',       desc: 'AES-256 encrypted storage for contracts, payslips, and compliance files. Decrypt only on authorized download.', accent: '#22c55e' },
    { icon: 'checklist_rtl',        title: 'Multi-Authority Compliance',   desc: 'Live checklists for payroll tax, VAT, social security, and labour law. Real-time compliance score.', accent: '#22c55e' },
    { icon: 'group',                title: 'Employee Records',             desc: 'Complete profiles with tax identifiers, social insurance numbers, salary history, contracts, and role access.', accent: '#16a34a' },
    { icon: 'notifications_active', title: 'Smart Deadline Alerts',        desc: 'Get notified weeks before documents expire or filing deadlines pass — not hours. Zero last-minute panic.', accent: '#f59e0b' },
    { icon: 'description',          title: 'One-Click Audit Reports',      desc: 'Generate PDF reports for any regulatory inspector in seconds. Full audit trail included automatically.', accent: '#0a0a0a' },
    { icon: 'upload_file',          title: 'Excel / CSV Import',           desc: 'Bulk-import your existing employee data from spreadsheets in minutes. Smart column mapping included.', accent: '#16a34a' },
    { icon: 'manage_accounts',      title: 'Role-Based Access Control',    desc: 'Admin, HR, Accountant, Auditor, Employee — everyone sees exactly what they should, nothing more.', accent: '#ec4899' },
    { icon: 'history',              title: 'Immutable Audit Trail',        desc: 'Every action logged permanently. Show inspectors who changed what, when, and from which IP address.', accent: '#ef4444' },
  ];

  readonly stats = [
    { value: '500+',  label: 'SMEs onboarded worldwide',     icon: 'business'       },
    { value: '150k+', label: 'Documents secured',            icon: 'folder_special' },
    { value: '99.9%', label: 'Platform uptime',              icon: 'cloud_done'     },
    { value: '0',     label: 'Compliance fines among users', icon: 'verified_user'  },
  ];

  readonly steps: Step[] = [
    {
      num: '1', title: 'Register your company', icon: 'business_center',
      desc: 'Add your business details, select your country and authorities, and invite your team. Under 5 minutes — no IT skills needed.',
      bullets: ['Tax identifier & registration number', 'Select jurisdiction & authorities', 'Invite your HR, finance, and admin team'],
    },
    {
      num: '2', title: 'Import your team', icon: 'group_add',
      desc: 'Upload an Excel file with your employees or add them one by one. Contracts and documents auto-link to each profile.',
      bullets: ['Bulk import from Excel/CSV in one click', 'Employee profiles auto-created with IDs', 'Documents linked to profiles instantly'],
    },
    {
      num: '3', title: 'Stay permanently ready', icon: 'verified_user',
      desc: 'AuditShield tracks every deadline and alerts you early. Your compliance score updates in real time.',
      bullets: ['Live compliance score dashboard', 'Automatic deadline reminders', 'One-click PDF audit reports'],
    },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote: 'We used to spend two weeks preparing for our annual regulatory audit. With AuditShield it took less than a day — everything was already organised, documented, and timestamped.',
      name: 'Rachel Torres',   role: 'Chief Operations Officer', company: 'Pacific Fresh Foods', avatar: '🌊',
    },
    {
      quote: 'Managing HR and compliance documents for 60 employees across three African offices used to be a nightmare. AuditShield centralised everything in one encrypted vault with a dashboard I actually understand.',
      name: 'Michael Okonkwo', role: 'HR Director',              company: 'Lagos Tech Solutions', avatar: '🚀',
    },
    {
      quote: 'The multi-country compliance support is a game-changer for us. One platform handles payroll tax, social security, and labour law for our staff in Germany, France, and the UK simultaneously.',
      name: 'Emma Schaefer',   role: 'Head of Finance',          company: 'BerlinBuild GmbH',    avatar: '🏗️',
    },
  ];

  readonly plans: PricingPlan[] = [
    {
      name: 'Free', price: '$0', period: '/ forever',
      annualPrice: '$0', annualNote: 'Always free',
      highlight: false,
      desc: 'Perfect for solo founders and micro-businesses.',
      features: ['Up to 10 employees', '500 MB document storage', 'Basic compliance checklist', 'Email support', '1 user account'],
      cta: 'Start for Free',
    },
    {
      name: 'Starter', price: '$29', period: '/ month',
      annualPrice: '$23', annualNote: 'Billed $276/year · Save $72',
      highlight: false,
      desc: 'For growing teams that need more power.',
      features: ['Up to 50 employees', '10 GB document storage', 'All compliance authorities', 'Smart deadline alerts', '5 user accounts', 'Excel / CSV import'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional', price: '$79', period: '/ month',
      annualPrice: '$63', annualNote: 'Billed $756/year · Save $192',
      highlight: true, badge: '⭐ Most Popular',
      desc: 'The complete compliance suite for mid-sized businesses.',
      features: ['Up to 200 employees', '100 GB document storage', 'All compliance authorities', 'PDF audit reports', 'Unlimited user accounts', 'Priority support', 'Multi-currency payroll', 'API access'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise', price: 'Custom', period: '',
      annualPrice: 'Custom', annualNote: 'Volume discounts available',
      highlight: false,
      desc: 'For large organisations with complex compliance needs.',
      features: ['Unlimited employees', 'Unlimited storage', 'Multi-entity / multi-country', 'Dedicated account manager', 'SSO / SAML integration', 'Custom onboarding', 'SLA guarantee', '24/7 phone support'],
      cta: 'Contact Sales',
    },
  ];

}
