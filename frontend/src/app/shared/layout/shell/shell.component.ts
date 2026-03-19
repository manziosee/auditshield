import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'as-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule,
    MatButtonModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="shell-root">
      <!-- ── Sidebar ───────────────────────────────────────────────────────── -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Decorative glow orb -->
        <div class="sidebar-glow" aria-hidden="true"></div>

        <!-- Logo row -->
        <div class="sidebar-logo">
          <div class="logo-mark-wrap">
            <img src="logo.svg" class="logo-mark" alt="AuditShield" />
          </div>
          @if (!sidebarCollapsed()) {
            <div class="logo-text-group">
              <span class="logo-name">AuditShield</span>
              <span class="logo-tagline">Compliance Platform</span>
            </div>
          }
          <button class="collapse-btn" (click)="toggleSidebar()" [title]="sidebarCollapsed() ? 'Expand' : 'Collapse'">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @if (!sidebarCollapsed()) {
            <div class="nav-section-label">Main</div>
          }
          @for (item of mainNavItems(); track item.route) {
            <a
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="nav-item--active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              [title]="sidebarCollapsed() ? item.label : ''"
            >
              <div class="nav-icon">
                <mat-icon>{{ item.icon }}</mat-icon>
                @if (item.badge && item.badge > 0) {
                  <span class="nav-dot"></span>
                }
              </div>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge && item.badge > 0) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              }
            </a>
          }
          @if (adminNavItems().length > 0) {
            @if (!sidebarCollapsed()) {
              <div class="nav-section-label" style="margin-top:12px">Management</div>
            } @else {
              <div class="nav-section-divider"></div>
            }
            @for (item of adminNavItems(); track item.route) {
              <a
                class="nav-item"
                [routerLink]="item.route"
                routerLinkActive="nav-item--active"
                [title]="sidebarCollapsed() ? item.label : ''"
              >
                <div class="nav-icon">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                @if (!sidebarCollapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            }
          }
        </nav>

        <!-- User panel -->
        <div class="sidebar-bottom">
          <div class="sidebar-divider"></div>
          <button class="user-panel" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}<span class="status-dot"></span></div>
            @if (!sidebarCollapsed()) {
              <div class="user-info">
                <span class="user-name">{{ auth.user()?.first_name }} {{ auth.user()?.last_name }}</span>
                <span class="user-role">{{ auth.user()?.role | titlecase }}</span>
              </div>
              <mat-icon class="user-chevron">expand_less</mat-icon>
            }
          </button>
          <mat-menu #userMenu="matMenu" yPosition="above">
            <div class="menu-user-header">
              <strong>{{ auth.user()?.full_name }}</strong>
              <span>{{ auth.user()?.email }}</span>
            </div>
            <mat-divider />
            <button mat-menu-item routerLink="/company" [queryParams]="{tab:'security'}">
              <mat-icon>shield</mat-icon> Profile &amp; Security
            </button>
            <button mat-menu-item routerLink="/company">
              <mat-icon>business</mat-icon> Company Settings
            </button>
            <mat-divider />
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Sign Out
            </button>
          </mat-menu>
        </div>
      </aside>

      <!-- ── Main area ─────────────────────────────────────────────────────── -->
      <div class="main-area">
        <!-- Topbar -->
        <header class="topbar">
          <!-- Mobile hamburger -->
          <button class="mobile-menu-btn" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
            <mat-icon>menu</mat-icon>
          </button>

          <!-- Page breadcrumb -->
          <div class="topbar-breadcrumb">
            <span class="breadcrumb-app">AuditShield</span>
            <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
            <span class="breadcrumb-page">{{ currentPageTitle() }}</span>
          </div>

          <div class="topbar-right">
            <!-- Notifications -->
            <a routerLink="/notifications" class="topbar-icon-btn" title="Notifications">
              <mat-icon [class.has-badge]="unreadCount() > 0">notifications</mat-icon>
              @if (unreadCount() > 0) {
                <span class="icon-badge">{{ unreadCount() }}</span>
              }
            </a>

            <!-- Theme toggle -->
            <button
              class="topbar-icon-btn theme-toggle-btn"
              (click)="theme.toggle()"
              [title]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <!-- Company name -->
            <span class="company-name">{{ auth.user()?.company_name }}</span>

            <!-- Avatar -->
            <button class="topbar-avatar" [matMenuTriggerFor]="topMenu">
              {{ userInitials() }}
            </button>
            <mat-menu #topMenu="matMenu">
              <button mat-menu-item routerLink="/company">
                <mat-icon>settings</mat-icon> Settings
              </button>
              <button mat-menu-item (click)="theme.toggle()">
                <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
                {{ theme.isDark() ? 'Light Mode' : 'Dark Mode' }}
              </button>
              <mat-divider />
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page content -->
        <main class="content-area">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile overlay -->
      @if (mobileMenuOpen()) {
        <div class="mobile-overlay" (click)="mobileMenuOpen.set(false)">
          <aside class="sidebar sidebar--mobile">
            <div class="sidebar-logo">
              <img src="logo.svg" class="logo-mark" alt="AuditShield" />
              <div class="logo-text-group">
                <span class="logo-name">AuditShield</span>
              </div>
              <button class="collapse-btn" (click)="mobileMenuOpen.set(false)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <nav class="sidebar-nav">
              @for (item of visibleNavItems(); track item.route) {
                <a
                  class="nav-item"
                  [routerLink]="item.route"
                  routerLinkActive="nav-item--active"
                  (click)="mobileMenuOpen.set(false)"
                >
                  <div class="nav-icon"><mat-icon>{{ item.icon }}</mat-icon></div>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              }
            </nav>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Layout root ─────────────────────────────────────────────────────────── */
    .shell-root {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--surface-bg);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       SIDEBAR
    ═══════════════════════════════════════════════════════════════════════════ */
    .sidebar {
      width: 256px;
      min-width: 256px;
      background: linear-gradient(180deg, #080c09 0%, #0b1009 50%, #0d1610 100%);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      transition: width 0.25s ease, min-width 0.25s ease;
      position: relative;
      z-index: 50;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.04);
    }
    .sidebar.collapsed { width: 68px; min-width: 68px; }

    /* Decorative glow orb */
    .sidebar-glow {
      position: absolute;
      top: -60px; right: -80px;
      width: 260px; height: 260px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 68%);
      pointer-events: none;
      z-index: 0;
    }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 14px 16px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 4px;
    }
    .logo-mark-wrap {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(34,197,94,0.28), rgba(22,163,74,0.18));
      border: 1px solid rgba(74,222,128,0.22);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 0 1px rgba(34,197,94,0.3), 0 4px 16px rgba(34,197,94,0.2);
    }
    .logo-mark {
      width: 22px; height: 22px;
      flex-shrink: 0; display: block;
      filter: drop-shadow(0 0 5px rgba(34,197,94,0.7)) brightness(1.4) saturate(1.8);
    }
    .logo-text-group {
      display: flex; flex-direction: column;
      overflow: hidden; flex: 1;
    }
    .logo-name {
      font-size: 1.1rem; font-weight: 900; letter-spacing: -0.5px; white-space: nowrap;
      background: linear-gradient(135deg, #ffffff 0%, #d1fae5 55%, #4ade80 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .logo-tagline {
      font-size: 0.62rem;
      color: rgba(74, 222, 128, 0.45);
      text-transform: uppercase;
      letter-spacing: 0.09em;
      white-space: nowrap;
      font-family: var(--font-display);
    }
    .collapse-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
      margin-left: auto;
    }
    .collapse-btn:hover { color: white; background: rgba(255, 255, 255, 0.08); }
    .collapse-btn mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 4px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      position: relative;
      z-index: 1;
    }
    .sidebar-nav::-webkit-scrollbar { width: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 10px;
      color: var(--sidebar-text);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.15s, color 0.15s;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-item:hover {
      background: var(--sidebar-hover);
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
    }
    .nav-item--active {
      background: linear-gradient(90deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06)) !important;
      color: var(--sidebar-text-active) !important;
      font-weight: 600;
      box-shadow: inset 0 1px 0 rgba(74,222,128,0.10), inset 0 -1px 0 rgba(34,197,94,0.06);
    }
    .nav-item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: linear-gradient(180deg, #4ade80, #22c55e);
      border-radius: 0 3px 3px 0;
      box-shadow: 0 0 8px rgba(34,197,94,0.6);
    }
    .nav-item--active .nav-icon mat-icon { color: #4ade80; }

    .nav-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
      padding: 4px 10px 6px;
      margin-top: 4px;
      font-family: var(--font-display);
    }
    .nav-section-divider {
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin: 10px 6px;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    .nav-icon mat-icon { font-size: 1.25rem; width: 1.25rem; height: 1.25rem; }
    .nav-dot {
      position: absolute;
      top: -2px; right: -2px;
      width: 6px; height: 6px;
      background: #ef4444;
      border-radius: 50%;
    }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--brand);
      color: white;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    /* Sidebar bottom / user */
    .sidebar-bottom { padding: 8px 10px 12px; flex-shrink: 0; }
    .sidebar-divider { height: 1px; background: rgba(255, 255, 255, 0.07); margin-bottom: 10px; }
    .user-panel {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      background: none;
      border: none;
      padding: 8px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
    }
    .user-panel:hover { background: var(--sidebar-hover); }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #052e16;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 0 0 2px #22c55e, 0 2px 8px rgba(0,0,0,0.3);
    }
    .status-dot {
      position: absolute;
      bottom: 0; right: 0;
      width: 9px; height: 9px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid #0b1009;
    }
    .user-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role { font-size: 0.68rem; color: rgba(255, 255, 255, 0.4); }
    .user-chevron {
      color: rgba(255, 255, 255, 0.25) !important;
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
    }

    /* User menu popup */
    .menu-user-header {
      padding: 12px 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 4px;
    }
    .menu-user-header strong { font-size: 0.875rem; color: var(--text-primary); }
    .menu-user-header span   { font-size: 0.78rem;  color: var(--text-muted); }

    /* ═══════════════════════════════════════════════════════════════════════════
       TOPBAR
    ═══════════════════════════════════════════════════════════════════════════ */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }
    .topbar {
      height: 62px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--topbar-border);
      display: flex;
      align-items: center;
      padding: 0 28px;
      gap: 12px;
      flex-shrink: 0;
      z-index: 10;
      box-shadow: 0 1px 0 var(--topbar-border), 0 2px 8px rgba(0,0,0,0.04);
      position: relative;
    }
    .topbar::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.15) 30%, rgba(34,197,94,0.3) 50%, rgba(34,197,94,0.15) 70%, transparent 100%);
      pointer-events: none;
    }
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      color: var(--text-muted);
    }
    .mobile-menu-btn:hover { background: var(--surface-hover); }
    .topbar-breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
    }
    .breadcrumb-app {
      font-size: 0.75rem;
      color: var(--text-faint);
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .breadcrumb-sep {
      font-size: 0.9rem !important;
      width: 0.9rem !important;
      height: 0.9rem !important;
      color: var(--border-color);
      opacity: 0.6;
    }
    .breadcrumb-page {
      font-size: 0.88rem;
      color: var(--text-primary);
      font-weight: 700;
      font-family: var(--font-display);
      letter-spacing: -0.01em;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .topbar-icon-btn {
      position: relative;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s, transform 0.12s;
      text-decoration: none;
      border: 1px solid transparent;
      background: none;
    }
    .topbar-icon-btn:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
      border-color: var(--border-subtle);
      text-decoration: none;
      transform: scale(1.05);
    }
    .topbar-icon-btn mat-icon { font-size: 1.2rem; }
    .topbar-icon-btn mat-icon.has-badge { color: #22c55e; }

    .theme-toggle-btn:hover { color: #22c55e !important; }

    .icon-badge {
      position: absolute;
      top: 3px; right: 3px;
      min-width: 16px; height: 16px;
      background: #ef4444;
      color: white;
      font-size: 0.58rem;
      font-weight: 800;
      border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px;
      box-shadow: 0 0 0 2px var(--topbar-bg);
    }
    .company-name {
      font-size: 0.78rem; font-weight: 600;
      color: var(--text-muted);
      max-width: 140px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      background: var(--surface-hover);
      border: 1px solid var(--border-subtle);
      padding: 4px 10px; border-radius: 999px;
    }
    .topbar-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #052e16 !important;
      font-size: 0.75rem; font-weight: 800;
      font-family: var(--font-display);
      border: 2px solid rgba(34,197,94,0.35);
      cursor: pointer;
      box-shadow: 0 0 0 2px rgba(34,197,94,0.15);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .topbar-avatar:hover {
      transform: scale(1.08);
      box-shadow: 0 0 0 3px rgba(34,197,94,0.3);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       CONTENT
    ═══════════════════════════════════════════════════════════════════════════ */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      background: var(--surface-bg);
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       MOBILE OVERLAY
    ═══════════════════════════════════════════════════════════════════════════ */
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 200;
      display: flex;
    }
    .sidebar--mobile {
      position: relative;
      z-index: 201;
      animation: slideIn 0.2s ease;
      box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
    }
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }

    /* ═══════════════════════════════════════════════════════════════════════════
       RESPONSIVE
    ═══════════════════════════════════════════════════════════════════════════ */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .mobile-menu-btn { display: flex; }
      .content-area { padding: 16px; }
      .company-name { display: none; }
      .topbar { padding: 0 16px; }
    }
  `],
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth  = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly api    = inject(ApiService);

  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen   = signal(false);
  readonly unreadCount      = signal(0);

  private pollInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.refreshUnreadCount();
    this.pollInterval = setInterval(() => this.refreshUnreadCount(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  private refreshUnreadCount(): void {
    this.api.get<{ unread_count: number }>('notifications/unread-count/').subscribe({
      next: (res) => this.unreadCount.set(res.unread_count ?? 0),
      error: () => {},
    });
  }

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard',     route: '/dashboard' },
    { label: 'Employees',     icon: 'group',          route: '/employees',    roles: ['super_admin', 'admin', 'hr'] },
    { label: 'Documents',     icon: 'folder_open',    route: '/documents' },
    { label: 'Compliance',    icon: 'verified_user',  route: '/compliance' },
    { label: 'Reports',       icon: 'assessment',     route: '/reports' },
    { label: 'Notifications', icon: 'notifications',  route: '/notifications' },
    { label: 'Audit Logs',    icon: 'history',        route: '/audit-logs',   roles: ['super_admin', 'admin'] },
    { label: 'Company',       icon: 'business',       route: '/company',      roles: ['super_admin', 'admin'] },
    { label: 'Portfolio',     icon: 'corporate_fare', route: '/portfolio',    roles: ['super_admin'] },
    { label: 'My Portal',     icon: 'person',         route: '/self-service', roles: ['employee', 'hr', 'accountant', 'auditor'] },
  ];

  visibleNavItems(): NavItem[] {
    const role = this.auth.userRole();
    return this.navItems.filter(item => !item.roles || (role && item.roles.includes(role)));
  }

  mainNavItems(): NavItem[] {
    return this.visibleNavItems().filter(item =>
      !['audit-logs', 'company', 'portfolio'].some(r => item.route.includes(r))
    );
  }

  adminNavItems(): NavItem[] {
    return this.visibleNavItems().filter(item =>
      ['audit-logs', 'company', 'portfolio'].some(r => item.route.includes(r))
    );
  }

  userInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
  }

  currentPageTitle(): string {
    const url = this.router.url.split('?')[0];
    const map: Record<string, string> = {
      '/dashboard':     'Dashboard',
      '/employees':     'Employees',
      '/documents':     'Documents',
      '/compliance':    'Compliance',
      '/reports':       'Reports',
      '/notifications': 'Notifications',
      '/audit-logs':    'Audit Logs',
      '/company':       'Company Settings',
      '/portfolio':     'Portfolio',
      '/self-service':  'My Portal',
    };
    const key = Object.keys(map).find(k => url.startsWith(k));
    return key ? map[key] : 'AuditShield';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
