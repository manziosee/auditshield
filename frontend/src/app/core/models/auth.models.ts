export type UserRole = 'super_admin' | 'admin' | 'hr' | 'accountant' | 'auditor' | 'employee';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: UserRole;
  company: string | null;
  company_name: string | null;
  avatar: string | null;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthResponse extends TokenPair {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
