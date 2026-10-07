import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14 bg-[#191919] w-full">
      <div class="w-full max-w-[440px] mx-auto animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Notion Header with Logo -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#222222] border border-[#2f2f2f] mb-3 shadow-notion-card select-none overflow-hidden p-2">
            <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
          </div>
          <h1 class="text-xl font-bold text-[#ffffff] tracking-tight">MPloyChek Workspace</h1>
          <p class="text-xs text-[#9b9a97] mt-1">Employment Verification & RBAC Portal</p>
        </div>

        <!-- Notion Login/Register Card -->
        <div class="notion-card p-6 sm:p-7 border-[#2f2f2f] bg-[#202020] shadow-notion-card">
          
          <!-- Mode Switcher Tabs (Sign In vs Create Account) -->
          <div class="grid grid-cols-2 p-1 rounded-lg bg-[#191919] border border-[#2a2a2a] mb-5">
            <button
              type="button"
              (click)="setMode('signin')"
              class="py-1.5 px-3 rounded-md text-xs font-medium transition-all text-center select-none"
              [ngClass]="
                authMode() === 'signin'
                  ? 'bg-[#282828] text-[#ffffff] shadow-sm'
                  : 'text-[#787774] hover:text-[#e6e6e5]'
              "
            >
              Sign In
            </button>
            <button
              type="button"
              (click)="setMode('register')"
              class="py-1.5 px-3 rounded-md text-xs font-medium transition-all text-center select-none flex items-center justify-center gap-1.5"
              [ngClass]="
                authMode() === 'register'
                  ? 'bg-[#282828] text-[#ffffff] shadow-sm'
                  : 'text-[#787774] hover:text-[#e6e6e5]'
              "
            >
              <span>Create Account</span>
              <span class="text-[9px] px-1 py-0.5 rounded bg-[#332924] text-[#bc8c74] border border-[#48372f]">New</span>
            </button>
          </div>

          <!-- Error Alert with intelligent connection diagnostics -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 rounded-md bg-[#3b2222] border border-[#e05757]/40 text-[#e05757] text-xs flex items-start gap-2.5 leading-snug">
              <span class="text-sm shrink-0">⚠️</span>
              <div class="flex-1">
                <div class="font-medium">{{ errorMessage() }}</div>
                @if (isConnectionError()) {
                  <div class="mt-2 pt-2 border-t border-[#e05757]/20 text-[11px] text-[#e6e6e5]/80 font-mono">
                    To start backend: <br />
                    <span class="text-[#529cca]">cd backend ; node dist/server.js</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- SIGN IN FORM -->
          @if (authMode() === 'signin') {
            
            <!-- Quick-Fill Demo Credentials -->
            <div class="mb-5 p-3 rounded-lg bg-[#191919] border border-[#2a2a2a]">
              <div class="text-[10px] font-medium uppercase tracking-wider text-[#6b6b68] mb-2 flex items-center justify-between">
                <span>Quick-Fill Demo Credentials</span>
                <span class="text-[#529cca] font-mono text-[10px]">1-Click</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="fillPreset('Admin')"
                  class="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#2a221c] hover:bg-[#332924] text-[#bc8c74] border border-[#48372f] transition-all flex items-center justify-center gap-1.5"
                >
                  <img src="/logo.png" alt="Admin" class="w-3.5 h-3.5 object-contain" />
                  <span>Admin User</span>
                </button>

                <button
                  type="button"
                  (click)="fillPreset('General User')"
                  class="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#1a2530] hover:bg-[#202f3d] text-[#7da0ca] border border-[#283f57] transition-all flex items-center justify-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  <span>General User</span>
                </button>
              </div>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-4">
              <!-- User ID / Email -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Email / User ID</label>
                <input
                  type="text"
                  formControlName="userId"
                  placeholder="name@mploychek.com"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(loginForm, 'userId')"
                />
                @if (isFieldInvalid(loginForm, 'userId')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Please enter your User ID or email</p>
                }
              </div>

              <!-- Password -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(loginForm, 'password')"
                />
                @if (isFieldInvalid(loginForm, 'password')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Password must be at least 4 characters</p>
                }
              </div>

              <!-- Role Selector -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1.5 flex items-center justify-between">
                  <span>Account Role</span>
                  <span class="text-[10px] text-[#6b6b68]">Enforced by DB</span>
                </label>
                
                <div class="grid grid-cols-2 p-1 rounded-lg bg-[#191919] border border-[#2a2a2a] gap-1">
                  <button
                    type="button"
                    (click)="setLoginRole('General User')"
                    class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 select-none"
                    [ngClass]="
                      loginForm.get('role')?.value === 'General User'
                        ? 'bg-[#282828] text-[#ffffff] border border-[#3a3a3a] shadow-sm'
                        : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                    "
                  >
                    <span>👤</span>
                    <span>General User</span>
                  </button>

                  <button
                    type="button"
                    (click)="setLoginRole('Admin')"
                    class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 select-none"
                    [ngClass]="
                      loginForm.get('role')?.value === 'Admin'
                        ? 'bg-[#282828] text-[#bc8c74] border border-[#48372f] shadow-sm'
                        : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                    "
                  >
                    <img src="/logo.png" alt="Admin" class="w-3.5 h-3.5 object-contain" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full notion-btn-primary mt-3 py-2 text-xs font-semibold cursor-pointer"
              >
                @if (isLoading()) {
                  <span class="inline-block animate-spin mr-1">⏳</span>
                  <span>Connecting...</span>
                } @else {
                  <span>Sign In to Workspace</span>
                }
              </button>
            </form>

          } @else {

            <!-- CREATE ACCOUNT (REGISTER) FORM -->
            <form [formGroup]="registerForm" (ngSubmit)="onRegisterSubmit()" class="space-y-3.5">
              
              <!-- Full Name -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Full Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Maya Lin"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(registerForm, 'name')"
                />
                @if (isFieldInvalid(registerForm, 'name')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Name must be at least 2 characters</p>
                }
              </div>

              <!-- Work Email / User ID -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Email / User ID</label>
                <input
                  type="text"
                  formControlName="userId"
                  placeholder="maya.lin@mploychek.com"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(registerForm, 'userId')"
                />
                @if (isFieldInvalid(registerForm, 'userId')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Please enter a valid User ID or work email</p>
                }
              </div>

              <!-- Department -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Department</label>
                <input
                  type="text"
                  formControlName="department"
                  placeholder="e.g. Information Security, Product, HR"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(registerForm, 'department')"
                />
                @if (isFieldInvalid(registerForm, 'department')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Department is required</p>
                }
              </div>

              <!-- Password -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="Minimum 6 characters"
                  class="notion-input"
                  [class.border-[#e05757]]="isFieldInvalid(registerForm, 'password')"
                />
                @if (isFieldInvalid(registerForm, 'password')) {
                  <p class="text-[11px] text-[#e05757] mt-1">Password must be at least 6 characters</p>
                }
              </div>

              <!-- Initial Role Selection -->
              <div>
                <label class="block text-xs font-medium text-[#9b9a97] mb-1.5 flex items-center justify-between">
                  <span>Initial Clearance Role</span>
                  <span class="text-[10px] text-[#6b6b68]">Stored in MongoDB</span>
                </label>
                
                <div class="grid grid-cols-2 p-1 rounded-lg bg-[#191919] border border-[#2a2a2a] gap-1">
                  <button
                    type="button"
                    (click)="setRegisterRole('General User')"
                    class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 select-none"
                    [ngClass]="
                      registerForm.get('role')?.value === 'General User'
                        ? 'bg-[#282828] text-[#ffffff] border border-[#3a3a3a] shadow-sm'
                        : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                    "
                  >
                    <span>👤</span>
                    <span>General User</span>
                  </button>

                  <button
                    type="button"
                    (click)="setRegisterRole('Admin')"
                    class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 select-none"
                    [ngClass]="
                      registerForm.get('role')?.value === 'Admin'
                        ? 'bg-[#282828] text-[#bc8c74] border border-[#48372f] shadow-sm'
                        : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                    "
                  >
                    <img src="/logo.png" alt="Admin" class="w-3.5 h-3.5 object-contain" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <!-- Submit Register Button -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading()"
                class="w-full notion-btn-primary mt-3 py-2 text-xs font-semibold cursor-pointer"
              >
                @if (isLoading()) {
                  <span class="inline-block animate-spin mr-1">⏳</span>
                  <span>Provisioning Account...</span>
                } @else {
                  <span>Create Account & Enter Workspace</span>
                }
              </button>
            </form>
          }

          <div class="mt-6 pt-3.5 border-t border-[#282828] text-center">
            <span class="text-[11px] text-[#605f5b]">MongoDB In-Memory / Local Daemon &bull; JWT Auth &bull; RBAC</span>
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

  authMode = signal<'signin' | 'register'>('signin');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isConnectionError = signal<boolean>(false);

  loginForm = this.fb.group({
    userId: ['user@mploychek.com', [Validators.required, Validators.minLength(3)]],
    password: ['User@123', [Validators.required, Validators.minLength(4)]],
    role: ['General User' as UserRole, [Validators.required]],
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    userId: ['', [Validators.required, Validators.minLength(3)]],
    department: ['Engineering', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['General User' as UserRole, [Validators.required]],
  });

  setMode(mode: 'signin' | 'register'): void {
    this.authMode.set(mode);
    this.errorMessage.set(null);
    this.isConnectionError.set(false);
  }

  isFieldInvalid(form: any, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  setLoginRole(role: UserRole): void {
    this.loginForm.patchValue({ role });
  }

  setRegisterRole(role: UserRole): void {
    this.registerForm.patchValue({ role });
  }

  fillPreset(role: UserRole): void {
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
    this.errorMessage.set(null);
    this.isConnectionError.set(false);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isConnectionError.set(false);

    const { userId, password, role } = this.loginForm.value;

    this.authService
      .login({
        userId: userId!.trim(),
        password: password!,
        role: role as UserRole,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.handleHttpError(err);
        },
      });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isConnectionError.set(false);

    const formVal = this.registerForm.value;

    this.authService
      .register({
        name: formVal.name!.trim(),
        userId: formVal.userId!.trim(),
        department: formVal.department!.trim(),
        password: formVal.password!,
        role: formVal.role as UserRole,
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.handleHttpError(err);
        },
      });
  }

  private handleHttpError(err: any): void {
    if (err.status === 0 || err.status === 504) {
      this.isConnectionError.set(true);
      this.errorMessage.set(
        'Backend API is not responding on port 3000. Please ensure the backend server is running.'
      );
    } else {
      this.isConnectionError.set(false);
      this.errorMessage.set(
        err.error?.message ||
          err.error?.error ||
          'Authentication failed. Please verify your credentials and role.'
      );
    }
  }
}
