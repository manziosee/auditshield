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
import { MatChipsModule } from '@angular/material/chips';
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
    MatProgressSpinnerModule, MatCardModule, MatDividerModule, MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Employees</h2>
          <p class="subtitle">{{ total() }} employees total</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="showDepts = !showDepts" [class.active-btn]="showDepts">
            <mat-icon>account_tree</mat-icon> Departments
            <span class="dept-count-chip">{{ departments().length }}</span>
          </button>
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

      <!-- ── Department CRUD Panel ──────────────────────────────────────────── -->
      @if (showDepts) {
        <mat-card class="dept-panel">
          <div class="dept-panel-header">
            <div>
              <div class="dept-panel-title">
                <mat-icon>account_tree</mat-icon> Department Management
              </div>
              <p class="dept-panel-sub">Create, rename, and remove departments</p>
            </div>
            <button mat-stroked-button color="primary" (click)="startAddDept()">
              <mat-icon>add</mat-icon> Add Department
            </button>
          </div>

          @if (deptLoading()) {
            <div class="dept-spinner"><mat-spinner diameter="32" /></div>
          }

          @if (showDeptForm()) {
            <div class="dept-form-row">
              <mat-form-field appearance="outline" class="dept-name-field">
                <mat-label>{{ editingDept() ? 'Rename department' : 'New department name' }}</mat-label>
                <input matInput [(ngModel)]="deptFormName" (keyup.enter)="saveDept()" placeholder="e.g. Engineering" />
                <mat-icon matPrefix>edit</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="dept-desc-field">
                <mat-label>Description (optional)</mat-label>
                <input matInput [(ngModel)]="deptFormDesc" placeholder="Brief description" />
              </mat-form-field>
              <div class="dept-form-actions">
                <button mat-raised-button color="primary" (click)="saveDept()" [disabled]="!deptFormName.trim()">
                  <mat-icon>check</mat-icon> {{ editingDept() ? 'Save' : 'Create' }}
                </button>
                <button mat-stroked-button (click)="cancelDeptForm()">
                  <mat-icon>close</mat-icon> Cancel
                </button>
              </div>
            </div>
          }

          <div class="dept-grid">
            @if (departments().length === 0 && !deptLoading()) {
              <div class="dept-empty">
                <mat-icon>account_tree</mat-icon>
                <p>No departments yet. Add your first one above.</p>
              </div>
            }
            @for (dept of departments(); track dept.id) {
              <div class="dept-card" [class.dept-card--editing]="editingDept()?.id === dept.id">
                <div class="dept-card-icon">
                  <mat-icon>folder</mat-icon>
                </div>
                <div class="dept-card-body">
                  <div class="dept-card-name">{{ dept.name }}</div>
                  @if (dept.description) {
                    <div class="dept-card-desc">{{ dept.description }}</div>
                  }
                  <div class="dept-card-count">
                    <mat-icon>group</mat-icon> {{ dept.employee_count }} employee{{ dept.employee_count !== 1 ? 's' : '' }}
                  </div>
                </div>
                <div class="dept-card-actions">
                  <button mat-icon-button matTooltip="Edit" (click)="startEditDept(dept)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" class="delete-btn" (click)="confirmDeleteDept(dept)"
                    [disabled]="dept.employee_count > 0">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </mat-card>
      }

      <!-- ── Filters ────────────────────────────────────────────────────────── -->
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

      <!-- ── Table ─────────────────────────────────────────────────────────── -->
      <mat-card class="table-card">
        @if (loading()) {
          <div class="loading-overlay"><mat-spinner diameter="40" /></div>
        }
        <div class="table-wrapper">
          <table mat-table [dataSource]="employees()">
            <ng-container matColumnDef="employee_number">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let emp">
                <span class="emp-id">{{ emp.employee_number }}</span>
              </td>
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

    /* ── Header ─────────────────────────────────────────────────────────────── */
    .page-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .page-header h2 { margin:0 0 2px; font-size:1.5rem; font-weight:700; color:var(--text-primary); }
    .subtitle { margin:0; color:var(--text-muted); font-size:0.875rem; }
    .header-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .active-btn { background:var(--brand-subtle) !important; border-color:var(--brand) !important; color:var(--brand) !important; }
    .dept-count-chip {
      display:inline-flex; align-items:center; justify-content:center;
      background:var(--brand); color:#fff;
      border-radius:999px; font-size:0.65rem; font-weight:700;
      width:18px; height:18px; margin-left:4px;
    }

    /* ── Department Panel ───────────────────────────────────────────────────── */
    .dept-panel { padding:20px 24px !important; }
    .dept-panel-header {
      display:flex; justify-content:space-between; align-items:flex-start;
      margin-bottom:20px; gap:16px;
    }
    .dept-panel-title {
      display:flex; align-items:center; gap:8px;
      font-size:1rem; font-weight:700; color:var(--text-primary);
    }
    .dept-panel-title mat-icon { color:var(--brand); }
    .dept-panel-sub { margin:4px 0 0; font-size:0.8rem; color:var(--text-muted); }
    .dept-spinner { display:flex; justify-content:center; padding:20px; }

    .dept-form-row {
      display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;
      background:var(--surface-hover);
      border:1px solid var(--border-color);
      border-radius:12px;
      padding:16px;
      margin-bottom:20px;
    }
    .dept-name-field { flex:1; min-width:200px; }
    .dept-desc-field { flex:1; min-width:180px; }
    .dept-form-actions { display:flex; gap:8px; align-items:center; padding-top:4px; }

    .dept-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));
      gap:12px;
    }
    .dept-empty {
      grid-column:1/-1;
      text-align:center; padding:32px;
      color:var(--text-muted);
    }
    .dept-empty mat-icon { font-size:2.5rem; width:2.5rem; height:2.5rem; opacity:0.3; display:block; margin:0 auto 10px; }
    .dept-empty p { margin:0; font-size:0.875rem; }

    .dept-card {
      display:flex; align-items:flex-start; gap:12px;
      background:var(--surface-bg);
      border:1px solid var(--border-color);
      border-radius:12px;
      padding:14px 16px;
      transition:box-shadow 0.2s, border-color 0.2s;
    }
    .dept-card:hover { box-shadow:var(--shadow-sm); border-color:var(--brand); }
    .dept-card--editing { border-color:var(--brand); background:var(--brand-subtle); }
    .dept-card-icon {
      width:38px; height:38px; border-radius:10px;
      background:var(--brand-subtle); color:var(--brand);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .dept-card-icon mat-icon { font-size:1.2rem; }
    .dept-card-body { flex:1; min-width:0; }
    .dept-card-name { font-size:0.875rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .dept-card-desc { font-size:0.72rem; color:var(--text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .dept-card-count {
      display:flex; align-items:center; gap:3px;
      font-size:0.7rem; color:var(--text-faint); margin-top:6px;
    }
    .dept-card-count mat-icon { font-size:0.8rem; width:0.8rem; height:0.8rem; }
    .dept-card-actions { display:flex; flex-shrink:0; }
    .delete-btn { color:var(--danger) !important; }
    .delete-btn:disabled { color:var(--text-faint) !important; }

    /* ── Filters ─────────────────────────────────────────────────────────────── */
    .filters-card { padding:16px 20px !important; }
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; }
    .search-field { flex:1; min-width:220px; }

    /* ── Table ───────────────────────────────────────────────────────────────── */
    .table-card { overflow:hidden; padding:0 !important; position:relative; }
    .loading-overlay {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      background:color-mix(in srgb, var(--surface-card) 88%, transparent);
      backdrop-filter:blur(2px); z-index:10;
    }
    .table-wrapper { overflow-x:auto; }
    table { width:100%; }

    .emp-id {
      font-family:monospace; font-size:0.78rem; font-weight:700;
      background:var(--surface-hover); color:var(--text-secondary);
      padding:3px 8px; border-radius:6px; border:1px solid var(--border-color);
      letter-spacing:0.02em;
    }
    .name-cell { display:flex; align-items:center; gap:10px; }
    .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:600; font-size:0.8rem; flex-shrink:0; }
    .emp-name { font-weight:500; font-size:0.875rem; color:var(--text-primary); }
    .emp-sub { font-size:0.75rem; color:var(--text-muted); }

    .chip { display:inline-block; padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; }
    .chip-neutral { background:var(--surface-hover); color:var(--text-muted); border:1px solid var(--border-color); }
    .chip-success { background:var(--success-bg); color:var(--success); }
    .chip-warning { background:var(--warning-bg); color:var(--warning); }
    .chip-danger  { background:var(--danger-bg);  color:var(--danger);  }
    .chip-info    { background:var(--info-bg);    color:var(--info);    }

    .clickable-row { cursor:pointer; }
    .clickable-row:hover { background:var(--surface-hover); }
    .danger-item { color:var(--danger) !important; }
    .empty-state { text-align:center; padding:48px 24px; color:var(--text-muted); }
    .empty-state mat-icon { font-size:3rem; height:3rem; width:3rem; opacity:0.3; display:block; margin:0 auto 12px; }
    .empty-state h3 { margin:0 0 8px; color:var(--text-primary); font-size:1rem; }
    .empty-state p { margin:0 0 20px; }

    @media(max-width:768px) {
      .page-header { flex-direction:column; align-items:flex-start; }
      .dept-form-row { flex-direction:column; }
      .dept-grid { grid-template-columns:1fr; }
    }
  `],
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly notify = inject(NotificationService);

  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  total = signal(0);
  loading = signal(false);
  deptLoading = signal(false);

  // Department panel state
  showDepts = false;
  showDeptForm = signal(false);
  editingDept = signal<Department | null>(null);
  deptFormName = '';
  deptFormDesc = '';

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
        this.loadDepartments();
      },
      error: () => this.notify.error('Import failed. Check file format.'),
    });
  }

  // ── Department CRUD ────────────────────────────────────────────────────────
  startAddDept(): void {
    this.editingDept.set(null);
    this.deptFormName = '';
    this.deptFormDesc = '';
    this.showDeptForm.set(true);
  }

  startEditDept(dept: Department): void {
    this.editingDept.set(dept);
    this.deptFormName = dept.name;
    this.deptFormDesc = dept.description ?? '';
    this.showDeptForm.set(true);
  }

  cancelDeptForm(): void {
    this.showDeptForm.set(false);
    this.editingDept.set(null);
    this.deptFormName = '';
    this.deptFormDesc = '';
  }

  saveDept(): void {
    const name = this.deptFormName.trim();
    if (!name) return;
    this.deptLoading.set(true);
    const payload = { name, description: this.deptFormDesc.trim() };
    const editing = this.editingDept();

    const req = editing
      ? this.employeeService.updateDepartment(editing.id, payload)
      : this.employeeService.createDepartment(payload);

    req.subscribe({
      next: () => {
        this.notify.success(editing ? 'Department updated.' : 'Department created.');
        this.deptLoading.set(false);
        this.cancelDeptForm();
        this.loadDepartments();
      },
      error: () => {
        this.deptLoading.set(false);
        this.notify.error('Failed to save department.');
      },
    });
  }

  confirmDeleteDept(dept: Department): void {
    if (dept.employee_count > 0) {
      this.notify.warn(`Cannot delete "${dept.name}" — it has ${dept.employee_count} employees.`);
      return;
    }
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    this.deptLoading.set(true);
    this.employeeService.deleteDepartment(dept.id).subscribe({
      next: () => {
        this.notify.success(`Department "${dept.name}" deleted.`);
        this.deptLoading.set(false);
        this.loadDepartments();
      },
      error: () => {
        this.deptLoading.set(false);
        this.notify.error('Failed to delete department.');
      },
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
