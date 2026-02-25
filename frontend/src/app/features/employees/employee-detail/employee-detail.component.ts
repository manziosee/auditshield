import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee } from '../../../core/models/employee.models';

@Component({
  selector: 'as-employee-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatChipsModule, MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button routerLink="/employees"><mat-icon>arrow_back</mat-icon></button>
        <h2>Employee Profile</h2>
        <span class="spacer"></span>
        @if (employee()) {
          <button mat-stroked-button [routerLink]="['/employees', employee()!.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </button>
        }
      </div>

      @if (loading()) {
        <div class="center-spinner"><mat-spinner diameter="48" /></div>
      } @else if (employee(); as emp) {
        <!-- Profile Banner -->
        <mat-card class="profile-banner">
          <div class="profile-main">
            <div class="avatar-lg" [style.background]="avatarColor(emp.first_name)">
              {{ getInitials(emp) }}
            </div>
            <div class="profile-info">
              <h3>{{ emp.full_name }}</h3>
              <p>{{ emp.job_title }} <span class="bullet">•</span> {{ emp.department_name }}</p>
              <div class="profile-chips">
                <span class="chip" [class]="statusClass(emp.employment_status)">{{ formatStatus(emp.employment_status) }}</span>
                <span class="chip chip-neutral">{{ formatContract(emp.contract_type) }}</span>
                <span class="chip chip-neutral">{{ emp.employee_number }}</span>
              </div>
            </div>
          </div>
          <div class="profile-meta">
            <div class="meta-item"><mat-icon>email</mat-icon><span>{{ emp.email || '—' }}</span></div>
            <div class="meta-item"><mat-icon>phone</mat-icon><span>{{ emp.phone || '—' }}</span></div>
            <div class="meta-item"><mat-icon>calendar_today</mat-icon><span>Hired {{ emp.hire_date | date:'mediumDate' }}</span></div>
          </div>
        </mat-card>

        <mat-tab-group>
          <!-- Personal Tab -->
          <mat-tab label="Personal Info">
            <div class="tab-content">
              <mat-card>
                <mat-card-header><mat-card-title>Personal Details</mat-card-title></mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item"><label>Full Name</label><span>{{ emp.full_name }}</span></div>
                    <div class="info-item"><label>Date of Birth</label><span>{{ (emp.date_of_birth | date:'mediumDate') || '—' }}</span></div>
                    <div class="info-item"><label>Gender</label><span>{{ emp.gender === 'M' ? 'Male' : emp.gender === 'F' ? 'Female' : '—' }}</span></div>
                    <div class="info-item"><label>National ID</label><span>{{ emp.national_id || '—' }}</span></div>
                    <div class="info-item"><label>Email</label><span>{{ emp.email || '—' }}</span></div>
                    <div class="info-item"><label>Phone</label><span>{{ emp.phone || '—' }}</span></div>
                    <div class="info-item full-col"><label>Address</label><span>{{ emp.address || '—' }}</span></div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Employment Tab -->
          <mat-tab label="Employment">
            <div class="tab-content">
              <mat-card>
                <mat-card-header><mat-card-title>Employment Details</mat-card-title></mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item"><label>Job Title</label><span>{{ emp.job_title }}</span></div>
                    <div class="info-item"><label>Department</label><span>{{ emp.department_name || '—' }}</span></div>
                    <div class="info-item"><label>Contract Type</label><span>{{ formatContract(emp.contract_type) }}</span></div>
                    <div class="info-item"><label>Status</label>
                      <span class="chip" [class]="statusClass(emp.employment_status)">{{ formatStatus(emp.employment_status) }}</span>
                    </div>
                    <div class="info-item"><label>Hire Date</label><span>{{ emp.hire_date | date:'mediumDate' }}</span></div>
                    <div class="info-item"><label>Contract End Date</label><span>{{ (emp.contract_end_date | date:'mediumDate') || 'Ongoing' }}</span></div>
                    <div class="info-item"><label>Gross Salary</label>
                      <span>{{ emp.gross_salary ? (emp.gross_salary + ' ' + emp.currency) : '—' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Statutory Tab -->
          <mat-tab label="Statutory">
            <div class="tab-content">
              <mat-card>
                <mat-card-header><mat-card-title>Statutory & Banking Information</mat-card-title></mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item"><label>RSSB Number</label><span class="mono">{{ emp.rssb_number || '—' }}</span></div>
                    <div class="info-item"><label>TIN Number (RRA)</label><span class="mono">{{ emp.tin_number || '—' }}</span></div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <div class="empty-state">
          <mat-icon>person_off</mat-icon>
          <h3>Employee not found</h3>
          <button mat-raised-button color="primary" routerLink="/employees">Back to List</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; }
    .page-header h2 { margin:0; font-size:1.5rem; font-weight:700; }
    .spacer { flex:1; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }
    .profile-banner { padding:24px !important; }
    .profile-main { display:flex; align-items:center; gap:20px; margin-bottom:20px; }
    .avatar-lg { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:1.5rem; flex-shrink:0; }
    .profile-info h3 { margin:0 0 4px; font-size:1.3rem; font-weight:700; }
    .profile-info p { margin:0 0 10px; color:#64748b; }
    .bullet { margin:0 6px; }
    .profile-chips { display:flex; gap:6px; flex-wrap:wrap; }
    .profile-meta { display:flex; gap:24px; flex-wrap:wrap; border-top:1px solid #e2e8f0; padding-top:16px; }
    .meta-item { display:flex; align-items:center; gap:6px; color:#64748b; font-size:0.875rem; }
    .meta-item mat-icon { font-size:16px; height:16px; width:16px; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-neutral { background:#f1f5f9; color:#475569; }
    .chip-success { background:#dcfce7; color:#16a34a; }
    .chip-warning { background:#fef9c3; color:#a16207; }
    .chip-danger { background:#fee2e2; color:#dc2626; }
    .chip-info { background:#dbeafe; color:#1d4ed8; }
    .tab-content { padding-top:16px; display:flex; flex-direction:column; gap:16px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .full-col { grid-column:1/-1; }
    .info-item { display:flex; flex-direction:column; gap:4px; }
    .info-item label { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; font-weight:600; }
    .info-item span { font-size:0.9rem; color:#1e293b; }
    .mono { font-family:monospace; }
    .empty-state { text-align:center; padding:60px; color:#64748b; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; margin-bottom:12px; display:block; margin:0 auto 12px; }
    @media(max-width:600px){ .info-grid{grid-template-columns:1fr;} .profile-meta{flex-direction:column;gap:8px;} }
  `],
})
export class EmployeeDetailComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  employee = signal<Employee | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.employeeService.get(id).subscribe({
      next: (emp) => { this.employee.set(emp); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load employee.'); },
    });
  }

  getInitials(emp: Employee): string {
    return `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}`.toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#3b82f6','#8b5cf6','#ef4444','#10b981','#f59e0b','#06b6d4','#ec4899'];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  }

  formatContract(ct: string): string {
    return ({permanent:'Permanent',fixed_term:'Fixed-Term',internship:'Internship',consultant:'Consultant',part_time:'Part-Time'} as Record<string,string>)[ct] ?? ct;
  }

  formatStatus(s: string): string {
    return ({active:'Active',probation:'Probation',on_leave:'On Leave',terminated:'Terminated',resigned:'Resigned'} as Record<string,string>)[s] ?? s;
  }

  statusClass(s: string): string {
    return ({active:'chip chip-success',probation:'chip chip-info',on_leave:'chip chip-warning',terminated:'chip chip-danger',resigned:'chip chip-neutral'} as Record<string,string>)[s] ?? 'chip chip-neutral';
  }
}
