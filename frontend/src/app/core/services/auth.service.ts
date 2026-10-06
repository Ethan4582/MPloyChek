import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, firstValueFrom } from 'rxjs';
import { IUser, LoginCredentials, AuthResponse, MeResponse } from '../models/auth.models';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  private readonly TOKEN_KEY = 'mploychek_auth_token';
  private readonly USER_KEY = 'mploychek_auth_user';

  private currentUserSignal = signal<IUser | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');
  readonly isGeneralUser = computed(() => this.currentUserSignal()?.role === 'General User');

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
          this.toast.success(`Welcome back, ${res.data.user.name}!`, `Logged in as ${res.data.user.role}`);
        }
      })
    );
  }

  logout(reason?: string): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    if (reason) {
      this.toast.info('Session ended', reason);
    } else {
      this.toast.info('Logged out successfully');
    }
    this.router.navigate(['/login']);
  }

  /**
   * Called during APP_INITIALIZER to restore session before Angular displays routes
   */
  async restoreSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      this.currentUserSignal.set(null);
      return true;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<MeResponse>('/api/auth/me').pipe(
          catchError(() => of(null))
        )
      );

      if (response && response.success && response.data) {
        this.currentUserSignal.set(response.data);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        return true;
      } else {
        this.clearSession();
        return true;
      }
    } catch {
      this.clearSession();
      return true;
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private setSession(token: string, user: IUser): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
    this.currentUserSignal.set(user);
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch {
      // Ignore
    }
    this.currentUserSignal.set(null);
  }

  private getStoredUser(): IUser | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
