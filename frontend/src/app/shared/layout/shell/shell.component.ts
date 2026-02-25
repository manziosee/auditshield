import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
        <!-- Logo row -->
        <div class="sidebar-logo">
          <img src="logo.svg" class="logo-mark" alt="AuditShield" />
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

        <!-- Demo mode pill -->
        @if (isDemo() && !sidebarCollapsed()) {
          <div class="demo-pill">
            <mat-icon>science</mat-icon>
            <span>Demo Mode</span>
          </div>
        }

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (item of visibleNavItems(); track item.route) {
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
        </nav>

        <!-- User panel -->
        <div class="sidebar-bottom">
          <div class="sidebar-divider"></div>
          <button class="user-panel" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}</div>
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
            <button mat-menu-item routerLink="/company">
              <mat-icon>business</mat-icon> Company Settings
            </button>
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
            <!-- Demo badge -->
            @if (isDemo()) {
              <span class="demo-badge">
                <mat-icon>science</mat-icon> Demo
              </span>
            }

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
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      transition: width 0.25s ease, min-width 0.25s ease, background-color 0.2s ease;
      position: relative;
      z-index: 50;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.04);
    }
    .sidebar.collapsed { width: 68px; min-width: 68px; }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 14px 16px;
      flex-shrink: 0;
    }
    .logo-mark {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      display: block;
    }
    .logo-text-group {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
    }
    .logo-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
      white-space: nowrap;
    }
    .logo-tagline {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
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

    /* Demo pill */
    .demo-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 12px 12px;
      padding: 6px 12px;
      background: rgba(99, 102, 241, 0.18);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #a5b4fc;
    }
    .demo-pill mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 4px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
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
      background: var(--sidebar-active-bg) !important;
      color: var(--sidebar-text-active) !important;
      font-weight: 600;
    }
    .nav-item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: var(--brand);
      border-radius: 0 3px 3px 0;
    }
    .nav-item--active .nav-icon mat-icon { color: #818cf8; }

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
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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
      height: 60px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--topbar-border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 12px;
      flex-shrink: 0;
      box-shadow: var(--topbar-shadow);
      z-index: 10;
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
      font-size: 0.8rem;
      color: var(--text-faint);
      font-weight: 500;
    }
    .breadcrumb-sep {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      color: var(--border-color);
    }
    .breadcrumb-page {
      font-size: 0.9rem;
      color: var(--text-primary);
      font-weight: 700;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .demo-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: var(--brand);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
    }
    .demo-badge mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; }

    .topbar-icon-btn {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      text-decoration: none;
      border: none;
      background: none;
    }
    .topbar-icon-btn:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
      text-decoration: none;
    }
    .topbar-icon-btn mat-icon { font-size: 1.25rem; }
    .topbar-icon-btn mat-icon.has-badge { color: var(--brand); }

    .theme-toggle-btn:hover { color: var(--brand) !important; }

    .icon-badge {
      position: absolute;
      top: 4px; right: 4px;
      width: 16px; height: 16px;
      background: #ef4444;
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .company-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .topbar-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand), var(--brand-dark));
      color: white;
      font-size: 0.78rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.15s;
    }
    .topbar-avatar:hover { opacity: 0.9; transform: scale(1.05); }

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
export class ShellComponent {
  readonly auth  = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen   = signal(false);
  readonly unreadCount      = signal(0);
  readonly isDemo           = signal(localStorage.getItem('as_demo') === 'true');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'dashboard',     route: '/dashboard' },
    { label: 'Employees',     icon: 'group',          route: '/employees',    roles: ['super_admin', 'admin', 'hr'] },
    { label: 'Documents',     icon: 'folder_open',    route: '/documents' },
    { label: 'Compliance',    icon: 'verified_user',  route: '/compliance' },
    { label: 'Reports',       icon: 'assessment',     route: '/reports' },
    { label: 'Notifications', icon: 'notifications',  route: '/notifications' },
    { label: 'Audit Logs',    icon: 'history',        route: '/audit-logs',   roles: ['super_admin', 'admin'] },
    { label: 'Company',       icon: 'business',       route: '/company',      roles: ['super_admin', 'admin'] },
  ];

  visibleNavItems(): NavItem[] {
    const role = this.auth.userRole();
    return this.navItems.filter(item => !item.roles || (role && item.roles.includes(role)));
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
    };
    const key = Object.keys(map).find(k => url.startsWith(k));
    return key ? map[key] : 'AuditShield';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
