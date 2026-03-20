import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  is_connected: boolean;
  last_synced_at: string | null;
  config_fields: Array<{ key: string; label: string; type: string; value: string }>;
}

@Component({
  selector: 'as-integration-hub',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">Integration Hub</h2>
          <p class="subtitle">Connect your tools to AuditShield</p>
        </div>
      </div>

      <!-- Connected count -->
      <div class="connected-summary">
        <mat-icon style="color:#22c55e">link</mat-icon>
        <span>{{ connectedCount() }} of {{ integrations().length }} integrations connected</span>
      </div>

      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="40" /></div>
      }

      <div class="integrations-grid">
        @for (integration of integrations(); track integration.id) {
          <mat-card class="integration-card" [class.connected]="integration.is_connected">
            <div class="card-top">
              <div class="integration-emoji">{{ integration.emoji }}</div>
              <span class="status-badge" [class]="integration.is_connected ? 'connected-badge' : 'disconnected-badge'">
                <mat-icon class="status-dot-icon">{{ integration.is_connected ? 'circle' : 'radio_button_unchecked' }}</mat-icon>
                {{ integration.is_connected ? 'Connected' : 'Not Connected' }}
              </span>
            </div>
            <div class="integration-name">{{ integration.name }}</div>
            <div class="integration-category">{{ integration.category }}</div>
            <p class="integration-desc">{{ integration.description }}</p>
            @if (integration.is_connected && integration.last_synced_at) {
              <div class="last-sync">
                <mat-icon class="sync-icon">sync</mat-icon>
                Last synced {{ integration.last_synced_at | date:'short' }}
              </div>
            }
            <div class="card-actions">
              @if (integration.is_connected) {
                <button mat-stroked-button class="sync-btn" (click)="syncNow(integration)" [disabled]="syncing() === integration.id">
                  @if (syncing() === integration.id) { <mat-spinner diameter="16" /> }
                  @else { <mat-icon>sync</mat-icon> }
                  Sync Now
                </button>
                <button mat-stroked-button class="disconnect-btn" (click)="disconnect(integration)">
                  <mat-icon>link_off</mat-icon> Disconnect
                </button>
              } @else {
                <button mat-raised-button class="btn-brand" (click)="openConfig(integration)">
                  <mat-icon>add_link</mat-icon> Connect
                </button>
              }
            </div>

            <!-- Config Panel -->
            @if (configOpen() === integration.id) {
              <div class="config-panel">
                <div class="config-title">Configure {{ integration.name }}</div>
                @for (field of integration.config_fields; track field.key) {
                  <div class="config-field">
                    <label class="config-label">{{ field.label }}</label>
                    <input
                      class="config-input"
                      [type]="field.type === 'password' ? 'password' : 'text'"
                      [(ngModel)]="field.value"
                      [placeholder]="'Enter ' + field.label"
                    />
                  </div>
                }
                <div class="config-actions">
                  <button mat-raised-button class="btn-brand" (click)="connectIntegration(integration)">
                    <mat-icon>check</mat-icon> Save & Connect
                  </button>
                  <button mat-stroked-button (click)="configOpen.set(null)">Cancel</button>
                </div>
              </div>
            }
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 2px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); letter-spacing:-0.03em; }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .connected-summary { display:flex; align-items:center; gap:8px; font-size:0.875rem; color:var(--text-secondary); font-weight:500; }
    .center-spin { display:flex; justify-content:center; padding:60px; }
    .integrations-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .integration-card { padding:20px !important; border-radius:16px !important; border:1px solid var(--border-color) !important; background:var(--surface-1) !important; display:flex; flex-direction:column; gap:10px; transition:border-color 0.2s; }
    .integration-card.connected { border-color:rgba(34,197,94,0.3) !important; }
    .card-top { display:flex; align-items:center; justify-content:space-between; }
    .integration-emoji { font-size:2.2rem; line-height:1; }
    .status-badge { display:flex; align-items:center; gap:4px; padding:3px 8px; border-radius:10px; font-size:0.72rem; font-weight:600; }
    .connected-badge { background:rgba(34,197,94,0.12); color:#4ade80; }
    .disconnected-badge { background:rgba(0,0,0,0.06); color:var(--text-muted); }
    .status-dot-icon { font-size:0.7rem; height:0.7rem; width:0.7rem; }
    .integration-name { font-weight:700; font-size:1rem; color:var(--text-primary); font-family:'Outfit',sans-serif; }
    .integration-category { font-size:0.72rem; color:#22c55e; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
    .integration-desc { margin:0; font-size:0.82rem; color:var(--text-muted); line-height:1.5; flex:1; }
    .last-sync { display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--text-muted); }
    .sync-icon { font-size:0.9rem; height:0.9rem; width:0.9rem; }
    .card-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color: var(--brand-mid) !important; font-weight:700 !important; font-size:0.8rem !important; }
    .sync-btn { color:#22c55e !important; border-color:rgba(34,197,94,0.3) !important; font-size:0.8rem !important; }
    .disconnect-btn { color:#dc2626 !important; border-color:rgba(220,38,38,0.2) !important; font-size:0.8rem !important; }
    .config-panel { border-top:1px solid var(--border-color); padding-top:14px; display:flex; flex-direction:column; gap:10px; margin-top:4px; }
    .config-title { font-weight:600; font-size:0.875rem; color:var(--text-primary); }
    .config-field { display:flex; flex-direction:column; gap:4px; }
    .config-label { font-size:0.75rem; color:var(--text-muted); font-weight:500; }
    .config-input { padding:8px 10px; border-radius:8px; border:1px solid var(--border-color); background:var(--surface-2); color:var(--text-primary); font-size:0.875rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; }
    .config-input:focus { border-color:#22c55e; }
    .config-actions { display:flex; gap:8px; }
    @media(max-width:600px) { .integrations-grid { grid-template-columns:1fr; } }
  `],
})
export class IntegrationHubComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);

  integrations = signal<Integration[]>([]);
  loading      = signal(false);
  syncing      = signal<string | null>(null);
  configOpen   = signal<string | null>(null);

  connectedCount(): number {
    return this.integrations().filter(i => i.is_connected).length;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.get<{ results: Integration[] } | Integration[]>('integrations/').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as { results: Integration[] }).results ?? [];
        this.integrations.set(list.length ? list : this.defaultIntegrations());
        this.loading.set(false);
      },
      error: () => {
        this.integrations.set(this.defaultIntegrations());
        this.loading.set(false);
      },
    });
  }

  defaultIntegrations(): Integration[] {
    return [
      { id: 'quickbooks', name: 'QuickBooks', description: 'Sync financial data and payroll records for tax compliance.', category: 'Accounting', emoji: '📊', is_connected: false, last_synced_at: null, config_fields: [{ key: 'api_key', label: 'API Key', type: 'password', value: '' }, { key: 'company_id', label: 'Company ID', type: 'text', value: '' }] },
      { id: 'bamboo', name: 'BambooHR', description: 'Import employee data and HR records automatically.', category: 'HR', emoji: '🌿', is_connected: false, last_synced_at: null, config_fields: [{ key: 'subdomain', label: 'Subdomain', type: 'text', value: '' }, { key: 'api_key', label: 'API Key', type: 'password', value: '' }] },
      { id: 'xero', name: 'Xero', description: 'Sync accounting and payroll data for financial compliance.', category: 'Accounting', emoji: '💙', is_connected: false, last_synced_at: null, config_fields: [{ key: 'client_id', label: 'Client ID', type: 'text', value: '' }, { key: 'client_secret', label: 'Client Secret', type: 'password', value: '' }] },
      { id: 'google', name: 'Google Workspace', description: 'Sync users and enable Google SSO for your team.', category: 'Identity', emoji: '🔵', is_connected: false, last_synced_at: null, config_fields: [{ key: 'domain', label: 'Domain', type: 'text', value: '' }, { key: 'service_account', label: 'Service Account JSON', type: 'text', value: '' }] },
      { id: 'slack', name: 'Slack', description: 'Receive compliance alerts and reminders in Slack channels.', category: 'Notifications', emoji: '💬', is_connected: false, last_synced_at: null, config_fields: [{ key: 'webhook_url', label: 'Webhook URL', type: 'text', value: '' }, { key: 'channel', label: 'Channel Name', type: 'text', value: '' }] },
    ];
  }

  openConfig(integration: Integration): void {
    this.configOpen.set(this.configOpen() === integration.id ? null : integration.id);
  }

  connectIntegration(integration: Integration): void {
    const config = integration.config_fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {} as Record<string, string>);
    this.api.post(`integrations/${integration.id}/connect/`, config).subscribe({
      next: () => {
        this.notify.success(`${integration.name} connected.`);
        this.configOpen.set(null);
        this.load();
      },
      error: () => {
        integration.is_connected = true;
        integration.last_synced_at = new Date().toISOString();
        this.configOpen.set(null);
        this.integrations.update(list => [...list]);
        this.notify.success(`${integration.name} connected (demo mode).`);
      },
    });
  }

  syncNow(integration: Integration): void {
    this.syncing.set(integration.id);
    this.api.post(`integrations/${integration.id}/sync/`, {}).subscribe({
      next: () => { this.notify.success(`${integration.name} sync started.`); this.syncing.set(null); this.load(); },
      error: () => { this.syncing.set(null); this.notify.error('Sync failed.'); },
    });
  }

  disconnect(integration: Integration): void {
    if (!confirm(`Disconnect ${integration.name}?`)) return;
    this.api.post(`integrations/${integration.id}/disconnect/`, {}).subscribe({
      next: () => { this.notify.success(`${integration.name} disconnected.`); this.load(); },
      error: () => {
        integration.is_connected = false;
        this.integrations.update(list => [...list]);
        this.notify.success(`${integration.name} disconnected (demo mode).`);
      },
    });
  }
}
