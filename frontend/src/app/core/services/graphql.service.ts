/**
 * GraphQL Service — thin wrapper around Apollo Angular.
 * Provides typed query/mutation helpers used across the application.
 */
import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EMPLOYEES_QUERY,
  EMPLOYEE_QUERY,
  DEPARTMENTS_QUERY,
  DOCUMENTS_QUERY,
  COMPLIANCE_DASHBOARD_QUERY,
  COMPLIANCE_RECORDS_QUERY,
  MY_NOTIFICATIONS_QUERY,
  AUDIT_LOGS_QUERY,
} from '../graphql/queries';
import {
  CREATE_EMPLOYEE_MUTATION,
  UPDATE_EMPLOYEE_MUTATION,
  DELETE_EMPLOYEE_MUTATION,
  UPDATE_COMPLIANCE_RECORD_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from '../graphql/mutations';

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private readonly apollo = inject(Apollo);

  // ── Employees ──────────────────────────────────────────────────────────────
  getEmployees(variables?: Record<string, unknown>) {
    return this.apollo
      .watchQuery({ query: EMPLOYEES_QUERY, variables })
      .valueChanges.pipe(map((r: any) => r.data.employees));
  }

  getEmployee(id: string) {
    return this.apollo
      .query({ query: EMPLOYEE_QUERY, variables: { id } })
      .pipe(map((r: any) => r.data.employee));
  }

  getDepartments() {
    return this.apollo
      .query({ query: DEPARTMENTS_QUERY })
      .pipe(map((r: any) => r.data.departments));
  }

  createEmployee(input: Record<string, unknown>): Observable<any> {
    return this.apollo
      .mutate({ mutation: CREATE_EMPLOYEE_MUTATION, variables: { input } })
      .pipe(map((r: any) => r.data.createEmployee));
  }

  updateEmployee(id: string, input: Record<string, unknown>): Observable<any> {
    return this.apollo
      .mutate({
        mutation: UPDATE_EMPLOYEE_MUTATION,
        variables: { id, input },
        refetchQueries: [{ query: EMPLOYEES_QUERY }],
      })
      .pipe(map((r: any) => r.data.updateEmployee));
  }

  deleteEmployee(id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: DELETE_EMPLOYEE_MUTATION,
        variables: { id },
        refetchQueries: [{ query: EMPLOYEES_QUERY }],
      })
      .pipe(map((r: any) => r.data.deleteEmployee));
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  getDocuments(variables?: Record<string, unknown>) {
    return this.apollo
      .watchQuery({ query: DOCUMENTS_QUERY, variables })
      .valueChanges.pipe(map((r: any) => r.data.documents));
  }

  // ── Compliance ─────────────────────────────────────────────────────────────
  getComplianceDashboard() {
    return this.apollo
      .query({ query: COMPLIANCE_DASHBOARD_QUERY })
      .pipe(map((r: any) => r.data));
  }

  getComplianceRecords(status?: string) {
    return this.apollo
      .query({ query: COMPLIANCE_RECORDS_QUERY, variables: { status } })
      .pipe(map((r: any) => r.data.complianceRecords));
  }

  updateComplianceRecord(id: string, status: string, notes?: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: UPDATE_COMPLIANCE_RECORD_MUTATION,
        variables: { id, status, notes },
        refetchQueries: [{ query: COMPLIANCE_RECORDS_QUERY }],
      })
      .pipe(map((r: any) => r.data.updateComplianceRecord));
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications(unreadOnly = false) {
    return this.apollo
      .watchQuery({ query: MY_NOTIFICATIONS_QUERY, variables: { unreadOnly } })
      .valueChanges.pipe(map((r: any) => r.data));
  }

  markNotificationRead(id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: MARK_NOTIFICATION_READ_MUTATION,
        variables: { id },
        refetchQueries: [{ query: MY_NOTIFICATIONS_QUERY }],
      })
      .pipe(map((r: any) => r.data.markNotificationRead));
  }

  markAllNotificationsRead(): Observable<any> {
    return this.apollo
      .mutate({
        mutation: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
        refetchQueries: [{ query: MY_NOTIFICATIONS_QUERY }],
      })
      .pipe(map((r: any) => r.data.markAllNotificationsRead));
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────
  getAuditLogs(page = 1, pageSize = 50) {
    return this.apollo
      .query({ query: AUDIT_LOGS_QUERY, variables: { page, pageSize } })
      .pipe(map((r: any) => r.data.auditLogs));
  }
}
