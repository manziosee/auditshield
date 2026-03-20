import {
  Component, inject, OnInit, signal, AfterViewInit,
  ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'declined';
  signed_at: string | null;
}

interface SignatureRequestDetail {
  id: string;
  title: string;
  document_name: string;
  document_id: string;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  expires_at: string;
  created_at: string;
  signers: Signer[];
  message?: string;
}

@Component({
  selector: 'as-signature-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="center-spin"><mat-spinner diameter="48" /></div>
      }
      @if (!loading() && request()) {
        <div class="page-header">
          <div>
            <h2 class="page-title">{{ request()!.title }}</h2>
            <p class="subtitle">
              <mat-icon class="inline-icon">description</mat-icon>
              {{ request()!.document_name }}
              <span class="chip" [class]="statusClass(request()!.status)">{{ request()!.status | titlecase }}</span>
            </p>
          </div>
          <div class="header-meta">
            <span class="meta-label">Expires</span>
            <span class="meta-value">{{ request()!.expires_at | date:'mediumDate' }}</span>
          </div>
        </div>

        @if (request()!.message) {
          <mat-card class="info-card">
            <div class="card-section-title"><mat-icon>message</mat-icon> Message to Signers</div>
            <p class="message-text">{{ request()!.message }}</p>
          </mat-card>
        }

        <!-- Signers list -->
        <mat-card class="signers-card">
          <div class="card-section-title"><mat-icon>group</mat-icon> Signers ({{ request()!.signers.length }})</div>
          <div class="signers-list">
            @for (signer of request()!.signers; track signer.id) {
              <div class="signer-row">
                <div class="signer-avatar">{{ initials(signer.name) }}</div>
                <div class="signer-info">
                  <div class="signer-name">{{ signer.name }}</div>
                  <div class="signer-email">{{ signer.email }}</div>
                  <div class="signer-role">{{ signer.role }}</div>
                </div>
                <div class="signer-status">
                  <span class="chip" [class]="signerStatusClass(signer.status)">{{ signer.status | titlecase }}</span>
                  @if (signer.signed_at) {
                    <div class="signed-at">{{ signer.signed_at | date:'short' }}</div>
                  }
                </div>
              </div>
            }
          </div>
        </mat-card>

        <!-- Signature Pad -->
        @if (request()!.status !== 'completed' && request()!.status !== 'expired') {
          <mat-card class="sig-pad-card">
            <div class="card-section-title"><mat-icon>draw</mat-icon> Your Signature</div>
            <p class="pad-hint">Draw your signature below using mouse or touch</p>
            <div class="canvas-container">
              <canvas #sigCanvas width="640" height="200" class="sig-canvas"
                (mousedown)="startDraw($event)"
                (mousemove)="draw($event)"
                (mouseup)="stopDraw()"
                (mouseleave)="stopDraw()"
                (touchstart)="startDrawTouch($event)"
                (touchmove)="drawTouch($event)"
                (touchend)="stopDraw()"
              ></canvas>
            </div>
            <div class="pad-actions">
              <button mat-stroked-button (click)="clearCanvas()">
                <mat-icon>refresh</mat-icon> Clear
              </button>
              <button mat-raised-button class="btn-brand" (click)="submitSignature()" [disabled]="saving() || !hasSig()">
                @if (saving()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px" /> }
                @else { <mat-icon>draw</mat-icon> }
                Sign Document
              </button>
            </div>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; max-width:900px; }
    .center-spin { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; }
    .page-title { margin:0 0 4px; font-size:1.5rem; font-weight:800; font-family:'Outfit',sans-serif; color:var(--text-primary); }
    .subtitle { margin:0; display:flex; align-items:center; gap:8px; color:var(--text-muted); font-size:0.875rem; }
    .inline-icon { font-size:1rem; height:1rem; width:1rem; color:#22c55e; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-amber { background:#fef9c3; color:#a16207; }
    .chip-blue { background:#dbeafe; color:#1d4ed8; }
    .chip-green { background:#dcfce7; color:#16a34a; }
    .chip-red { background:#fee2e2; color:#dc2626; }
    .header-meta { display:flex; flex-direction:column; align-items:flex-end; }
    .meta-label { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; }
    .meta-value { font-size:0.95rem; font-weight:600; color:var(--text-primary); }
    .info-card, .signers-card, .sig-pad-card { padding:20px !important; }
    .card-section-title { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; font-family:'Outfit',sans-serif; color:var(--text-primary); margin-bottom:14px; }
    .card-section-title mat-icon { color:#22c55e; font-size:1.2rem; height:1.2rem; width:1.2rem; }
    .message-text { margin:0; color:var(--text-secondary); line-height:1.6; }
    .signers-list { display:flex; flex-direction:column; gap:12px; }
    .signer-row { display:flex; align-items:center; gap:14px; padding:12px; border-radius:12px; background:var(--surface-2); border:1px solid var(--border-color); }
    .signer-avatar { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); color:#052e16; font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .signer-info { flex:1; }
    .signer-name { font-weight:600; font-size:0.9rem; color:var(--text-primary); }
    .signer-email { font-size:0.78rem; color:var(--text-muted); }
    .signer-role { font-size:0.75rem; color:#22c55e; font-weight:500; margin-top:2px; }
    .signer-status { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
    .signed-at { font-size:0.72rem; color:var(--text-muted); }
    .pad-hint { margin:0 0 12px; font-size:0.85rem; color:var(--text-muted); }
    .canvas-container { border:2px dashed var(--border-color); border-radius:12px; overflow:hidden; background:#fff; }
    .sig-canvas { display:block; cursor:crosshair; max-width:100%; touch-action:none; }
    .pad-actions { display:flex; gap:12px; margin-top:16px; align-items:center; }
    .btn-brand { background:linear-gradient(135deg,#22c55e,#16a34a) !important; color:#052e16 !important; font-weight:700 !important; }
  `],
})
export class SignatureDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('sigCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly api    = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly route  = inject(ActivatedRoute);

  request = signal<SignatureRequestDetail | null>(null);
  loading = signal(false);
  saving  = signal(false);
  hasSig  = signal(false);

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  ngAfterViewInit(): void {
    if (this.canvasRef?.nativeElement) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d');
      if (this.ctx) {
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
      }
    }
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get<SignatureRequestDetail>(`signatures/requests/${id}/`).subscribe({
      next: (res) => { this.request.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load request.'); },
    });
  }

  startDraw(e: MouseEvent): void {
    if (!this.ctx) return;
    this.drawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.ctx.beginPath();
    this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  draw(e: MouseEvent): void {
    if (!this.drawing || !this.ctx) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.stroke();
    this.hasSig.set(true);
  }

  stopDraw(): void { this.drawing = false; }

  startDrawTouch(e: TouchEvent): void {
    e.preventDefault();
    if (!this.ctx) return;
    this.drawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const t = e.touches[0];
    this.ctx.beginPath();
    this.ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top);
  }

  drawTouch(e: TouchEvent): void {
    e.preventDefault();
    if (!this.drawing || !this.ctx) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const t = e.touches[0];
    this.ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top);
    this.ctx.stroke();
    this.hasSig.set(true);
  }

  clearCanvas(): void {
    if (!this.ctx || !this.canvasRef) return;
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.hasSig.set(false);
  }

  submitSignature(): void {
    if (!this.hasSig() || !this.canvasRef || !this.request()) return;
    const base64 = this.canvasRef.nativeElement.toDataURL('image/png');
    const id = this.request()!.id;
    this.saving.set(true);
    this.api.post(`signatures/requests/${id}/sign/`, { signature_data: base64 }).subscribe({
      next: () => {
        this.notify.success('Document signed successfully.');
        this.saving.set(false);
        this.load(id);
      },
      error: () => { this.saving.set(false); this.notify.error('Failed to submit signature.'); },
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'chip chip-amber', partial: 'chip chip-blue',
      completed: 'chip chip-green', expired: 'chip chip-red',
    };
    return map[status] ?? 'chip';
  }

  signerStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'chip chip-amber', signed: 'chip chip-green', declined: 'chip chip-red',
    };
    return map[status] ?? 'chip';
  }
}
