export interface AuditLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  status_code: number;
  user: string | null;
  user_email: string;
  ip_address: string | null;
  user_agent: string;
  duration_ms: number;
  request_body: Record<string, unknown>;
  created_at: string;
}
