import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee, Department } from '../../../core/models/employee.models';

@Component({
  selector: 'as-employee-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatMenuModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Employees</h2>
          <p class="subtitle">{{ total() }} employees total</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button matTooltip="Import from Excel/CSV" (click)="fileInput.click()">
            <mat-icon>upload</mat-icon> Import
          </button>
          <button mat-stroked-button matTooltip="Download Excel" (click)="exportExcel()">
            <mat-icon>download</mat-icon> Export
          </button>
          <button mat-raised-button color="primary" routerLink="/employees/new">
            <mat-icon>person_add</mat-icon> Add Employee
          </button>
        </div>
      </div>

      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search employees</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Name, ID, email, job title…" />
            <mat-icon matPrefix>search</mat-icon>
            @if (searchQuery) {
              <button mat-icon-button matSuffix type="button" (click)="searchQuery = ''; onSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadEmployees()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="probation">Probation</mat-option>
              <mat-option value="on_leave">On Leave</mat-option>
              <mat-option value="terminated">Terminated</mat-option>
              <mat-option value="resigned">Resigned</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Contract</mat-label>
            <mat-select [(ngModel)]="contractFilter" (ngModelChange)="loadEmployees()">
              <mat-option value="">All</mat-option>
              <mat-option value="permanent">Permanent</mat-option>
              <mat-option value="fixed_term">Fixed-Term</mat-option>
              <mat-option value="internship">Internship</mat-option>
              <mat-option value="consultant">Consultant</mat-option>
              <mat-option value="part_time">Part-Time</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="departmentFilter" (ngModelChange)="loadEmployees()">
              <mat-option value="">All</mat-option>
              @for (dept of departments(); track dept.id) {
                <mat-option [value]="dept.id">{{ dept.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="employees()">
            <ng-container matColumnDef="employee_number">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let emp"><span class="emp-id">{{ emp.employee_number }}</span></td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let emp">
                <div class="name-cell">
                  <div class="avatar" [style.background]="avatarColor(emp.first_name)">{{ getInitials(emp) }}</div>
                  <div>
                    <div class="emp-name">{{ emp.full_name }}</div>
                    <div class="emp-sub">{{ emp.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="job_title">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let emp">
                <div class="emp-name">{{ emp.job_title }}</div>
                <div class="emp-sub">{{ emp.department_name }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="contract_type">
              <th mat-header-cell *matHeaderCellDef>Contract</th>
              <td mat-cell *matCellDef="let emp">
                <span class="chip chip-neutral">{{ formatContract(emp.contract_type) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let emp">
                <span class="chip" [class]="statusClass(emp.employment_status)">{{ formatStatus(emp.employment_status) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="hire_date">
              <th mat-header-cell *matHeaderCellDef>Hired</th>
              <td mat-cell *matCellDef="let emp">{{ emp.hire_date | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let emp" (click)="$event.stopPropagation()">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/employees', emp.id]"><mat-icon>visibility</mat-icon> View</button>
                  <button mat-menu-item [routerLink]="['/employees', emp.id, 'edit']"><mat-icon>edit</mat-icon> Edit</button>
                  <mat-divider />
                  <button mat-menu-item class="danger-item" (click)="confirmDelete(emp)">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row" [routerLink]="['/employees', row.id]"></tr>
          </table>
        </div>
        @if (!loading() && employees().length === 0) {
          <div class="empty-state">
            <mat-icon>group_off</mat-icon>
            <h3>No employees found</h3>
            <p>{{ hasFilters() ? 'Adjust your filters.' : 'Add your first employee to get started.' }}</p>
            @if (!hasFilters()) {
              <button mat-raised-button color="primary" routerLink="/employees/new"><mat-icon>person_add</mat-icon> Add Employee</button>
            }
          </div>
        }
        <mat-paginator [length]="total()" [pageSize]="pageSize" [pageSizeOptions]="[10,25,50]"
          (page)="onPageChange($event)" showFirstLastButtons />
      </mat-card>
    </div>
    <input #fileInput type="file" accept=".xlsx,.csv" style="display:none" (change)="onImportFile($event)" />
  `,
  styles: [`
    .page-container { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; }
    .subtitle { margin:0; color:#64748b; font-size:0.875rem; }
    .header-actions { display:flex; gap:8px; }
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-field { flex:1; min-width:220px; }
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); z-index:10; }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }
    .emp-id { font-family:monospace; font-size:0.8rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; }
    .name-cell { display:flex; align-items:center; gap:10px; }
    .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:600; font-size:0.8rem; flex-shrink:0; }
    .emp-name { font-weight:500; font-size:0.875rem; }
    .emp-sub { font-size:0.75rem; color:#64748b; }
    .chip { display:inline-block; padding:2px 10px; border-radius:20px; font-size:0.75rem; font-weight:500; }
    .chip-neutral { background:#f1f5f9; color:#475569; }
    .chip-success { background:#dcfce7; color:#16a34a; }
    .chip-warning { background:#fef9c3; color:#a16207; }
    .chip-danger { background:#fee2e2; color:#dc2626; }
    .chip-info { background:#dbeafe; color:#1d4ed8; }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover { background:#f8fafc; }
    .danger-item { color:#dc2626; }
    .empty-state { text-align:center; padding:48px 24px; color:#64748b; }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.4; margin-bottom:12px; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:#1e293b; }
    .empty-state p { margin:0 0 20px; }
    @media(max-width:768px){ .page-header{flex-direction:column;align-items:flex-start;gap:12px;} }
  `],
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly notify = inject(NotificationService);

  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  total = signal(0);
  loading = signal(false);

  columns = ['employee_number','name','job_title','contract_type','status','hire_date','actions'];
  pageSize = 25;
  currentPage = 1;
  searchQuery = '';
  statusFilter = '';
  contractFilter = '';
  departmentFilter = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.employeeService.listDepartments().subscribe({
      next: (res) => this.departments.set(res.results),
    });
  }

  loadEmployees(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { page: this.currentPage, page_size: this.pageSize };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.statusFilter) params['employment_status'] = this.statusFilter;
    if (this.contractFilter) params['contract_type'] = this.contractFilter;
    if (this.departmentFilter) params['department'] = this.departmentFilter;

    this.employeeService.list(params).subscribe({
      next: (res) => { this.employees.set(res.results); this.total.set(res.count); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Failed to load employees.'); },
    });
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.currentPage = 1; this.loadEmployees(); }, 350);
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.loadEmployees();
  }

  hasFilters(): boolean {
    return !!(this.searchQuery || this.statusFilter || this.contractFilter || this.departmentFilter);
  }

  confirmDelete(emp: Employee): void {
    if (!confirm(`Delete ${emp.full_name}? This cannot be undone.`)) return;
    this.employeeService.delete(emp.id).subscribe({
      next: () => { this.notify.success(`${emp.full_name} deleted.`); this.loadEmployees(); },
      error: () => this.notify.error('Failed to delete employee.'),
    });
  }

  exportExcel(): void {
    this.employeeService.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'employees.xlsx'; a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('Export failed.'),
    });
  }

  onImportFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.notify.info('Importing…');
    this.employeeService.bulkImport(file).subscribe({
      next: (res) => {
        this.notify.success(`Imported ${res.created} employees.`);
        if (res.errors.length) this.notify.warn(`${res.errors.length} rows had errors.`);
        this.loadEmployees();
      },
      error: () => this.notify.error('Import failed. Check file format.'),
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
