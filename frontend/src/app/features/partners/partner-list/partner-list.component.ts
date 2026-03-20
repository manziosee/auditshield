import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Partner {
  id: string;
  name: string;
  slug: string;
  contact_name: string;
  contact_email: string;
  companies_count: number;
  status: 'active' | 'inactive' | 'pending';
  brand_color: string;
  logo_url: string;
  platform_name: string;
}

@Component({
  selector: 'as-partner-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule,
    MatMenuModule, MatProgressSpinnerModule, MatTooltipModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Partner Management</h2>
          <p class="subtitle">Manage white-label partners and their configurations</p>
        </div>
        <button mat-raised-button class="btn-brand">
          <mat-icon>add</mat-icon> Add Partner
        </button>
      </div>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="partners()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Partner</th>
              <td mat-cell *matCellDef="let p">
                <div class="partner-cell">
                  <div class="partner-logo" [style.background]="p.brand_color || '#22c55e'">
                    {{ p.name[0] }}
                  </div>
                  <div>
                    <div class="partner-name">{{ p.name }}</div>
                    <div class="partner-platform">{{ p.platform_name }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="slug">
              <th mat-header-cell *matHeaderCellDef>Slug</th>
              <td mat-cell *matCellDef="let p"><code class="slug-code">{{ p.slug }}</code></td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let p">
                <div>{{ p.contact_name }}</div>
                <div class="contact-email">{{ p.contact_email }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="companies">
              <th mat-header-cell *matHeaderCellDef>Companies</th>
              <td mat-cell *matCellDef="let p">
                <span class="companies-badge">{{ p.companies_count }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="chip" [class]="statusClass(p.status)">{{ p.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="branding">
              <th mat-header-cell *matHeaderCellDef>Branding</th>
              <td mat-cell *matCellDef="let p">
                <div class="branding-preview">
                  <div class="color-swatch" [style.background]="p.brand_color || '#22c55e'" [matTooltip]="p.brand_color || '#22c55e'"></div>
                  @if (p.logo_url) {
                    <span class="logo-link">Logo set</span>
                  } @else {
                    <span class="no-logo">No logo</span>
                  }
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                  <button mat-menu-item><mat-icon>business</mat-icon> View Companies</button>
                  <button mat-menu-item><mat-icon>palette</mat-icon> Edit Branding</button>
                  <mat-divider />
                  <button mat-menu-item class="danger-item"><mat-icon>block</mat-icon> Suspend</button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="partner-row"></tr>
          </table>
        </div>
        @if (!loading() && partners().length === 0) {
          <div class="empty-state">
            <mat-icon>handshake</mat-icon>
            <h3>No partners yet</h3>
            <p>Add your first white-label partner to get started.</p>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); z-index:10; min-height:200px; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .partner-cell { display:flex; align-items:center; gap:10px; }
    .partner-logo { width:40px; height:40px; border-radius:10px; color:white; font-size:1rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .partner-name { font-weight:600; font-size:0.875rem; }
    .partner-platform { font-size:0.75rem; color:var(--text-muted); }
    .slug-code { font-family:monospace; font-size:0.8rem; background:rgba(0,0,0,0.08); padding:2px 8px; border-radius:6px; }
    .contact-email { font-size:0.75rem; color:var(--text-muted); }
    .companies-badge { background:rgba(34,197,94,0.12); color:#16a34a; padding:2px 10px; border-radius:12px; font-size:0.8rem; font-weight:700; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-green { background:rgba(34,197,94,0.12); color:#4ade80; }
    .chip-red { background:rgba(239,68,68,0.12); color:#f87171; }
    .chip-amber { background:rgba(234,179,8,0.12); color:#fbbf24; }
    .branding-preview { display:flex; align-items:center; gap:8px; }
    .color-swatch { width:20px; height:20px; border-radius:4px; border:1px solid rgba(255,255,255,0.15); cursor:pointer; flex-shrink:0; }
    .logo-link { font-size:0.75rem; color:#22c55e; font-weight:500; }
    .no-logo { font-size:0.75rem; color:var(--text-muted); }
    .danger-item { color:#dc2626 !important; }
    .partner-row:hover td { background:var(--surface-2) !important; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:2.5rem; height:2.5rem; width:2.5rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); }
    .empty-state p { margin:0; }
  `],
})
export class PartnerListComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  partners = signal<Partner[]>([]);
  loading  = signal(false);

  columns = ['name', 'slug', 'contact', 'companies', 'status', 'branding', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Partner[] } | Partner[]>('partners/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Partner[] }).results ?? [];
        this.partners.set(list);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.notify.error('Failed to load partners.'); },
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'chip chip-green', inactive: 'chip chip-red', pending: 'chip chip-amber',
    };
    return map[status] ?? 'chip';
  }
}
