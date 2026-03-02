import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/auth.models';
import { PaginatedResponse, QueryParams } from '../models/api.models';

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getMe(): Observable<User> {
    return this.api.get<User>('auth/me/');
  }

  updateMe(data: Partial<User>): Observable<User> {
    return this.api.patch<User>('auth/me/', data);
  }

  changePassword(data: ChangePassword): Observable<{ message: string }> {
    return this.api.post('auth/change-password/', data);
  }

  listUsers(params?: QueryParams): Observable<PaginatedResponse<User>> {
    return this.api.getPaginated<User>('auth/users/', params);
  }

  createUser(data: UserCreate): Observable<User> {
    return this.api.post<User>('auth/users/', data);
  }
}
