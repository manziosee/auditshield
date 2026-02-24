import { gql } from 'apollo-angular';
import { EMPLOYEE_FIELDS } from './queries';

// ── Employee mutations ─────────────────────────────────────────────────────────
export const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      employeeNumber
      fullName
      jobTitle
      employmentStatus
    }
  }
`;

export const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS}
`;

export const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id) {
      success
      message
    }
  }
`;

// ── Department mutations ───────────────────────────────────────────────────────
export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: DepartmentInput!) {
    createDepartment(input: $input) {
      success
      message
    }
  }
`;

// ── Compliance mutations ───────────────────────────────────────────────────────
export const UPDATE_COMPLIANCE_RECORD_MUTATION = gql`
  mutation UpdateComplianceRecord($id: ID!, $status: String!, $notes: String) {
    updateComplianceRecord(id: $id, status: $status, notes: $notes) {
      id
      status
      completedDate
      notes
    }
  }
`;

// ── Notification mutations ─────────────────────────────────────────────────────
export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      success
      message
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;
