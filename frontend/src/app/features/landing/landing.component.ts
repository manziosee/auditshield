import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// 2-Color brand palette:
//   Indigo  → #6366f1 / #4f46e5 / #818cf8  (brand / accent / CTAs)
//   Slate   → #0f172a / #1e293b / #334155   (dark backgrounds / text)

interface Feature { icon: string; title: string; desc: string; }
interface Step { num: string; title: string; desc: string; }

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
        <a href="#features"    class="nav-link">Features</a>
        <a href="#how-it-works"class="nav-link">How It Works</a>
        <a href="#demo"        class="nav-link">Demo</a>
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
          <!-- Window chrome -->
          <div class="mockup-chrome">
            <span class="chrome-dot c-red"></span>
            <span class="chrome-dot c-yellow"></span>
            <span class="chrome-dot c-green"></span>
            <span class="chrome-url">app.auditshield.rw · Dashboard</span>
          </div>
          <!-- App UI -->
          <div class="mockup-ui">
            <!-- Mini sidebar -->
            <div class="m-sidebar">
              <div class="m-logo">🛡️</div>
              <div class="m-nav-item m-active"><mat-icon>dashboard</mat-icon></div>
              <div class="m-nav-item"><mat-icon>group</mat-icon></div>
              <div class="m-nav-item"><mat-icon>folder_open</mat-icon></div>
              <div class="m-nav-item"><mat-icon>verified_user</mat-icon></div>
              <div class="m-nav-item"><mat-icon>assessment</mat-icon></div>
            </div>
            <!-- Content pane -->
            <div class="m-content">
              <!-- KPI row -->
              <div class="m-kpi-row">
                <div class="m-kpi indigo"><div class="m-kv">47</div><div class="m-kl">Employees</div></div>
                <div class="m-kpi purple"><div class="m-kv">183</div><div class="m-kl">Documents</div></div>
                <div class="m-kpi green"><div class="m-kv">94%</div><div class="m-kl">Compliance</div></div>
                <div class="m-kpi amber"><div class="m-kv">2</div><div class="m-kl">Expiring</div></div>
              </div>
              <!-- Two columns -->
              <div class="m-two-col">
                <!-- Score card -->
                <div class="m-card">
                  <div class="m-card-title">Compliance Score</div>
                  <div class="m-score-ring">
                    <span>94%</span>
                  </div>
                  <div class="m-bar-row">
                    <div class="m-bar"><div class="m-bar-fill" style="width:94%"></div></div>
                    <span class="m-bar-label">94/100</span>
                  </div>
                </div>
                <!-- Deadlines -->
                <div class="m-card">
                  <div class="m-card-title">Upcoming Deadlines</div>
                  <div class="m-deadline"><span class="m-dot red"></span><span>PAYE filing — 3 days</span></div>
                  <div class="m-deadline"><span class="m-dot amber"></span><span>RSSB Dec. — 8 days</span></div>
                  <div class="m-deadline"><span class="m-dot green"></span><span>VAT Q4 — Submitted ✓</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ STATS ══════════════════════════════════════════════════════════════ -->
    <section class="stats-bar">
      @for (s of stats; track s.label) {
        <div class="stat">
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
        @for (f of features; track f.title) {
          <div class="feat-card">
            <div class="feat-icon"><mat-icon>{{ f.icon }}</mat-icon></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        }
      </div>
    </section>

    <!-- ══ AUTHORITIES ════════════════════════════════════════════════════════ -->
    <div class="auth-strip">
      <span class="auth-strip-label">Trusted across multiple jurisdictions including</span>
      <div class="auth-badges">
        <div class="auth-badge"><mat-icon>account_balance</mat-icon>Revenue Authorities (RRA & beyond)</div>
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
        @for (s of steps; track s.num) {
          <div class="step">
            <div class="step-num">{{ s.num }}</div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
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
            Log in instantly with demo credentials and explore the full app
            with a realistic Rwandan company: employees, documents, compliance
            checklists and audit reports.
          </p>
          <a routerLink="/auth/login" class="btn-primary btn-lg">
            <mat-icon>login</mat-icon> Open Demo
          </a>
        </div>
        <div class="demo-right">
          <div class="creds-card">
            <div class="creds-header">
              <mat-icon>key</mat-icon>
              Demo Credentials
            </div>
            <div class="creds-row">
              <div class="cred-block">
                <span class="cred-role">Admin</span>
                <code>admin&#64;demo.com</code>
                <code>Demo&#64;1234</code>
              </div>
              <div class="creds-sep"></div>
              <div class="cred-block">
                <span class="cred-role">HR Manager</span>
                <code>hr&#64;demo.com</code>
                <code>Demo&#64;1234</code>
              </div>
            </div>
            <p class="creds-note">
              <mat-icon>info_outline</mat-icon>
              No sign-up required · Data resets on each demo session
            </p>
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
        <div class="footer-links">
          <a routerLink="/auth/login">Sign In</a>
          <a routerLink="/auth/register">Register</a>
          <a href="mailto:support@auditshield.rw">Support</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 AuditShield · Made with ❤️ in Kigali, Rwanda</span>
        <span>Osee Manzi · All rights reserved</span>
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
      background: #6366f1;
      color: white;
      border: none; border-radius: 10px;
      padding: 10px 22px;
      font-size: 0.9rem; font-weight: 700;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      box-shadow: 0 4px 14px rgba(99,102,241,0.4);
    }
    .btn-primary:hover {
      background: #4f46e5;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99,102,241,0.5);
      text-decoration: none;
    }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.75);
      background: none; border: none;
      padding: 8px 16px; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500;
      cursor: pointer; text-decoration: none;
      transition: color 0.15s, background 0.15s;
    }
    .btn-ghost:hover { color: white; background: rgba(255,255,255,0.08); text-decoration: none; }
    .btn-outline-white {
      display: inline-flex; align-items: center; gap: 8px;
      color: white;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 10px;
      padding: 10px 22px;
      font-size: 0.9rem; font-weight: 600;
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
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0; margin-right: 32px;
    }
    .brand-shield { width: 30px; height: 30px; display: block; flex-shrink: 0; }
    .brand-name { font-size: 1.25rem; font-weight: 900; color: white; letter-spacing: -0.5px; }
    .nav-center { display: flex; gap: 4px; flex: 1; }
    .nav-link {
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-size: 0.875rem; padding: 7px 14px; border-radius: 8px;
      transition: all 0.15s;
    }
    .nav-link:hover { color: white; background: rgba(255,255,255,0.08); text-decoration: none; }
    .nav-end { display: flex; align-items: center; gap: 10px; }

    /* ═══ HERO ══════════════════════════════════════════════════════════════ */
    .hero {
      min-height: 100vh;
      background: linear-gradient(145deg, #090b15 0%, #0f172a 40%, #1e1b4b 100%);
      display: flex;
      align-items: center;
      padding: 80px 56px;
      gap: 64px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 700px 600px at 20% 60%, rgba(99,102,241,0.12), transparent),
        radial-gradient(ellipse 500px 400px at 80% 20%, rgba(99,102,241,0.08), transparent);
      pointer-events: none;
    }
    .hero-inner { flex: 1; max-width: 540px; position: relative; }
    .hero-label {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(99,102,241,0.18); border: 1px solid rgba(99,102,241,0.35);
      color: #a5b4fc; border-radius: 999px;
      padding: 7px 18px; font-size: 0.82rem; font-weight: 600;
      margin-bottom: 28px;
    }
    .hero-label mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .hero-h1 {
      font-size: clamp(2.4rem, 4.5vw, 3.8rem);
      font-weight: 900;
      color: white;
      line-height: 1.07;
      margin: 0 0 22px;
      letter-spacing: -2px;
    }
    .hero-h1 em {
      font-style: normal;
      background: linear-gradient(135deg, #a5b4fc, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-p {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.62);
      line-height: 1.75;
      margin: 0 0 36px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 32px; }
    .hero-chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      font-size: 0.78rem;
      padding: 5px 12px; border-radius: 999px;
    }
    .chip mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; color: #6366f1; }

    /* Mockup */
    .mockup-wrap {
      flex: 1; max-width: 600px; position: relative;
      display: flex; justify-content: center;
    }
    .mockup {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
      position: relative;
    }
    .mockup-chrome {
      display: flex; align-items: center; gap: 7px;
      background: #1e293b; padding: 10px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .chrome-dot { width: 11px; height: 11px; border-radius: 50%; }
    .c-red    { background: #ff5f57; }
    .c-yellow { background: #febc2e; }
    .c-green  { background: #28c840; }
    .chrome-url {
      flex: 1; text-align: center;
      font-size: 0.72rem; color: rgba(255,255,255,0.3);
      font-family: monospace;
    }
    .mockup-ui { display: flex; background: #f1f5f9; }

    /* Mini sidebar */
    .m-sidebar {
      width: 52px; background: #0f172a;
      display: flex; flex-direction: column;
      align-items: center; padding: 12px 0; gap: 6px;
      flex-shrink: 0;
    }
    .m-logo { font-size: 1.4rem; margin-bottom: 10px; }
    .m-nav-item {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px; color: rgba(255,255,255,0.35);
    }
    .m-nav-item mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .m-active { background: rgba(99,102,241,0.25); color: #818cf8 !important; }

    /* Content pane */
    .m-content { flex: 1; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .m-kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
    .m-kpi { padding: 10px; border-radius: 8px; }
    .m-kpi.indigo { background: #ede9fe; }
    .m-kpi.purple { background: #f5f3ff; }
    .m-kpi.green  { background: #f0fdf4; }
    .m-kpi.amber  { background: #fffbeb; }
    .m-kv { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
    .m-kl { font-size: 0.65rem; color: #64748b; }
    .m-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .m-card { background: white; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0; }
    .m-card-title { font-size: 0.7rem; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .m-score-ring {
      width: 56px; height: 56px; border-radius: 50%;
      border: 6px solid #6366f1;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 10px;
      font-size: 0.85rem; font-weight: 800; color: #0f172a;
    }
    .m-bar-row { display: flex; align-items: center; gap: 6px; }
    .m-bar { flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .m-bar-fill { height: 100%; background: #6366f1; border-radius: 3px; }
    .m-bar-label { font-size: 0.65rem; color: #64748b; white-space: nowrap; }
    .m-deadline { display: flex; align-items: center; gap: 7px; font-size: 0.7rem; color: #475569; margin-bottom: 6px; }
    .m-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .m-dot.red   { background: #ef4444; }
    .m-dot.amber { background: #f59e0b; }
    .m-dot.green { background: #22c55e; }

    /* ═══ STATS BAR ═════════════════════════════════════════════════════════ */
    .stats-bar {
      display: flex; justify-content: center; flex-wrap: wrap;
      background: #0f172a; padding: 48px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .stat { text-align: center; padding: 0 56px; }
    .stat + .stat { border-left: 1px solid rgba(255,255,255,0.08); }
    .stat-val { font-size: 3rem; font-weight: 900; color: white; letter-spacing: -2px; }
    .stat-val-accent { color: #818cf8; }
    .stat-label { font-size: 0.875rem; color: rgba(255,255,255,0.45); margin-top: 4px; }

    /* ═══ SECTION COMMON ════════════════════════════════════════════════════ */
    .section { padding: 96px 56px; text-align: center; background: #f8fafc; }
    .section--dark { background: #0f172a; }
    .section-tag {
      display: inline-block;
      background: #ede9fe; color: #6366f1;
      font-size: 0.75rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      padding: 5px 16px; border-radius: 999px;
      margin-bottom: 16px;
    }
    .section-tag--light { background: rgba(99,102,241,0.18); color: #a5b4fc; }
    .section-h2 {
      font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight: 900;
      color: #0f172a; margin: 0 0 14px; letter-spacing: -1px;
    }
    .section-h2--light { color: white; }
    .section-p { color: #64748b; font-size: 1rem; line-height: 1.75; max-width: 560px; margin: 0 auto 56px; }

    /* ═══ FEATURES GRID ══════════════════════════════════════════════════════ */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
      gap: 22px; max-width: 1100px; margin: 0 auto; text-align: left;
    }
    .feat-card {
      background: white; border-radius: 16px; padding: 26px;
      border: 1px solid #e8eaf0;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    }
    .feat-card:hover {
      box-shadow: 0 12px 36px rgba(99,102,241,0.1);
      transform: translateY(-4px);
      border-color: #c7d2fe;
    }
    .feat-icon {
      width: 48px; height: 48px;
      background: #ede9fe;
      color: #6366f1;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .feat-icon mat-icon { font-size: 1.4rem; }
    .feat-card h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    .feat-card p { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.65; }

    /* ═══ AUTHORITY STRIP ════════════════════════════════════════════════════ */
    .auth-strip {
      background: white; padding: 32px 56px;
      border-top: 1px solid #e8eaf0; border-bottom: 1px solid #e8eaf0;
      text-align: center;
    }
    .auth-strip-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #94a3b8; display: block; margin-bottom: 18px;
    }
    .auth-badges { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
    .auth-badge {
      display: flex; align-items: center; gap: 8px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 10px 18px;
      font-size: 0.82rem; font-weight: 600; color: #1e293b;
    }
    .auth-badge mat-icon { color: #6366f1; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* ═══ HOW IT WORKS ═══════════════════════════════════════════════════════ */
    .steps-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 40px; max-width: 860px; margin: 0 auto;
    }
    .step { text-align: center; }
    .step-num {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white; font-size: 1.5rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 24px rgba(99,102,241,0.4);
    }
    .step h3 { font-size: 1.1rem; font-weight: 700; color: white; margin: 0 0 10px; }
    .step p  { font-size: 0.875rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin: 0; }

    /* ═══ DEMO CTA ════════════════════════════════════════════════════════════ */
    .demo-section { background: #f8fafc; padding: 96px 56px; border-top: 1px solid #e8eaf0; }
    .demo-inner {
      max-width: 1000px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
    }
    .demo-left .section-tag { margin-bottom: 14px; }
    .demo-left .section-h2 { text-align: left; }

    /* Credentials card */
    .creds-card {
      background: #0f172a; border-radius: 20px;
      padding: 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .creds-header {
      display: flex; align-items: center; gap: 8px;
      color: #a5b4fc; font-size: 0.85rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 20px;
    }
    .creds-header mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .creds-row { display: flex; gap: 0; align-items: stretch; }
    .cred-block { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 0 16px; }
    .cred-block:first-child { padding-left: 0; }
    .cred-block:last-child  { padding-right: 0; }
    .cred-role {
      display: inline-block;
      background: #6366f1; color: white;
      font-size: 0.68rem; font-weight: 700;
      padding: 3px 10px; border-radius: 5px;
      text-transform: uppercase; margin-bottom: 4px;
    }
    .cred-block code {
      display: block;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.82rem; color: rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.05); border-radius: 6px;
      padding: 5px 8px;
    }
    .creds-sep { width: 1px; background: rgba(255,255,255,0.08); margin: 4px 0; }
    .creds-note {
      display: flex; align-items: center; gap: 6px;
      margin: 18px 0 0;
      font-size: 0.75rem; color: rgba(255,255,255,0.3);
    }
    .creds-note mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }

    /* ═══ FOOTER ══════════════════════════════════════════════════════════════ */
    .footer { background: #090b15; padding: 48px 56px 32px; }
    .footer-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px;
    }
    .footer-brand { display: flex; align-items: center; gap: 14px; }
    .footer-shield { width: 40px; height: 40px; display: block; flex-shrink: 0; }
    .footer-name { font-size: 1.1rem; font-weight: 800; color: white; }
    .footer-desc { font-size: 0.8rem; color: rgba(255,255,255,0.35); margin-top: 3px; }
    .footer-links { display: flex; gap: 28px; }
    .footer-links a { color: rgba(255,255,255,0.45); font-size: 0.875rem; text-decoration: none; transition: color 0.15s; }
    .footer-links a:hover { color: white; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 20px;
      display: flex; justify-content: space-between;
      font-size: 0.78rem; color: rgba(255,255,255,0.25);
    }

    /* ═══ RESPONSIVE ══════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .hero { flex-direction: column; padding: 64px 32px; text-align: center; }
      .hero-inner { max-width: 100%; }
      .hero-chips { justify-content: center; }
      .hero-actions { justify-content: center; }
      .mockup-wrap { max-width: 100%; }
      .demo-inner { grid-template-columns: 1fr; gap: 40px; }
    }
    @media (max-width: 768px) {
      .nav { padding: 0 20px; }
      .nav-center { display: none; }
      .hero, .section, .demo-section { padding: 60px 24px; }
      .stats-bar { padding: 32px 24px; }
      .stat { padding: 16px 24px; }
      .stat + .stat { border-left: none; border-top: 1px solid rgba(255,255,255,0.08); }
      .auth-strip, .footer { padding: 32px 24px; }
      .footer-top { flex-direction: column; gap: 24px; }
      .footer-bottom { flex-direction: column; gap: 8px; }
      .m-two-col { grid-template-columns: 1fr; }
    }
  `],
})
export class LandingComponent {
  readonly features: Feature[] = [
    { icon: 'folder_special',    title: 'Secure Document Vault',    desc: 'AES-256 encrypted storage for contracts, payslips, and compliance files. Decrypt only on download.' },
    { icon: 'checklist_rtl',     title: 'RRA & RSSB Compliance',    desc: 'Live checklists for PAYE, VAT, RSSB, and labour law. Real-time compliance score in your dashboard.' },
    { icon: 'group',             title: 'Employee Records',          desc: 'Complete profiles with TIN, RSSB numbers, salary history, contracts, and role-based access.' },
    { icon: 'notifications_active', title: 'Smart Deadline Alerts', desc: 'Get notified before documents expire or filing deadlines pass — weeks in advance, not hours.' },
    { icon: 'description',       title: 'One-Click Audit Reports',   desc: 'Generate PDF reports for RRA or RSSB inspectors in seconds. No scrambling during audits.' },
    { icon: 'upload_file',       title: 'Excel / CSV Import',        desc: 'Bulk-import your existing employee data from spreadsheets in minutes, not days.' },
    { icon: 'manage_accounts',   title: 'Role-Based Access Control', desc: 'Admin, HR, Accountant, Auditor, Employee — everyone sees exactly what they should.' },
    { icon: 'history',           title: 'Immutable Audit Trail',     desc: 'Every action logged permanently. Show inspectors who changed what, when, and from where.' },
  ];

  readonly stats = [
    { value: '500+', label: 'SMEs onboarded worldwide' },
    { value: '150k+', label: 'Documents secured' },
    { value: '99.9%', label: 'Platform uptime' },
    { value: '0',     label: 'Compliance fines among clients' },
  ];

  readonly steps: Step[] = [
    { num: '1', title: 'Register your company', desc: 'Add your RDB number, TIN, and RSSB employer code. Takes under 5 minutes — no IT skills needed.' },
    { num: '2', title: 'Import your team',       desc: 'Upload an Excel file with your employees or add them one by one. Contracts and documents auto-linked.' },
    { num: '3', title: 'Stay permanently ready', desc: 'AuditShield tracks every deadline and alerts you early. You\'re always ready for any RRA or RSSB inspection.' },
  ];
}
