import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { IUser, UserRole, UserStatus } from '../models/auth.models';
import { ToastService } from './toast.service';

export interface CreateUserData {
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  password: string;
  status: UserStatus;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  department?: string;
  password?: string;
  status?: UserStatus;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  data: IUser[];
}

export interface SingleUserResponse {
  success: boolean;
  message?: string;
  data: IUser;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private loadingSignal = signal<boolean>(false);
  readonly isLoading = this.loadingSignal.asReadonly();

  private usersSignal = signal<IUser[]>([]);
  readonly users = this.usersSignal.asReadonly();

  getUsers(): Observable<UsersResponse> {
    this.loadingSignal.set(true);
    return this.http.get<UsersResponse>('/api/users').pipe(
      tap((res) => {
        if (res.success) {
          this.usersSignal.set(res.data);
        }
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }

  createUser(data: CreateUserData): Observable<SingleUserResponse> {
    return this.http.post<SingleUserResponse>('/api/users', data).pipe(
      tap((res) => {
        if (res.success) {
          this.toast.success('User Created', `User ${res.data.name} successfully added.`);
          this.usersSignal.update((list) => [res.data, ...list]);
        }
      })
    );
  }

  updateUser(id: string, data: UpdateUserData): Observable<SingleUserResponse> {
    return this.http.put<SingleUserResponse>(`/api/users/${id}`, data).pipe(
      tap((res) => {
        if (res.success) {
          this.toast.success('User Updated', `Updated details for ${res.data.name}`);
          this.usersSignal.update((list) => list.map((u) => (u._id === id ? res.data : u)));
        }
      })
    );
  }

  toggleStatus(id: string): Observable<SingleUserResponse> {
    return this.http.patch<SingleUserResponse>(`/api/users/${id}/toggle-status`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.toast.info('Status Changed', `${res.data.name} is now ${res.data.status}`);
          this.usersSignal.update((list) => list.map((u) => (u._id === id ? res.data : u)));
        }
      })
    );
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/users/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.toast.warning('User Deleted', 'Account removed from database.');
          this.usersSignal.update((list) => list.filter((u) => u._id !== id));
        }
      })
    );
  }
}
