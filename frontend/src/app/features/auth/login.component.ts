import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.models';
import { DelayService } from '../../core/services/delay.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Ambient Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10">
        <!-- Logo and Heading -->
        <div class="text-center mb-8">
          <div class="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/30 text-brand-400 mb-4 shadow-xl">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 class="text-2xl font-extrabold text-white tracking-tight">Sign in to MPloyChek</h1>
          <p class="text-xs text-slate-400 mt-1.5">Employment Background Verification & RBAC Portal</p>
        </div>

        <!-- Login Card -->
        <div class="glass-card p-6 sm:p-8 relative">
          <!-- Quick Preset Fill Buttons for Evaluators -->
          <div class="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Test Presets:</span>
              <span class="text-[10px] text-brand-400 font-mono">1-Click Fill</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="fillPreset('Admin')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 text-left"
              >
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Admin User</span>
              </button>
              <button
                type="button"
                (click)="fillPreset('General User')"
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 text-left"
              >
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>General User</span>
              </button>
            </div>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <svg class="w-4 h-4 shrink-0 mt-0.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 leading-relaxed">{{ errorMessage() }}</div>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- User ID Input -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">User ID / Email</label>
              <input
                type="text"
                formControlName="userId"
                placeholder="e.g. admin@mploychek.com"
                class="glass-input"
                [class.border-rose-500]="isFieldInvalid('userId')"
              />
              @if (isFieldInvalid('userId')) {
                <p class="text-[11px] text-rose-400 mt-1">Please enter a valid User ID (min 3 characters)</p>
              }
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••••"
                class="glass-input"
                [class.border-rose-500]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <p class="text-[11px] text-rose-400 mt-1">Password must be at least 4 characters</p>
              }
            </div>

            <!-- Role Selector (Mandatory Requirement) -->
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Select Target Role</span>
                <span class="text-[10px] text-slate-500">RBAC Scope</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="setRole('General User')"
                  class="py-2.5 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2"
                  [ngClass]="
                    loginForm.get('role')?.value === 'General User'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  "
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>General User</span>
                </button>

                <button
                  type="button"
                  (click)="setRole('Admin')"
                  class="py-2.5 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2"
                  [ngClass]="
                    loginForm.get('role')?.value === 'Admin'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  "
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full btn-primary mt-6 py-3"
            >
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Authenticating with MongoDB (Delay: {{ delayService.currentDelay() }}ms)...</span>
              } @else {
                <span>Sign In to Portal</span>
              }
            </button>
          </form>

          <!-- Security note footer -->
          <div class="mt-6 pt-4 border-t border-slate-800 text-center">
            <p class="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>JWT Bearer Protected • Dual-Mode MongoDB Mongoose Storage</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  delayService = inject(DelayService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    userId: ['admin@mploychek.com', [Validators.required, Validators.minLength(3)]],
    password: ['Admin@123', [Validators.required, Validators.minLength(4)]],
    role: ['Admin' as UserRole, [Validators.required]],
  });

  setRole(role: UserRole): void {
    this.loginForm.patchValue({ role });
  }

  fillPreset(role: UserRole): void {
    this.errorMessage.set(null);
    if (role === 'Admin') {
      this.loginForm.setValue({
        userId: 'admin@mploychek.com',
        password: 'Admin@123',
        role: 'Admin',
      });
    } else {
      this.loginForm.setValue({
        userId: 'user@mploychek.com',
        password: 'User@123',
        role: 'General User',
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.loginForm.value;
    const credentials = {
      userId: formValues.userId!,
      password: formValues.password!,
      role: formValues.role as UserRole,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.error || 'Authentication failed. Please verify credentials.'
        );
      },
    });
  }
}
