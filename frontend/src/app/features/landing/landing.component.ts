import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Feature  { icon: string; title: string; desc: string; }
interface Step     { num: string; title: string; desc: string; icon: string; }
interface Testimonial { quote: string; name: string; role: string; company: string; avatar: string; }
interface PricingPlan { name: string; price: string; period: string; desc: string; features: string[]; cta: string; highlight: boolean; badge?: string; }
interface DemoUser { email: string; role: string; icon: string; color: string; }

@Component({
  selector: 'as-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- ══ NAVBAR ═══════════════════════════════════════════════════════════ -->
    <nav class="nav">
      <a routerLink="/landing" class="nav-brand">
        <img src="logo.svg" class="brand-shield" alt="AuditShield" />
        <span class="brand-name">AuditShield</span>
      </a>
      <div class="nav-center">
        <a href="#features"     class="nav-link">Features</a>
        <a href="#how-it-works" class="nav-link">How It Works</a>
        <a href="#pricing"      class="nav-link">Pricing</a>
        <a href="#demo"         class="nav-link">Demo</a>
      </div>
      <div class="nav-end">
        <a routerLink="/auth/login"    class="btn-ghost">Sign In</a>
        <a routerLink="/auth/register" class="btn-primary">Get Started Free</a>
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
            <mat-icon>rocket_launch</mat-icon>
            Start for Free
          </a>
          <a href="#demo" class="btn-outline-white btn-lg">
            <mat-icon>play_circle_outline</mat-icon>
            See Live Demo
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
              <!-- Activity feed -->
              <div class="m-card m-activity">
                <div class="m-card-title">Recent Activity</div>
                <div class="m-act-item"><span class="m-act-dot green"></span><span>Contract uploaded — Sarah Chen</span></div>
                <div class="m-act-item"><span class="m-act-dot indigo"></span><span>Payroll run completed — Mar 2026</span></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Floating notification -->
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

      <div class="features-grid">
        @for (f of features; track f.title; let i = $index) {
          <div class="feat-card">
            <div class="feat-icon"><mat-icon>{{ f.icon }}</mat-icon></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
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

      <div class="steps-row">
        @for (s of steps; track s.num; let last = $last) {
          <div class="step">
            <div class="step-icon-wrap">
              <div class="step-num-badge">{{ s.num }}</div>
              <mat-icon class="step-icon">{{ s.icon }}</mat-icon>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
          @if (!last) { <div class="step-arrow"><mat-icon>arrow_forward</mat-icon></div> }
        }
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

      <div class="pricing-grid">
        @for (p of plans; track p.name) {
          <div class="plan-card" [class.plan-highlight]="p.highlight">
            @if (p.badge) { <div class="plan-badge">{{ p.badge }}</div> }
            <div class="plan-name">{{ p.name }}</div>
            <div class="plan-price-row">
              <span class="plan-price">{{ p.price }}</span>
              <span class="plan-period">{{ p.period }}</span>
            </div>
            <div class="plan-desc">{{ p.desc }}</div>
            <ul class="plan-features">
              @for (f of p.features; track f) {
                <li><mat-icon>check_circle</mat-icon>{{ f }}</li>
              }
            </ul>
            <a routerLink="/auth/register"
              class="plan-cta"
              [class.plan-cta-primary]="p.highlight">
              {{ p.cta }}
            </a>
          </div>
        }
      </div>
    </section>

    <!-- ══ DEMO CTA ═══════════════════════════════════════════════════════════ -->
    <section class="demo-section" id="demo">
      <div class="demo-inner">
        <div class="demo-left">
          <div class="section-tag">Try it now — free</div>
          <h2 class="section-h2">Explore with live demo data</h2>
          <p class="section-p" style="margin:0 0 28px">
            Log in instantly with any demo account and explore the full app with a realistic global company — employees from multiple departments, documents, compliance checklists, and audit reports.
          </p>
          <a routerLink="/auth/login" class="btn-primary btn-lg">
            <mat-icon>login</mat-icon> Open Demo
          </a>
          <div class="demo-pw-row">
            <mat-icon>key</mat-icon>
            All demo accounts use password: <strong>Demo&#64;1234</strong>
          </div>
        </div>
        <div class="demo-right">
          <div class="creds-card">
            <div class="creds-header">
              <mat-icon>science</mat-icon>
              5 demo accounts — click to explore each role
            </div>
            <div class="demo-roles-grid">
              @for (u of demoUsers; track u.email) {
                <a routerLink="/auth/login" class="demo-role-card" [style.--rc]="u.color">
                  <div class="drc-icon"><mat-icon>{{ u.icon }}</mat-icon></div>
                  <div class="drc-body">
                    <span class="drc-role">{{ u.role }}</span>
                    <span class="drc-email">{{ u.email }}</span>
                  </div>
                  <mat-icon class="drc-arrow">arrow_forward</mat-icon>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER ═════════════════════════════════════════════════════════════ -->
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="logo.svg" class="footer-shield" alt="AuditShield" />
          <div>
            <div class="footer-name">AuditShield</div>
            <div class="footer-desc">The Global SME Digital Records &amp; Compliance Platform</div>
          </div>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <div class="footer-col-title">Product</div>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#demo">Live Demo</a>
            <a routerLink="/auth/register">Get Started</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Platform</div>
            <a routerLink="/auth/login">Sign In</a>
            <a href="#">API Docs</a>
            <a href="#">Security</a>
            <a href="#">Status</a>
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
      <div class="footer-bottom">
        <span>© 2026 AuditShield · Global Compliance Platform</span>
        <span>Built by Osee Manzi · All rights reserved</span>
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
      background: #6366f1; color: white;
      border: none; border-radius: 10px;
      padding: 10px 22px;
      font-size: 0.9rem; font-weight: 700;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 4px 14px rgba(99,102,241,0.4);
    }
    .btn-primary:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.5); text-decoration: none; }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.75); background: none; border: none;
      padding: 8px 16px; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500;
      cursor: pointer; text-decoration: none;
      transition: color 0.15s, background 0.15s;
    }
    .btn-ghost:hover { color: white; background: rgba(255,255,255,0.08); text-decoration: none; }
    .btn-outline-white {
      display: inline-flex; align-items: center; gap: 8px;
      color: white; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.22); border-radius: 10px;
      padding: 10px 22px; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s;
    }
    .btn-outline-white:hover { background: rgba(255,255,255,0.15); text-decoration: none; }
    .btn-lg { height: 52px; padding: 0 28px; font-size: 1rem; border-radius: 12px; }

    /* ═══ NAVBAR ═══════════════════════════════════════════════════════════ */
    .nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center;
      padding: 0 56px; height: 68px;
      background: rgba(9,11,21,0.96);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; margin-right: 32px; }
    .brand-shield { width: 30px; height: 30px; display: block; flex-shrink: 0; }
    .brand-name { font-size: 1.25rem; font-weight: 900; color: white; letter-spacing: -0.5px; }
    .nav-center { display: flex; gap: 4px; flex: 1; }
    .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.875rem; padding: 7px 14px; border-radius: 8px; transition: all 0.15s; }
    .nav-link:hover { color: white; background: rgba(255,255,255,0.08); text-decoration: none; }
    .nav-end { display: flex; align-items: center; gap: 10px; }

    /* ═══ HERO ══════════════════════════════════════════════════════════════ */
    .hero {
      min-height: 100vh;
      background: linear-gradient(145deg, #090b15 0%, #0f172a 40%, #1e1b4b 100%);
      display: flex; align-items: center;
      padding: 80px 56px; gap: 64px;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 700px 600px at 20% 60%, rgba(99,102,241,0.14), transparent),
        radial-gradient(ellipse 500px 400px at 80% 20%, rgba(99,102,241,0.1), transparent),
        radial-gradient(ellipse 300px 300px at 60% 80%, rgba(139,92,246,0.08), transparent);
      pointer-events: none;
    }
    .hero-inner { flex: 1; max-width: 540px; position: relative; }
    .hero-label {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(99,102,241,0.18); border: 1px solid rgba(99,102,241,0.35);
      color: #a5b4fc; border-radius: 999px;
      padding: 7px 18px; font-size: 0.82rem; font-weight: 600; margin-bottom: 28px;
    }
    .hero-label mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .hero-h1 {
      font-size: clamp(2.4rem, 4.5vw, 3.8rem); font-weight: 900;
      color: white; line-height: 1.07; margin: 0 0 22px; letter-spacing: -2px;
    }
    .hero-h1 em {
      font-style: normal;
      background: linear-gradient(135deg, #a5b4fc, #6366f1);
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
    .chip mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; color: #6366f1; }

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
    .m-active { background: rgba(99,102,241,0.25); color: #818cf8 !important; }
    .m-content { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .m-topbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 0; }
    .m-greeting { font-size: 0.65rem; font-weight: 700; color: #0f172a; }
    .m-company-chip {
      display: flex; align-items: center; gap: 3px;
      background: #ede9fe; color: #6366f1;
      font-size: 0.58rem; font-weight: 700;
      padding: 2px 7px; border-radius: 999px;
    }
    .m-company-chip mat-icon { font-size: 0.65rem; width: 0.65rem; height: 0.65rem; }
    .m-kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; }
    .m-kpi { padding: 8px; border-radius: 8px; }
    .m-kpi.indigo { background: #ede9fe; } .m-kpi.purple { background: #f5f3ff; }
    .m-kpi.green  { background: #f0fdf4; } .m-kpi.amber  { background: #fffbeb; }
    .m-kv { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
    .m-kl { font-size: 0.6rem; color: #64748b; }
    .m-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .m-card { background: white; border-radius: 8px; padding: 10px; border: 1px solid #e2e8f0; }
    .m-card-title { font-size: 0.65rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .m-score-ring {
      width: 48px; height: 48px; border-radius: 50%;
      border: 5px solid #6366f1;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 8px; font-size: 0.78rem; font-weight: 800; color: #0f172a;
    }
    .m-bar-row { display: flex; align-items: center; gap: 5px; }
    .m-bar { flex: 1; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .m-bar-fill { height: 100%; background: #6366f1; border-radius: 3px; }
    .m-bar-label { font-size: 0.6rem; color: #64748b; white-space: nowrap; }
    .m-deadline { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: #475569; margin-bottom: 5px; }
    .m-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .m-dot.red { background: #ef4444; } .m-dot.amber { background: #f59e0b; } .m-dot.green { background: #22c55e; }
    .m-activity { margin-top: 2px; }
    .m-act-item { display: flex; align-items: center; gap: 6px; font-size: 0.62rem; color: #475569; margin-bottom: 4px; }
    .m-act-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .m-act-dot.green  { background: #22c55e; }
    .m-act-dot.indigo { background: #6366f1; }
    /* Floating notification */
    .hero-notif {
      position: absolute; bottom: -20px; left: -20px;
      background: white; border-radius: 14px;
      padding: 12px 16px; display: flex; align-items: center; gap: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      border: 1px solid #e2e8f0; min-width: 220px;
    }
    .hero-notif mat-icon { color: #6366f1; font-size: 1.4rem; width: 1.4rem; height: 1.4rem; flex-shrink: 0; }
    .notif-title { font-size: 0.82rem; font-weight: 700; color: #0f172a; }
    .notif-sub   { font-size: 0.72rem; color: #64748b; margin-top: 2px; }

    /* ═══ STATS BAR ═════════════════════════════════════════════════════════ */
    .stats-bar {
      display: flex; justify-content: center; flex-wrap: wrap;
      background: #0f172a; padding: 48px;
      border-top: 1px solid rgba(255,255,255,0.05);
      gap: 0;
    }
    .stat { text-align: center; padding: 0 56px; }
    .stat + .stat { border-left: 1px solid rgba(255,255,255,0.08); }
    .stat-icon { color: #6366f1 !important; font-size: 1.6rem !important; width: 1.6rem !important; height: 1.6rem !important; margin-bottom: 8px; display: block; }
    .stat-val { font-size: 3rem; font-weight: 900; color: white; letter-spacing: -2px; }
    .stat-label { font-size: 0.875rem; color: rgba(255,255,255,0.45); margin-top: 4px; }

    /* ═══ SECTION COMMON ════════════════════════════════════════════════════ */
    .section { padding: 96px 56px; text-align: center; background: #f8fafc; }
    .section--dark { background: #0f172a; }
    .section--alt  { background: #f1f5f9; }
    .section-tag {
      display: inline-block; background: #ede9fe; color: #6366f1;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 5px 16px; border-radius: 999px; margin-bottom: 16px;
    }
    .section-tag--light { background: rgba(99,102,241,0.18); color: #a5b4fc; }
    .section-h2 { font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight: 900; color: #0f172a; margin: 0 0 14px; letter-spacing: -1px; }
    .section-h2--light { color: white; }
    .section-p { color: #64748b; font-size: 1rem; line-height: 1.75; max-width: 560px; margin: 0 auto 56px; }

    /* ═══ FEATURES GRID ══════════════════════════════════════════════════════ */
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
      gap: 22px; max-width: 1100px; margin: 0 auto; text-align: left;
    }
    .feat-card {
      background: white; border-radius: 16px; padding: 26px;
      border: 1px solid #e8eaf0;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    }
    .feat-card:hover { box-shadow: 0 12px 36px rgba(99,102,241,0.1); transform: translateY(-4px); border-color: #c7d2fe; }
    .feat-icon {
      width: 48px; height: 48px; background: #ede9fe; color: #6366f1;
      border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .feat-icon mat-icon { font-size: 1.4rem; }
    .feat-card h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .feat-card p  { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.65; }

    /* ═══ AUTHORITY STRIP ════════════════════════════════════════════════════ */
    .auth-strip { background: white; padding: 32px 56px; border-top: 1px solid #e8eaf0; border-bottom: 1px solid #e8eaf0; text-align: center; }
    .auth-strip-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; display: block; margin-bottom: 18px; }
    .auth-badges { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
    .auth-badge { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 18px; font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .auth-badge mat-icon { color: #6366f1; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* ═══ HOW IT WORKS ═══════════════════════════════════════════════════════ */
    .steps-row {
      display: flex; align-items: flex-start; justify-content: center;
      gap: 0; max-width: 960px; margin: 0 auto;
      flex-wrap: wrap;
    }
    .step { text-align: center; flex: 1; min-width: 200px; padding: 0 16px; }
    .step-icon-wrap { position: relative; display: inline-block; margin-bottom: 20px; }
    .step-num-badge {
      position: absolute; top: -6px; left: -6px;
      width: 24px; height: 24px; border-radius: 50%;
      background: #6366f1; color: white;
      font-size: 0.72rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      z-index: 1;
    }
    .step-icon {
      width: 64px !important; height: 64px !important; font-size: 2.2rem !important;
      color: #818cf8 !important;
      background: rgba(99,102,241,0.15);
      border-radius: 18px; padding: 14px;
      display: block !important;
    }
    .step-arrow {
      align-self: center; color: rgba(255,255,255,0.2);
      padding-bottom: 40px; flex-shrink: 0;
    }
    .step-arrow mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }
    .step h3 { font-size: 1.05rem; font-weight: 700; color: white; margin: 0 0 10px; }
    .step p  { font-size: 0.875rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin: 0; }

    /* ═══ TESTIMONIALS ════════════════════════════════════════════════════════ */
    .testimonials-section { background: white; }
    .testimonials-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px; max-width: 1000px; margin: 0 auto; text-align: left;
    }
    .testimonial-card {
      background: #f8fafc; border-radius: 20px;
      padding: 28px; border: 1px solid #e8eaf0;
      display: flex; flex-direction: column; gap: 16px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .testimonial-card:hover { box-shadow: 0 12px 32px rgba(99,102,241,0.1); transform: translateY(-3px); }
    .testimonial-stars { color: #f59e0b; font-size: 1rem; letter-spacing: 2px; }
    .testimonial-quote { font-size: 0.95rem; color: #334155; line-height: 1.7; margin: 0; font-style: italic; flex: 1; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .testimonial-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white; font-size: 1.4rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .testimonial-name    { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .testimonial-role    { font-size: 0.78rem; color: #6366f1; font-weight: 600; }
    .testimonial-company { font-size: 0.78rem; color: #94a3b8; }

    /* ═══ PRICING ════════════════════════════════════════════════════════════ */
    .pricing-section { }
    .pricing-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px; max-width: 1080px; margin: 0 auto;
    }
    .plan-card {
      background: white; border-radius: 20px; padding: 28px;
      border: 1px solid #e8eaf0; display: flex; flex-direction: column;
      position: relative; transition: box-shadow 0.2s, transform 0.2s;
    }
    .plan-card:hover { box-shadow: 0 16px 40px rgba(99,102,241,0.1); transform: translateY(-4px); }
    .plan-highlight {
      background: linear-gradient(145deg, #0f172a, #1e1b4b);
      border-color: rgba(99,102,241,0.4);
      box-shadow: 0 24px 60px rgba(99,102,241,0.25);
    }
    .plan-badge {
      position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
      font-size: 0.7rem; font-weight: 700; padding: 4px 16px; border-radius: 999px;
      white-space: nowrap; letter-spacing: 0.04em;
    }
    .plan-name { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6366f1; margin-bottom: 14px; }
    .plan-highlight .plan-name { color: #a5b4fc; }
    .plan-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
    .plan-price { font-size: 2.8rem; font-weight: 900; color: #0f172a; letter-spacing: -2px; }
    .plan-highlight .plan-price { color: white; }
    .plan-period { font-size: 0.85rem; color: #64748b; }
    .plan-highlight .plan-period { color: rgba(255,255,255,0.5); }
    .plan-desc { font-size: 0.82rem; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
    .plan-highlight .plan-desc { color: rgba(255,255,255,0.5); }
    .plan-features { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .plan-features li { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #334155; }
    .plan-highlight .plan-features li { color: rgba(255,255,255,0.8); }
    .plan-features mat-icon { color: #22c55e; font-size: 1rem; width: 1rem; height: 1rem; flex-shrink: 0; }
    .plan-cta {
      display: flex; align-items: center; justify-content: center;
      height: 46px; border-radius: 12px;
      font-size: 0.9rem; font-weight: 700; text-decoration: none;
      background: #f1f5f9; color: #0f172a;
      border: 1px solid #e2e8f0;
      transition: all 0.15s; margin-top: auto;
    }
    .plan-cta:hover { background: #e2e8f0; text-decoration: none; }
    .plan-cta-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
      border: none; box-shadow: 0 8px 24px rgba(99,102,241,0.4);
    }
    .plan-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ═══ DEMO CTA ════════════════════════════════════════════════════════════ */
    .demo-section { background: #f8fafc; padding: 96px 56px; border-top: 1px solid #e8eaf0; }
    .demo-inner { max-width: 1020px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
    .demo-left .section-tag { margin-bottom: 14px; }
    .demo-left .section-h2 { text-align: left; }
    .demo-pw-row {
      display: flex; align-items: center; gap: 6px;
      margin-top: 20px; font-size: 0.82rem; color: #64748b;
    }
    .demo-pw-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #6366f1; }
    .demo-pw-row strong { color: #0f172a; font-family: monospace; }
    /* Credentials card */
    .creds-card {
      background: #0f172a; border-radius: 20px; padding: 24px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .creds-header {
      display: flex; align-items: center; gap: 8px;
      color: #a5b4fc; font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 16px;
    }
    .creds-header mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    /* 5-role grid */
    .demo-roles-grid { display: flex; flex-direction: column; gap: 8px; }
    .demo-role-card {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 10px 14px;
      text-decoration: none; cursor: pointer;
      transition: all 0.15s;
    }
    .demo-role-card:hover {
      border-color: var(--rc);
      background: color-mix(in srgb, var(--rc) 10%, rgba(255,255,255,0.04));
      transform: translateX(4px);
      text-decoration: none;
    }
    .drc-icon {
      width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
      background: color-mix(in srgb, var(--rc) 20%, transparent);
      color: var(--rc);
      display: flex; align-items: center; justify-content: center;
    }
    .drc-icon mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .drc-body { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .drc-role  { font-size: 0.72rem; font-weight: 700; color: var(--rc); text-transform: uppercase; letter-spacing: 0.04em; }
    .drc-email { font-size: 0.75rem; color: rgba(255,255,255,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .drc-arrow { color: rgba(255,255,255,0.2) !important; font-size: 0.9rem !important; width: 0.9rem !important; height: 0.9rem !important; flex-shrink: 0; }
    .demo-role-card:hover .drc-arrow { color: var(--rc) !important; }

    /* ═══ FOOTER ══════════════════════════════════════════════════════════════ */
    .footer { background: #090b15; padding: 56px 56px 32px; }
    .footer-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; gap: 40px; }
    .footer-brand { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
    .footer-shield { width: 40px; height: 40px; display: block; flex-shrink: 0; }
    .footer-name { font-size: 1.1rem; font-weight: 800; color: white; }
    .footer-desc { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-top: 3px; max-width: 200px; }
    .footer-cols { display: flex; gap: 56px; }
    .footer-col { display: flex; flex-direction: column; gap: 10px; }
    .footer-col-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
    .footer-col a { color: rgba(255,255,255,0.4); font-size: 0.875rem; text-decoration: none; transition: color 0.15s; }
    .footer-col a:hover { color: white; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;
      display: flex; justify-content: space-between;
      font-size: 0.78rem; color: rgba(255,255,255,0.25);
    }

    /* ═══ RESPONSIVE ══════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .hero { flex-direction: column; padding: 64px 32px; text-align: center; }
      .hero-inner { max-width: 100%; }
      .hero-chips, .hero-actions { justify-content: center; }
      .mockup-wrap { max-width: 100%; }
      .demo-inner { grid-template-columns: 1fr; gap: 40px; }
      .steps-row { gap: 8px; }
      .step-arrow { display: none; }
      .footer-top { flex-direction: column; gap: 32px; }
      .footer-cols { gap: 32px; flex-wrap: wrap; }
    }
    @media (max-width: 768px) {
      .nav { padding: 0 20px; }
      .nav-center { display: none; }
      .hero, .section, .demo-section, .footer { padding: 60px 24px; }
      .stats-bar { padding: 32px 24px; }
      .stat { padding: 16px 24px; }
      .stat + .stat { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); }
      .auth-strip { padding: 32px 24px; }
      .m-two-col { grid-template-columns: 1fr; }
      .hero-notif { display: none; }
      .pricing-grid { grid-template-columns: 1fr; max-width: 360px; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .footer-cols { flex-direction: column; gap: 24px; }
    }
  `],
})
export class LandingComponent {

  readonly features: Feature[] = [
    { icon: 'folder_special',      title: 'Secure Document Vault',        desc: 'AES-256 encrypted storage for contracts, payslips, and compliance files. Decrypt only on download.' },
    { icon: 'checklist_rtl',       title: 'Multi-Authority Compliance',    desc: 'Live checklists for payroll tax, VAT, social security, and labour law. Real-time compliance score.' },
    { icon: 'group',               title: 'Employee Records',              desc: 'Complete profiles with tax identifiers, social insurance numbers, salary history, contracts, and role-based access.' },
    { icon: 'notifications_active',title: 'Smart Deadline Alerts',         desc: 'Get notified before documents expire or filing deadlines pass — weeks in advance, not hours.' },
    { icon: 'description',         title: 'One-Click Audit Reports',       desc: 'Generate PDF reports for any regulatory inspector in seconds. No scrambling during audits.' },
    { icon: 'upload_file',         title: 'Excel / CSV Import',            desc: 'Bulk-import your existing employee data from spreadsheets in minutes, not days.' },
    { icon: 'manage_accounts',     title: 'Role-Based Access Control',     desc: 'Admin, HR, Accountant, Auditor, Employee — everyone sees exactly what they should, nothing more.' },
    { icon: 'history',             title: 'Immutable Audit Trail',         desc: 'Every action logged permanently. Show inspectors who changed what, when, and from where.' },
  ];

  readonly stats = [
    { value: '500+',  label: 'SMEs onboarded worldwide',    icon: 'business'          },
    { value: '150k+', label: 'Documents secured',           icon: 'folder_special'    },
    { value: '99.9%', label: 'Platform uptime',             icon: 'cloud_done'        },
    { value: '0',     label: 'Compliance fines among users', icon: 'verified_user'    },
  ];

  readonly steps: Step[] = [
    { num: '1', title: 'Register your company',   icon: 'business_center', desc: 'Add your tax identifier, business registration number, and select your country. Under 5 minutes — no IT skills needed.' },
    { num: '2', title: 'Import your team',         icon: 'group_add',       desc: 'Upload an Excel file with your employees or add them one by one. Contracts and documents auto-linked.' },
    { num: '3', title: 'Stay permanently ready',   icon: 'verified_user',   desc: 'AuditShield tracks every deadline and alerts you early. Always ready for any regulatory inspection.' },
  ];

  readonly testimonials: Testimonial[] = [
    {
      quote: 'We used to spend two weeks preparing for our annual regulatory audit. With AuditShield it took less than a day — everything was already organised, documented, and timestamped.',
      name: 'Rachel Torres',   role: 'Chief Operations Officer', company: 'Pacific Fresh Foods', avatar: '🌊',
    },
    {
      quote: 'Managing HR and compliance documents for 60 employees across three African offices used to be a nightmare. AuditShield centralised everything in one encrypted vault with a dashboard I actually understand.',
      name: 'Michael Okonkwo', role: 'HR Director',               company: 'Lagos Tech Solutions',  avatar: '🚀',
    },
    {
      quote: 'The multi-country compliance support is a game-changer for us. One platform handles payroll tax, social security, and labour law for our staff in Germany, France, and the UK simultaneously.',
      name: 'Emma Schaefer',   role: 'Head of Finance',           company: 'BerlinBuild GmbH',      avatar: '🏗️',
    },
  ];

  readonly plans: PricingPlan[] = [
    {
      name: 'Free', price: '$0', period: '/ forever', highlight: false,
      desc: 'Perfect for solo founders and micro-businesses.',
      features: ['Up to 10 employees', '500 MB document storage', 'Basic compliance checklist', 'Email support', '1 user account'],
      cta: 'Start for Free',
    },
    {
      name: 'Starter', price: '$29', period: '/ month', highlight: false,
      desc: 'For growing teams that need more power.',
      features: ['Up to 50 employees', '10 GB document storage', 'All compliance authorities', 'Smart deadline alerts', '5 user accounts', 'Excel / CSV import'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional', price: '$79', period: '/ month', highlight: true, badge: '⭐ Most Popular',
      desc: 'The complete compliance suite for mid-sized businesses.',
      features: ['Up to 200 employees', '100 GB document storage', 'All compliance authorities', 'PDF audit reports', 'Unlimited user accounts', 'Priority support', 'Multi-currency payroll', 'API access'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise', price: 'Custom', period: '', highlight: false,
      desc: 'For large organisations with complex compliance needs.',
      features: ['Unlimited employees', 'Unlimited storage', 'Multi-entity / multi-country', 'Dedicated account manager', 'SSO / SAML integration', 'Custom onboarding', 'SLA guarantee', '24/7 phone support'],
      cta: 'Contact Sales',
    },
  ];

  readonly demoUsers: DemoUser[] = [
    { email: 'admin@demo.com',      role: 'Admin',      icon: 'admin_panel_settings', color: '#6366f1' },
    { email: 'hr@demo.com',         role: 'HR Manager', icon: 'badge',               color: '#22c55e' },
    { email: 'accountant@demo.com', role: 'Accountant', icon: 'calculate',           color: '#3b82f6' },
    { email: 'auditor@demo.com',    role: 'Auditor',    icon: 'fact_check',          color: '#f59e0b' },
    { email: 'employee@demo.com',   role: 'Employee',   icon: 'person',              color: '#8b5cf6' },
  ];
}
