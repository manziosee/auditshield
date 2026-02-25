import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee, Department } from '../../../core/models/employee.models';

@Component({
  selector: 'as-employee-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/employees"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h2>{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h2>
          <p class="subtitle">{{ isEdit ? 'Update employee information' : 'Create a new employee record' }}</p>
        </div>
      </div>

      @if (loadingData()) {
        <div class="center-spinner"><mat-spinner diameter="48" /></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Personal Info -->
          <mat-card>
            <mat-card-header><mat-card-title>Personal Information</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>First Name *</mat-label>
                  <input matInput formControlName="first_name" />
                  @if (form.get('first_name')?.invalid && form.get('first_name')?.touched) {
                    <mat-error>First name is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Last Name *</mat-label>
                  <input matInput formControlName="last_name" />
                  @if (form.get('last_name')?.invalid && form.get('last_name')?.touched) {
                    <mat-error>Last name is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                  <mat-icon matPrefix>email</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" placeholder="+250788…" />
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Gender</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="">Prefer not to say</mat-option>
                    <mat-option value="M">Male</mat-option>
                    <mat-option value="F">Female</mat-option>
                    <mat-option value="O">Other</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput type="date" formControlName="date_of_birth" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>National ID (Rwanda)</mat-label>
                  <input matInput formControlName="national_id" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-col">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="address" rows="2"></textarea>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Employment Info -->
          <mat-card>
            <mat-card-header><mat-card-title>Employment Details</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Employee Number</mat-label>
                  <input matInput formControlName="employee_number" placeholder="EMP-001" />
                  <mat-hint>Auto-generated if left blank</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Job Title *</mat-label>
                  <input matInput formControlName="job_title" />
                  @if (form.get('job_title')?.invalid && form.get('job_title')?.touched) {
                    <mat-error>Job title is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <mat-select formControlName="department">
                    <mat-option value="">No department</mat-option>
                    @for (dept of departments(); track dept.id) {
                      <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Contract Type *</mat-label>
                  <mat-select formControlName="contract_type">
                    <mat-option value="permanent">Permanent</mat-option>
                    <mat-option value="fixed_term">Fixed-Term</mat-option>
                    <mat-option value="internship">Internship</mat-option>
                    <mat-option value="consultant">Consultant</mat-option>
                    <mat-option value="part_time">Part-Time</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Employment Status</mat-label>
                  <mat-select formControlName="employment_status">
                    <mat-option value="active">Active</mat-option>
                    <mat-option value="probation">Probation</mat-option>
                    <mat-option value="on_leave">On Leave</mat-option>
                    <mat-option value="terminated">Terminated</mat-option>
                    <mat-option value="resigned">Resigned</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Hire Date *</mat-label>
                  <input matInput type="date" formControlName="hire_date" />
                  @if (form.get('hire_date')?.invalid && form.get('hire_date')?.touched) {
                    <mat-error>Hire date is required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Contract End Date</mat-label>
                  <input matInput type="date" formControlName="contract_end_date" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Gross Salary (RWF)</mat-label>
                  <input matInput type="number" formControlName="gross_salary" />
                  <mat-icon matPrefix>payments</mat-icon>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Statutory -->
          <mat-card>
            <mat-card-header><mat-card-title>Statutory & Banking</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>RSSB Number</mat-label>
                  <input matInput formControlName="rssb_number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>TIN Number (RRA)</mat-label>
                  <input matInput formControlName="tin_number" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Bank Account</mat-label>
                  <input matInput formControlName="bank_account" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Bank Name</mat-label>
                  <input matInput formControlName="bank_name" />
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/employees">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="loading() || form.invalid">
              @if (loading()) { <mat-spinner diameter="20" /> }
              @else { {{ isEdit ? 'Save Changes' : 'Create Employee' }} }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; align-items:center; gap:12px; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    mat-card { margin:0; }
    mat-card-header { margin-bottom:8px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
    .full-col { grid-column:1/-1; }
    .form-actions { display:flex; justify-content:flex-end; gap:12px; padding:8px 0; }
    .center-spinner { display:flex; justify-content:center; padding:60px; }
    @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} }
  `],
})
export class EmployeeFormComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  isEdit = false;
  employeeId = '';
  loading = signal(false);
  loadingData = signal(false);
  departments = signal<Department[]>([]);

  readonly form = this.fb.group({
    employee_number: [''],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', Validators.email],
    phone: [''],
    gender: [''],
    date_of_birth: [''],
    national_id: [''],
    address: [''],
    job_title: ['', Validators.required],
    department: [''],
    contract_type: ['permanent', Validators.required],
    employment_status: ['probation'],
    hire_date: ['', Validators.required],
    contract_end_date: [''],
    gross_salary: [null as number | null],
    rssb_number: [''],
    tin_number: [''],
    bank_account: [''],
    bank_name: [''],
  });

  ngOnInit(): void {
    this.employeeService.listDepartments().subscribe({ next: (r) => this.departments.set(r.results) });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.employeeId = id;
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string): void {
    this.loadingData.set(true);
    this.employeeService.get(id).subscribe({
      next: (emp) => {
        this.form.patchValue({
          ...emp,
          department: emp.department ?? '',
          gross_salary: emp.gross_salary ? Number(emp.gross_salary) : null,
        });
        this.loadingData.set(false);
      },
      error: () => { this.loadingData.set(false); this.notify.error('Failed to load employee.'); },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const data = this.form.value as Partial<Employee>;
    const req = this.isEdit
      ? this.employeeService.update(this.employeeId, data)
      : this.employeeService.create(data);

    req.subscribe({
      next: (emp) => {
        this.notify.success(this.isEdit ? 'Employee updated.' : 'Employee created.');
        this.router.navigate(['/employees', emp.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error(err?.error?.detail ?? 'Failed to save employee.');
      },
    });
  }
}
