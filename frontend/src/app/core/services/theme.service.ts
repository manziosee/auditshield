import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

export interface ChartThemeColors {
  gridColor: string;
  tickColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipTitle: string;
  tooltipBody: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'as_theme';

  readonly theme = signal<Theme>(this.loadInitialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  readonly chartColors = computed<ChartThemeColors>(() => {
    const dark = this.isDark();
    return {
      gridColor:    dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
      tickColor:    dark ? '#64748b'                : '#94a3b8',
      tooltipBg:    dark ? '#0d1525'                : '#ffffff',
      tooltipBorder:dark ? '#1e293b'                : '#e2e8f0',
      tooltipTitle: dark ? '#f1f5f9'                : '#0f172a',
      tooltipBody:  dark ? '#94a3b8'                : '#64748b',
    };
  });

  constructor() {
    // Apply theme class reactively
    effect(() => {
      const isDark = this.isDark();
      const html = this.doc.documentElement;
      if (isDark) {
        html.classList.add('dark-theme');
        html.classList.remove('light-theme');
      } else {
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
      }
      localStorage.setItem(this.STORAGE_KEY, this.theme());
    });
  }

  toggle(): void {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private loadInitialTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (stored === 'dark' || stored === 'light') return stored;
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }
}
