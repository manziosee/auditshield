import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Employee, Department } from '../models/employee.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly api = inject(ApiService);

  list(params?: QueryParams): Observable<PaginatedResponse<Employee>> {
    return this.api.getPaginated<Employee>('employees/', params);
  }

  get(id: string): Observable<Employee> {
    return this.api.get<Employee>(`employees/${id}/`);
  }

  create(data: Partial<Employee>): Observable<Employee> {
    return this.api.post<Employee>('employees/', data);
  }

  update(id: string, data: Partial<Employee>): Observable<Employee> {
    return this.api.patch<Employee>(`employees/${id}/`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`employees/${id}/`);
  }

  bulkImport(file: File): Observable<{ created: number; errors: unknown[] }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.postForm('employees/bulk_import/', fd);
  }

  exportExcel(): Observable<Blob> {
    return this.api.downloadBlob('employees/export/');
  }

  // Departments
  listDepartments(): Observable<PaginatedResponse<Department>> {
    return this.api.getPaginated<Department>('employees/departments/');
  }

  createDepartment(data: Partial<Department>): Observable<Department> {
    return this.api.post<Department>('employees/departments/', data);
  }
}
