import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthResponse, LoginCredentials, User } from '../models/auth.models';

const TOKEN_KEY = 'as_access';
const REFRESH_KEY = 'as_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // Angular signals for reactive auth state
  private readonly _user = signal<User | null>(this.loadUserFromStorage());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly userRole = computed(() => this._user()?.role ?? null);
  readonly companyId = computed(() => this._user()?.company ?? null);

  login(credentials: LoginCredentials) {
    return this.api.post<AuthResponse>('auth/login/', credentials).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.access);
        localStorage.setItem(REFRESH_KEY, res.refresh);
        localStorage.setItem('as_user', JSON.stringify(res.user));
        this._user.set(res.user);
      }),
    );
  }

  /** Activate demo mode: no API call, stores fake tokens + sets the demo flag. */
  loginDemo(user: User): void {
    const ts = Date.now();
    localStorage.setItem(TOKEN_KEY, `demo-access-${ts}`);
    localStorage.setItem(REFRESH_KEY, `demo-refresh-${ts}`);
    localStorage.setItem('as_user', JSON.stringify(user));
    localStorage.setItem('as_demo', 'true');
    this._user.set(user);
  }

  logout(): void {
    const refresh = localStorage.getItem(REFRESH_KEY);
    const isDemo = localStorage.getItem('as_demo') === 'true';
    if (refresh && !isDemo) {
      this.api.post('auth/logout/', { refresh }).subscribe({ error: () => {} });
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('as_user');
    localStorage.removeItem('as_demo');
    this._user.set(null);
    this.router.navigate(['/landing']);
  }

  refreshToken() {
    const refresh = localStorage.getItem(REFRESH_KEY);
    return this.api.post<{ access: string }>('auth/refresh/', { refresh }).pipe(
      tap((res) => localStorage.setItem(TOKEN_KEY, res.access)),
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(...roles: string[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }

  canManageEmployees(): boolean {
    return this.hasRole('super_admin', 'admin', 'hr');
  }

  canManageFinance(): boolean {
    return this.hasRole('super_admin', 'admin', 'accountant');
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('as_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
