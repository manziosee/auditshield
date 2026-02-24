import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

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
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidebar"
      >
        <!-- Logo -->
        <div class="sidebar-logo">
          <span class="logo-icon">🛡️</span>
          <span class="logo-text">AuditShield</span>
        </div>
        <mat-divider />

        <!-- Navigation -->
        <mat-nav-list class="nav-list">
          @for (item of visibleNavItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active-nav"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              [matTooltip]="item.label"
              matTooltipPosition="right"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
              @if (item.badge) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </a>
          }
        </mat-nav-list>

        <!-- User panel at bottom -->
        <div class="sidebar-footer">
          <mat-divider />
          <div class="user-info" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ auth.user()?.full_name }}</span>
              <span class="user-role">{{ auth.user()?.role | titlecase }}</span>
            </div>
          </div>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/company">
              <mat-icon>business</mat-icon> Company Settings
            </button>
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </mat-menu>
        </div>
      </mat-sidenav>

      <!-- ── Main content ────────────────────────────────────────────────────── -->
      <mat-sidenav-content class="main-content">
        <mat-toolbar class="topbar" color="primary">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle menu">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="topbar-title">{{ pageTitle() }}</span>
          <span class="spacer"></span>
          <!-- Notifications bell -->
          <button mat-icon-button routerLink="/notifications" matTooltip="Notifications">
            <mat-icon [matBadge]="unreadCount() || null" matBadgeColor="warn">notifications</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }

    .sidebar {
      width: 260px;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      font-size: 1.3rem;
      font-weight: 700;
      color: white;
    }

    .logo-icon { font-size: 1.8rem; }

    .nav-list { flex: 1; padding-top: 8px; }

    .nav-list a {
      color: #94a3b8;
      border-radius: 8px;
      margin: 2px 8px;
      transition: background 0.2s;
    }

    .nav-list a:hover { background: rgba(255,255,255,0.08); color: white; }
    .nav-list a.active-nav { background: #3b82f6; color: white; }

    .nav-badge {
      background: #ef4444;
      color: white;
      border-radius: 10px;
      padding: 1px 7px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .sidebar-footer {
      padding: 8px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 8px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .user-info:hover { background: rgba(255,255,255,0.08); }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .user-details { display: flex; flex-direction: column; overflow: hidden; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.72rem; color: #94a3b8; text-transform: capitalize; }

    .topbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .topbar-title { font-size: 1.1rem; font-weight: 600; margin-left: 8px; }
    .spacer { flex: 1; }

    .content-area { padding: 24px; min-height: calc(100vh - 64px); background: #f8fafc; }
  `],
})
export class ShellComponent {
  readonly auth = inject(AuthService);

  readonly isMobile = signal(window.innerWidth < 768);
  readonly unreadCount = signal(0);
  readonly pageTitle = signal('Dashboard');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',    route: '/dashboard' },
    { label: 'Employees',    icon: 'group',         route: '/employees',    roles: ['super_admin', 'admin', 'hr'] },
    { label: 'Documents',    icon: 'folder',        route: '/documents' },
    { label: 'Compliance',   icon: 'verified',      route: '/compliance' },
    { label: 'Reports',      icon: 'assessment',    route: '/reports' },
    { label: 'Notifications',icon: 'notifications', route: '/notifications' },
    { label: 'Audit Logs',   icon: 'history',       route: '/audit-logs',   roles: ['super_admin', 'admin'] },
    { label: 'Company',      icon: 'business',      route: '/company',      roles: ['super_admin', 'admin'] },
  ];

  visibleNavItems() {
    const role = this.auth.userRole();
    return this.navItems.filter((item) =>
      !item.roles || (role && item.roles.includes(role)),
    );
  }

  userInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();
  }
}
