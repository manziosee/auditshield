import { gql } from 'apollo-angular';

// ── Fragments ──────────────────────────────────────────────────────────────────
export const EMPLOYEE_FIELDS = gql`
  fragment EmployeeFields on EmployeeType {
    id
    employeeNumber
    fullName
    firstName
    lastName
    email
    phone
    jobTitle
    contractType
    employmentStatus
    hireDate
    contractEndDate
    isActive
    complianceScore
    department {
      id
      name
    }
  }
`;

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on DocumentType {
    id
    title
    documentType
    fileName
    fileSize
    mimeType
    status
    expiryDate
    issueDate
    referenceNumber
    description
    tags
    isExpired
    daysUntilExpiry
    ocrProcessed
    createdAt
  }
`;

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const COMPLIANCE_DASHBOARD_QUERY = gql`
  query ComplianceDashboard {
    complianceDashboard {
      score
      compliant
      pending
      overdue
      total
    }
    unreadNotificationCount
  }
`;

// ── Employees ──────────────────────────────────────────────────────────────────
export const EMPLOYEES_QUERY = gql`
  query Employees($page: Int, $pageSize: Int, $search: String, $status: String, $departmentId: ID) {
    employees(page: $page, pageSize: $pageSize, search: $search, status: $status, departmentId: $departmentId) {
      total
      page
      pageSize
      items {
        ...EmployeeFields
      }
    }
  }
  ${EMPLOYEE_FIELDS}
`;

export const EMPLOYEE_QUERY = gql`
  query Employee($id: ID!) {
    employee(id: $id) {
      ...EmployeeFields
      dateOfBirth
      nationalId
      gender
      address
      socialInsuranceNumber
      taxIdentifier
      grossSalary
      currencyCode
      probationEndDate
      createdAt
    }
  }
  ${EMPLOYEE_FIELDS}
`;

export const DEPARTMENTS_QUERY = gql`
  query Departments {
    departments {
      id
      name
      description
    }
  }
`;

// ── Documents ──────────────────────────────────────────────────────────────────
export const DOCUMENTS_QUERY = gql`
  query Documents($page: Int, $pageSize: Int, $documentType: String, $status: String, $employeeId: ID, $expiringSoon: Boolean) {
    documents(page: $page, pageSize: $pageSize, documentType: $documentType, status: $status, employeeId: $employeeId, expiringSoon: $expiringSoon) {
      total
      page
      pageSize
      items {
        ...DocumentFields
      }
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const DOCUMENT_QUERY = gql`
  query Document($id: ID!) {
    document(id: $id) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

// ── Compliance ─────────────────────────────────────────────────────────────────
export const COMPLIANCE_RECORDS_QUERY = gql`
  query ComplianceRecords($status: String) {
    complianceRecords(status: $status) {
      id
      status
      periodStart
      periodEnd
      dueDate
      completedDate
      notes
      isOverdue
      requirement {
        id
        title
        frequency
        isMandatory
        category {
          id
          name
          authority
        }
      }
    }
  }
`;

// ── Notifications ──────────────────────────────────────────────────────────────
export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      id
      notificationType
      title
      body
      isRead
      createdAt
    }
    unreadNotificationCount
  }
`;

// ── Audit Logs ─────────────────────────────────────────────────────────────────
export const AUDIT_LOGS_QUERY = gql`
  query AuditLogs($page: Int, $pageSize: Int) {
    auditLogs(page: $page, pageSize: $pageSize) {
      id
      method
      path
      statusCode
      ipAddress
      durationMs
      createdAt
    }
  }
`;
