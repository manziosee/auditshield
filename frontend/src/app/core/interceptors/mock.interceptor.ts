import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

// ── Helpers ──────────────────────────────────────────────────────────────────
function paginate<T>(items: T[], params: URLSearchParams) {
  const page = parseInt(params.get('page') ?? '1');
  const size = parseInt(params.get('page_size') ?? '25');
  const start = (page - 1) * size;
  return { count: items.length, next: null, previous: null, results: items.slice(start, start + size) };
}

function ok(body: unknown, status = 200) {
  return of(new HttpResponse({ status, body })).pipe(delay(220 + Math.random() * 130));
}

// ── Mock Dataset ─────────────────────────────────────────────────────────────
const CO_ID = 'demo-co-001';
const U_ID  = 'demo-user-admin';

const DEPARTMENTS = [
  { id: 'dept-1', name: 'Finance',            description: 'Finance & Accounting',  employee_count: 2, created_at: '2022-01-01T00:00:00Z' },
  { id: 'dept-2', name: 'Human Resources',    description: 'HR & People Operations', employee_count: 1, created_at: '2022-01-01T00:00:00Z' },
  { id: 'dept-3', name: 'Information Technology', description: 'IT & Systems',       employee_count: 1, created_at: '2022-01-01T00:00:00Z' },
  { id: 'dept-4', name: 'Marketing & Sales',  description: 'Marketing and Sales',   employee_count: 2, created_at: '2022-01-01T00:00:00Z' },
  { id: 'dept-5', name: 'Administration',     description: 'General Administration', employee_count: 1, created_at: '2022-01-01T00:00:00Z' },
];

const EMPLOYEES = [
  { id: 'emp-001', employee_number: 'EMP-001', full_name: 'James Okafor',        first_name: 'James',    last_name: 'Okafor',
    email: 'james.okafor@globalco.com',        phone: '+1 415 100 0001',
    gender: 'M', date_of_birth: '1985-03-15',  national_id: 'A12345678', address: '12 Commerce St, Suite 600', photo: null,
    department: 'dept-1', department_name: 'Finance',          job_title: 'Managing Director',
    contract_type: 'permanent', employment_status: 'active',   hire_date: '2022-01-15',
    contract_end_date: null, probation_end_date: null,         gross_salary: '120000', currency_code: 'USD',
    social_insurance_number: 'SSN-100001', tax_identifier: '100-00-0001', is_active: true, compliance_score: 95, created_at: '2022-01-15T00:00:00Z' },
  { id: 'emp-002', employee_number: 'EMP-002', full_name: 'Sarah Chen',          first_name: 'Sarah',    last_name: 'Chen',
    email: 'sarah.chen@globalco.com',          phone: '+1 415 100 0002',
    gender: 'F', date_of_birth: '1988-07-22',  national_id: 'B23456789', address: '45 Innovation Blvd, Floor 3', photo: null,
    department: 'dept-2', department_name: 'Human Resources',  job_title: 'HR Manager',
    contract_type: 'permanent', employment_status: 'active',   hire_date: '2022-03-01',
    contract_end_date: null, probation_end_date: null,         gross_salary: '98000', currency_code: 'USD',
    social_insurance_number: 'SSN-100002', tax_identifier: '100-00-0002', is_active: true, compliance_score: 92, created_at: '2022-03-01T00:00:00Z' },
  { id: 'emp-003', employee_number: 'EMP-003', full_name: 'David Mensah',        first_name: 'David',    last_name: 'Mensah',
    email: 'david.mensah@globalco.com',        phone: '+1 415 100 0003',
    gender: 'M', date_of_birth: '1990-01-10',  national_id: 'C34567890', address: '78 Finance Ave, Suite 200', photo: null,
    department: 'dept-1', department_name: 'Finance',          job_title: 'Senior Accountant',
    contract_type: 'permanent', employment_status: 'active',   hire_date: '2022-06-01',
    contract_end_date: null, probation_end_date: null,         gross_salary: '85000', currency_code: 'USD',
    social_insurance_number: 'SSN-100003', tax_identifier: '100-00-0003', is_active: true, compliance_score: 88, created_at: '2022-06-01T00:00:00Z' },
  { id: 'emp-004', employee_number: 'EMP-004', full_name: 'Amina Hassan',        first_name: 'Amina',    last_name: 'Hassan',
    email: 'amina.hassan@globalco.com',        phone: '+1 415 100 0004',
    gender: 'F', date_of_birth: '1995-05-30',  national_id: 'D45678901', address: '22 Tech Park, Building B', photo: null,
    department: 'dept-3', department_name: 'Information Technology', job_title: 'IT Specialist',
    contract_type: 'fixed_term', employment_status: 'active',  hire_date: '2023-01-15',
    contract_end_date: '2027-01-14', probation_end_date: null, gross_salary: '78000', currency_code: 'USD',
    social_insurance_number: 'SSN-100004', tax_identifier: '100-00-0004', is_active: true, compliance_score: 90, created_at: '2023-01-15T00:00:00Z' },
  { id: 'emp-005', employee_number: 'EMP-005', full_name: 'Marcus Thompson',     first_name: 'Marcus',   last_name: 'Thompson',
    email: 'marcus.t@globalco.com',            phone: '+1 415 100 0005',
    gender: 'M', date_of_birth: '1992-11-20',  national_id: 'E56789012', address: '90 Market St, Floor 12', photo: null,
    department: 'dept-4', department_name: 'Marketing & Sales', job_title: 'Marketing Manager',
    contract_type: 'permanent', employment_status: 'active',   hire_date: '2023-04-01',
    contract_end_date: null, probation_end_date: null,         gross_salary: '72000', currency_code: 'USD',
    social_insurance_number: 'SSN-100005', tax_identifier: '100-00-0005', is_active: true, compliance_score: 85, created_at: '2023-04-01T00:00:00Z' },
  { id: 'emp-006', employee_number: 'EMP-006', full_name: 'Fatima Al-Rashidi',   first_name: 'Fatima',   last_name: 'Al-Rashidi',
    email: 'fatima.r@globalco.com',            phone: '+1 415 100 0006',
    gender: 'F', date_of_birth: '1997-08-12',  national_id: 'F67890123', address: '5 Admin Plaza, Suite 100', photo: null,
    department: 'dept-5', department_name: 'Administration',   job_title: 'Office Administrator',
    contract_type: 'permanent', employment_status: 'active',   hire_date: '2023-07-01',
    contract_end_date: null, probation_end_date: null,         gross_salary: '55000', currency_code: 'USD',
    social_insurance_number: 'SSN-100006', tax_identifier: '100-00-0006', is_active: true, compliance_score: 88, created_at: '2023-07-01T00:00:00Z' },
  { id: 'emp-007', employee_number: 'EMP-007', full_name: 'Lucas Ferreira',      first_name: 'Lucas',    last_name: 'Ferreira',
    email: 'lucas.f@globalco.com',             phone: '+1 415 100 0007',
    gender: 'M', date_of_birth: '1999-02-28',  national_id: 'G78901234', address: '33 Sales Tower, Floor 5', photo: null,
    department: 'dept-4', department_name: 'Marketing & Sales', job_title: 'Sales Representative',
    contract_type: 'fixed_term', employment_status: 'probation', hire_date: '2026-01-15',
    contract_end_date: '2027-01-14', probation_end_date: '2026-04-14', gross_salary: '50000', currency_code: 'USD',
    social_insurance_number: 'SSN-100007', tax_identifier: '100-00-0007', is_active: true, compliance_score: 70, created_at: '2026-01-15T00:00:00Z' },
];

const DOCUMENTS = [
  { id: 'doc-001', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'Payroll Tax Return March 2026',    document_type: 'payroll_tax_return',
    file: '/media/payroll-tax-march-2026.pdf', file_name: 'payroll-tax-march-2026.pdf', file_size: 245760, mime_type: 'application/pdf',
    description: 'Monthly payroll tax return for March 2026',  tags: ['tax', 'payroll'],  status: 'active',
    expiry_date: '2026-12-31',  issue_date: '2026-03-01',  reference_number: 'TAX/PAYROLL/2026/03',
    ocr_processed: true, is_encrypted: true, checksum: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    is_expired: false, days_until_expiry: 309, period_start: '2026-03-01', period_end: '2026-03-31', created_at: '2026-03-05T10:30:00Z' },
  { id: 'doc-002', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'Social Security Declaration Q1 2026', document_type: 'social_security_declaration',
    file: '/media/social-sec-q1-2026.pdf',     file_name: 'social-sec-q1-2026.pdf',    file_size: 184320, mime_type: 'application/pdf',
    description: 'Social security quarterly declaration Q1 2026', tags: ['social-security', 'q1'], status: 'active',
    expiry_date: '2026-03-20',  issue_date: '2026-01-10',  reference_number: 'SS/2026/Q1/001',
    ocr_processed: true, is_encrypted: true, checksum: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    is_expired: false, days_until_expiry: 23, period_start: '2026-01-01', period_end: '2026-03-31', created_at: '2026-01-15T09:00:00Z' },
  { id: 'doc-003', employee: 'emp-001', employee_name: 'James Okafor', uploaded_by_name: 'Demo Admin',
    title: 'Employment Contract — J. Okafor', document_type: 'employment_contract',
    file: '/media/contract-emp-001.pdf',       file_name: 'contract-emp-001.pdf',      file_size: 512000, mime_type: 'application/pdf',
    description: 'Permanent employment contract — Managing Director', tags: ['contract'], status: 'active',
    expiry_date: null,          issue_date: '2022-01-15',  reference_number: 'GCO/EMP/2022/001',
    ocr_processed: true, is_encrypted: true, checksum: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    is_expired: false, days_until_expiry: null, period_start: null, period_end: null, created_at: '2022-01-15T08:00:00Z' },
  { id: 'doc-004', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'Business Registration Certificate', document_type: 'business_registration',
    file: '/media/biz-registration.pdf',       file_name: 'biz-registration.pdf',      file_size: 890880, mime_type: 'application/pdf',
    description: 'Company registration certificate',          tags: ['registration'],    status: 'active',
    expiry_date: '2027-06-30',  issue_date: '2022-01-01',  reference_number: 'CORP/2022/789456',
    ocr_processed: true, is_encrypted: true, checksum: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    is_expired: false, days_until_expiry: 490, period_start: null, period_end: null, created_at: '2022-01-05T08:00:00Z' },
  { id: 'doc-005', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'Annual Audit Report 2025',        document_type: 'audit_report',
    file: '/media/audit-report-2025.pdf',      file_name: 'audit-report-2025.pdf',     file_size: 2097152, mime_type: 'application/pdf',
    description: 'External audit report — financial year 2025', tags: ['audit'],         status: 'active',
    expiry_date: null,          issue_date: '2026-01-20',  reference_number: 'AUDIT/2025/EXT/001',
    ocr_processed: true, is_encrypted: true, checksum: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    is_expired: false, days_until_expiry: null, period_start: '2025-01-01', period_end: '2025-12-31', created_at: '2026-01-25T14:00:00Z' },
  { id: 'doc-006', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'Tax Clearance Certificate 2026',  document_type: 'tax_clearance',
    file: '/media/tax-clearance-2026.pdf',     file_name: 'tax-clearance-2026.pdf',    file_size: 163840, mime_type: 'application/pdf',
    description: 'Tax authority clearance certificate',       tags: ['tax', 'clearance'], status: 'active',
    expiry_date: '2026-03-10',  issue_date: '2026-01-10',  reference_number: 'TAX/TC/2026/001',
    ocr_processed: true, is_encrypted: true, checksum: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    is_expired: false, days_until_expiry: 13, period_start: null, period_end: null, created_at: '2026-01-12T11:00:00Z' },
  { id: 'doc-007', employee: null,      employee_name: '',             uploaded_by_name: 'Demo Admin',
    title: 'VAT Return February 2026',        document_type: 'vat_return',
    file: '/media/vat-feb-2026.pdf',           file_name: 'vat-feb-2026.pdf',          file_size: 204800, mime_type: 'application/pdf',
    description: 'Monthly VAT return February 2026',          tags: ['tax', 'vat'],      status: 'active',
    expiry_date: null,          issue_date: '2026-02-20',  reference_number: 'TAX/VAT/2026/02',
    ocr_processed: true, is_encrypted: true, checksum: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d5',
    is_expired: false, days_until_expiry: null, period_start: '2026-02-01', period_end: '2026-02-28', created_at: '2026-02-22T10:00:00Z' },
  { id: 'doc-008', employee: 'emp-002', employee_name: 'Sarah Chen',   uploaded_by_name: 'Demo Admin',
    title: 'Employment Contract — S. Chen',   document_type: 'employment_contract',
    file: '/media/contract-emp-002.pdf',       file_name: 'contract-emp-002.pdf',      file_size: 491520, mime_type: 'application/pdf',
    description: 'Permanent employment contract — HR Manager', tags: ['contract'],       status: 'pending',
    expiry_date: null,          issue_date: '2022-03-01',  reference_number: 'GCO/EMP/2022/002',
    ocr_processed: false, is_encrypted: true, checksum: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e6',
    is_expired: false, days_until_expiry: null, period_start: null, period_end: null, created_at: '2022-03-01T08:00:00Z' },
];

const COMPLIANCE_RECORDS = [
  { id: 'crec-001', requirement: 'req-001', requirement_title: 'Payroll Tax Monthly Filing',      requirement_frequency: 'monthly',   category_name: 'Tax Compliance',        authority: 'Tax Authority',
    status: 'compliant', period_start: '2026-01-01', period_end: '2026-01-31', due_date: '2026-02-15', completed_date: '2026-02-10', notes: 'Filed via online tax portal.', is_overdue: false, created_at: '2026-02-10T10:00:00Z' },
  { id: 'crec-002', requirement: 'req-002', requirement_title: 'Social Security Monthly Contributions', requirement_frequency: 'monthly', category_name: 'Social Security',    authority: 'Social Security Agency',
    status: 'compliant', period_start: '2026-02-01', period_end: '2026-02-28', due_date: '2026-03-05', completed_date: '2026-02-28', notes: 'All contributions remitted.', is_overdue: false, created_at: '2026-02-28T15:00:00Z' },
  { id: 'crec-003', requirement: 'req-003', requirement_title: 'VAT Return Filing',               requirement_frequency: 'monthly',   category_name: 'Tax Compliance',        authority: 'Tax Authority',
    status: 'pending',   period_start: '2026-02-01', period_end: '2026-02-28', due_date: '2026-03-15', completed_date: null,         notes: 'Awaiting accountant review.', is_overdue: false, created_at: '2026-02-25T08:00:00Z' },
  { id: 'crec-004', requirement: 'req-004', requirement_title: 'Business License Renewal',        requirement_frequency: 'annually',  category_name: 'Business Registration', authority: 'Business Registry',
    status: 'pending',   period_start: '2026-01-01', period_end: '2026-12-31', due_date: '2026-03-31', completed_date: null,         notes: 'Renewal application in progress.', is_overdue: false, created_at: '2026-02-01T08:00:00Z' },
  { id: 'crec-005', requirement: 'req-005', requirement_title: 'Social Security Q4 2025 Declaration', requirement_frequency: 'quarterly', category_name: 'Social Security',   authority: 'Social Security Agency',
    status: 'overdue',   period_start: '2025-10-01', period_end: '2025-12-31', due_date: '2026-01-31', completed_date: null,         notes: 'Not yet submitted. Penalties may apply.', is_overdue: true, created_at: '2026-01-31T00:00:00Z' },
  { id: 'crec-006', requirement: 'req-006', requirement_title: 'Annual Labour Compliance Audit',  requirement_frequency: 'annually',  category_name: 'Labour Law',            authority: 'Labour Department',
    status: 'compliant', period_start: '2025-01-01', period_end: '2025-12-31', due_date: '2026-01-31', completed_date: '2026-01-28', notes: 'All employment contracts reviewed.', is_overdue: false, created_at: '2026-01-28T14:00:00Z' },
  { id: 'crec-007', requirement: 'req-007', requirement_title: 'Annual Income Tax Return',        requirement_frequency: 'annually',  category_name: 'Tax Compliance',        authority: 'Tax Authority',
    status: 'pending',   period_start: '2025-01-01', period_end: '2025-12-31', due_date: '2026-03-31', completed_date: null,         notes: 'Being prepared by accounting team.', is_overdue: false, created_at: '2026-02-01T08:00:00Z' },
  { id: 'crec-008', requirement: 'req-008', requirement_title: 'Payroll Tax February 2026 Filing', requirement_frequency: 'monthly',  category_name: 'Tax Compliance',        authority: 'Tax Authority',
    status: 'compliant', period_start: '2026-02-01', period_end: '2026-02-28', due_date: '2026-03-15', completed_date: '2026-02-25', notes: 'Filed successfully.', is_overdue: false, created_at: '2026-02-25T09:00:00Z' },
];

const NOTIFICATIONS = [
  { id: 'notif-001', notification_type: 'document_expiry', title: 'Tax Clearance Certificate expiring soon', body: 'Your Tax Clearance Certificate (TAX/TC/2026/001) expires in 13 days on March 10, 2026. Please renew before the deadline.', is_read: false, is_sent_email: true, related_object_id: 'doc-006', related_object_type: 'document', created_at: '2026-02-25T08:00:00Z' },
  { id: 'notif-002', notification_type: 'compliance_due',  title: 'VAT Return filing due in 18 days',        body: 'VAT Return for February 2026 is due on March 15, 2026. Please complete the filing to avoid penalties.', is_read: false, is_sent_email: true, related_object_id: 'crec-003', related_object_type: 'compliance_record', created_at: '2026-02-24T08:00:00Z' },
  { id: 'notif-003', notification_type: 'document_expiry', title: 'Social Security Declaration expires in 23 days', body: 'Social Security Declaration Q1 2026 (SS/2026/Q1/001) will expire on March 20, 2026.', is_read: false, is_sent_email: false, related_object_id: 'doc-002', related_object_type: 'document', created_at: '2026-02-23T08:00:00Z' },
  { id: 'notif-004', notification_type: 'compliance_due',  title: 'Social Security Q4 2025 declaration is overdue', body: 'Social Security Q4 2025 Declaration was due on January 31 and has not been submitted. File immediately to avoid fines.', is_read: true, is_sent_email: true, related_object_id: 'crec-005', related_object_type: 'compliance_record', created_at: '2026-02-01T09:00:00Z' },
  { id: 'notif-005', notification_type: 'reminder',        title: 'Annual Tax Return due in 34 days',         body: 'Annual Income Tax Return for 2025 is due on March 31, 2026. Coordinate with your accountant.', is_read: false, is_sent_email: true, related_object_id: 'crec-007', related_object_type: 'compliance_record', created_at: '2026-02-22T08:00:00Z' },
  { id: 'notif-006', notification_type: 'system',          title: 'New employee added to system',             body: 'Lucas Ferreira (EMP-007) has been added as Sales Representative and is currently in probation.', is_read: true, is_sent_email: false, related_object_id: 'emp-007', related_object_type: 'employee', created_at: '2026-01-15T08:05:00Z' },
];

const AUDIT_LOGS = [
  { id: 'alog-001', method: 'POST',  path: '/api/v1/auth/login/',                  status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 145, request_body: {}, created_at: '2026-02-25T09:00:00Z' },
  { id: 'alog-002', method: 'GET',   path: '/api/v1/employees/',                   status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 32,  request_body: {}, created_at: '2026-02-25T09:01:00Z' },
  { id: 'alog-003', method: 'POST',  path: '/api/v1/documents/',                   status_code: 201, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 278, request_body: { title: 'VAT Return February 2026' }, created_at: '2026-02-22T10:02:00Z' },
  { id: 'alog-004', method: 'PATCH', path: '/api/v1/compliance/records/crec-003/', status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 54,  request_body: { notes: 'Awaiting review.' }, created_at: '2026-02-25T08:30:00Z' },
  { id: 'alog-005', method: 'DELETE',path: '/api/v1/documents/doc-old-001/',       status_code: 204, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 43,  request_body: {}, created_at: '2026-02-20T14:15:00Z' },
  { id: 'alog-006', method: 'POST',  path: '/api/v1/employees/',                   status_code: 201, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 165, request_body: { first_name: 'Félix', last_name: 'Rugamba' }, created_at: '2026-01-15T08:00:00Z' },
  { id: 'alog-007', method: 'GET',   path: '/api/v1/reports/',                     status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 28,  request_body: {}, created_at: '2026-02-24T16:00:00Z' },
  { id: 'alog-008', method: 'PATCH', path: '/api/v1/notifications/notif-004/',     status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 25,  request_body: { is_read: true }, created_at: '2026-02-24T17:00:00Z' },
  { id: 'alog-009', method: 'GET',   path: '/api/v1/compliance/dashboard/',         status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 18,  request_body: {}, created_at: '2026-02-25T09:00:05Z' },
  { id: 'alog-010', method: 'POST',  path: '/api/v1/auth/refresh/',                 status_code: 200, user: U_ID, user_email: 'admin@demo.com', ip_address: '197.157.1.25', user_agent: 'Mozilla/5.0 Chrome/121', duration_ms: 67,  request_body: {}, created_at: '2026-02-25T11:00:00Z' },
];

const REPORTS = [
  { id: 'rep-001', title: 'Audit Readiness Report Q1 2026',     report_type: 'audit_readiness',    generated_by: U_ID, generated_by_name: 'Demo Admin', period_start: '2026-01-01', period_end: '2026-03-31', is_ready: true,  parameters: {}, created_at: '2026-02-20T10:00:00Z' },
  { id: 'rep-002', title: 'Employee Summary February 2026',     report_type: 'employee_summary',   generated_by: U_ID, generated_by_name: 'Demo Admin', period_start: '2026-02-01', period_end: '2026-02-28', is_ready: true,  parameters: {}, created_at: '2026-02-22T14:00:00Z' },
  { id: 'rep-003', title: 'Tax Filing Summary March 2026',      report_type: 'tax_filing_summary', generated_by: U_ID, generated_by_name: 'Demo Admin', period_start: '2026-03-01', period_end: '2026-03-31', is_ready: false, parameters: {}, created_at: '2026-02-25T09:30:00Z' },
];

const MOCK_COMPANY = {
  id: CO_ID, name: 'GlobalCo International Ltd',
  registration_number: 'CORP/2022/789456', tax_identifier: '100123456', social_security_identifier: 'SS/ER/2022/001',
  industry: 'retail', phone: '+1 415 200 0000', email: 'info@globalco.com',
  website: 'https://globalco.com', address: '12 Commerce St, Suite 600',
  city: 'San Francisco', state_province: 'CA', country: 'US', logo: null, fiscal_year_start: 1, employee_count: 7,
};

// ── Interceptor ───────────────────────────────────────────────────────────────
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (localStorage.getItem('as_demo') !== 'true') return next(req);

  const base = '/api/v1/';
  const idx = req.url.indexOf(base);
  if (idx === -1) return next(req);

  const full  = req.url.slice(idx + base.length);
  const path  = full.split('?')[0];
  const qstr  = full.includes('?') ? full.split('?')[1] : '';
  const params = new URLSearchParams(qstr);
  const method = req.method;

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (path === 'auth/logout/'  && method === 'POST') return ok({});
  if (path === 'auth/refresh/' && method === 'POST') return ok({ access: 'demo-access-refreshed' });

  // ── Compliance ────────────────────────────────────────────────────────────
  if (path === 'compliance/dashboard/' && method === 'GET') {
    return ok({ score: 72, compliant: 4, pending: 3, overdue: 1, total: 8 });
  }
  if (path === 'compliance/records/' && method === 'GET') {
    let recs = [...COMPLIANCE_RECORDS];
    const st = params.get('status');    if (st) recs = recs.filter(r => r.status === st);
    const au = params.get('authority'); if (au) recs = recs.filter(r => r.authority === au);
    const se = params.get('search');    if (se) recs = recs.filter(r => r.requirement_title.toLowerCase().includes(se.toLowerCase()));
    return ok(paginate(recs, params));
  }
  if (path.match(/^compliance\/records\/[^/]+\/$/) && method === 'PATCH') {
    const id  = path.split('/')[2];
    const rec = COMPLIANCE_RECORDS.find(r => r.id === id) ?? COMPLIANCE_RECORDS[0];
    return ok({ ...rec, ...(req.body as object) });
  }

  // ── Employees ─────────────────────────────────────────────────────────────
  if (path === 'employees/departments/' && method === 'GET') return ok(paginate(DEPARTMENTS, params));
  if (path === 'employees/bulk_import/' && method === 'POST') return ok({ created: 3, errors: [] });
  if (path === 'employees/export/'      && method === 'GET')  return ok(new Blob([''], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  if (path === 'employees/' && method === 'GET') {
    let emps = [...EMPLOYEES];
    const st = params.get('employment_status'); if (st) emps = emps.filter(e => e.employment_status === st);
    const ct = params.get('contract_type');     if (ct) emps = emps.filter(e => e.contract_type === ct);
    const dp = params.get('department');        if (dp) emps = emps.filter(e => e.department === dp);
    const se = params.get('search');            if (se) { const q = se.toLowerCase(); emps = emps.filter(e => e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employee_number.toLowerCase().includes(q)); }
    return ok(paginate(emps, params));
  }
  if (path === 'employees/' && method === 'POST') return ok({ ...EMPLOYEES[0], ...(req.body as object), id: `emp-new-${Date.now()}` }, 201);
  if (path.match(/^employees\/[^/]+\/$/) && method === 'GET')   { const id = path.split('/')[1]; return ok(EMPLOYEES.find(e => e.id === id) ?? EMPLOYEES[0]); }
  if (path.match(/^employees\/[^/]+\/$/) && method === 'PATCH') { const id = path.split('/')[1]; const emp = EMPLOYEES.find(e => e.id === id) ?? EMPLOYEES[0]; return ok({ ...emp, ...(req.body as object) }); }
  if (path.match(/^employees\/[^/]+\/$/) && method === 'DELETE') return ok(null, 204);

  // ── Documents ─────────────────────────────────────────────────────────────
  if (path === 'documents/' && method === 'GET') {
    let docs = [...DOCUMENTS];
    const st = params.get('status');        if (st === 'expired') docs = docs.filter(d => d.is_expired); else if (st) docs = docs.filter(d => d.status === st);
    const dt = params.get('document_type'); if (dt) docs = docs.filter(d => d.document_type === dt);
    const es = params.get('expiring_soon'); if (es === 'true') docs = docs.filter(d => d.days_until_expiry !== null && d.days_until_expiry <= 30);
    const se = params.get('search');        if (se) docs = docs.filter(d => d.title.toLowerCase().includes(se.toLowerCase()) || d.reference_number.toLowerCase().includes(se.toLowerCase()));
    return ok(paginate(docs, params));
  }
  if (path === 'documents/' && method === 'POST') return ok({ ...DOCUMENTS[0], ...(req.body as object), id: `doc-new-${Date.now()}` }, 201);
  if (path.match(/^documents\/[^/]+\/download\/$/)     && method === 'GET') return ok(new Blob(['%PDF-1.4 demo'], { type: 'application/pdf' }));
  if (path.match(/^documents\/[^/]+\/preview_text\/$/) && method === 'GET') return ok({ extracted_text: 'GLOBALCO INTERNATIONAL LTD\n12 Commerce St, Suite 600\nTax ID: 100123456\n\nPAYROLL TAX RETURN — MARCH 2026\n\nTotal Gross Salary:   USD 385,000\nTotal Tax Deducted:   USD  55,300\nNet Payable:          USD 329,700\n\nFiled via online tax portal on 05 March 2026.', ocr_processed: true });
  if (path.match(/^documents\/[^/]+\/$/) && !path.includes('/download') && !path.includes('/preview') && method === 'GET') { const id = path.split('/')[1]; return ok(DOCUMENTS.find(d => d.id === id) ?? DOCUMENTS[0]); }
  if (path.match(/^documents\/[^/]+\/$/) && method === 'DELETE') return ok(null, 204);

  // ── Notifications ─────────────────────────────────────────────────────────
  if (path === 'notifications/mark-all-read/' && method === 'POST') return ok({});
  if (path === 'notifications/' && method === 'GET') {
    let notifs = [...NOTIFICATIONS];
    const nt = params.get('notification_type'); if (nt) notifs = notifs.filter(n => n.notification_type === nt);
    const ir = params.get('is_read');           if (ir === 'true') notifs = notifs.filter(n => n.is_read); else if (ir === 'false') notifs = notifs.filter(n => !n.is_read);
    return ok(paginate(notifs, params));
  }
  if (path.match(/^notifications\/[^/]+\/$/) && method === 'PATCH') {
    const id = path.split('/')[1]; const notif = NOTIFICATIONS.find(n => n.id === id) ?? NOTIFICATIONS[0];
    return ok({ ...notif, ...(req.body as object) });
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  if (path === 'audit-logs/' && method === 'GET') {
    let logs = [...AUDIT_LOGS];
    const mt = params.get('method'); if (mt) logs = logs.filter(l => l.method === mt);
    const se = params.get('search'); if (se) logs = logs.filter(l => l.user_email.includes(se) || l.path.includes(se));
    return ok(paginate(logs, params));
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  if (path === 'reports/' && method === 'GET') {
    let reps = [...REPORTS];
    const rt = params.get('report_type');                                    if (rt) reps = reps.filter(r => r.report_type === rt);
    const ir = params.get('is_ready'); if (ir === 'true') reps = reps.filter(r => r.is_ready); else if (ir === 'false') reps = reps.filter(r => !r.is_ready);
    return ok(paginate(reps, params));
  }
  if (path === 'reports/' && method === 'POST') return ok({ ...REPORTS[0], id: `rep-${Date.now()}`, is_ready: false, title: (req.body as Record<string, string>)['title'] ?? 'New Report' }, 201);
  if (path.match(/^reports\/[^/]+\/download\/$/) && method === 'GET') return ok(new Blob(['%PDF-1.4 report'], { type: 'application/pdf' }));
  if (path.match(/^reports\/[^/]+\/$/) && method === 'DELETE') return ok(null, 204);

  // ── Company ───────────────────────────────────────────────────────────────
  if (path === 'companies/me/' && method === 'GET') return ok(MOCK_COMPANY);
  if (path === 'companies/export/' && method === 'GET') return ok(new Blob(['{}'], { type: 'application/json' }));
  if (path.match(/^companies\/[^/]+\/$/) && method === 'PATCH') return ok({ ...MOCK_COMPANY, ...(req.body as object) });

  // Default — pass through (shouldn't be reached in demo mode)
  return next(req);
};
