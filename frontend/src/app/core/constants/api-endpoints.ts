/**
 * API endpoint constants
 * Base URL is configured in environment files
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: 'auth/login/',
    REFRESH: 'auth/refresh/',
    LOGOUT: 'auth/logout/',
    CHANGE_PASSWORD: 'auth/change-password/',
    ME: 'auth/me/',
    USERS: 'auth/users/',
    REGISTER: 'auth/register/',
  },

  // Company
  COMPANY: {
    ONBOARD: 'companies/onboard/',
    PROFILE: 'companies/profile/',
    ME: 'companies/me/',
    EXPORT: 'companies/export/',
    BY_ID: (id: string) => `companies/${id}/`,
  },

  // Employees
  EMPLOYEES: {
    LIST: 'employees/',
    BY_ID: (id: string) => `employees/${id}/`,
    BULK_IMPORT: 'employees/bulk_import/',
    EXPORT: 'employees/export/',
    DEPARTMENTS: 'employees/departments/',
    DEPARTMENT_BY_ID: (id: string) => `employees/departments/${id}/`,
  },

  // Documents
  DOCUMENTS: {
    LIST: 'documents/',
    BY_ID: (id: string) => `documents/${id}/`,
    DOWNLOAD: (id: string) => `documents/${id}/download/`,
    PREVIEW_TEXT: (id: string) => `documents/${id}/preview_text/`,
  },

  // Compliance
  COMPLIANCE: {
    DASHBOARD: 'compliance/dashboard/',
    RECORDS: 'compliance/records/',
    RECORD_BY_ID: (id: string) => `compliance/records/${id}/`,
    REQUIREMENTS: 'compliance/requirements/',
    CATEGORIES: 'compliance/categories/',
  },

  // Reports
  REPORTS: {
    LIST: 'reports/',
    BY_ID: (id: string) => `reports/${id}/`,
    DOWNLOAD: (id: string) => `reports/${id}/download/`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: 'notifications/',
    BY_ID: (id: string) => `notifications/${id}/`,
    MARK_ALL_READ: 'notifications/mark-all-read/',
    UNREAD_COUNT: 'notifications/unread-count/',
  },

  // Audit Logs
  AUDIT_LOGS: {
    LIST: 'audit-logs/',
  },

  // Geography
  GEO: {
    COUNTRIES: 'geo/countries/',
    COUNTRY_BY_ID: (id: string) => `geo/countries/${id}/`,
    CURRENCIES: 'geo/currencies/',
    CURRENCY_BY_ID: (id: string) => `geo/currencies/${id}/`,
    EXCHANGE_RATES: 'geo/exchange-rates/',
  },

  // Payroll
  PAYROLL: {
    RUNS: 'payroll/runs/',
    RUN_BY_ID: (id: string) => `payroll/runs/${id}/`,
    APPROVE_RUN: (id: string) => `payroll/runs/${id}/approve/`,
    GENERATE_PAYSLIPS: (id: string) => `payroll/runs/${id}/generate_payslips/`,
    TAX_RULES: 'payroll/tax-rules/',
    TAX_RULE_BY_ID: (id: string) => `payroll/tax-rules/${id}/`,
  },
} as const;
