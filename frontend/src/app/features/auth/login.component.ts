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
      <div class="w-full max-w-[420px] mx-auto animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-[#ffffff] tracking-tight">MPloyChek Workspace</h1>
          <p class="text-xs text-[#9b9a97] mt-1">Employment Verification & RBAC Portal</p>
        </div>

        <!-- Login Card -->
        <div class="notion-card p-6 sm:p-7 border-[#2f2f2f] bg-[#202020] shadow-notion-card">
          
          <!-- Test Account Quick-Fill Presets -->
          <div class="mb-5 p-3 rounded-lg bg-[#191919] border border-[#2a2a2a]">
            <div class="text-[10px] font-medium uppercase tracking-wider text-[#6b6b68] mb-2.5 flex items-center justify-between">
              <span>Quick-Fill Demo Credentials</span>
              <span class="text-[#529cca] font-mono text-[10px]">1-Click</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="fillPreset('Admin')"
                class="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#2a221c] hover:bg-[#332924] text-[#bc8c74] border border-[#48372f] transition-all flex items-center justify-center text-center"
              >
                Admin User
              </button>

              <button
                type="button"
                (click)="fillPreset('General User')"
                class="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#1a2530] hover:bg-[#202f3d] text-[#7da0ca] border border-[#283f57] transition-all flex items-center justify-center text-center"
              >
                General User
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="mb-4 p-2.5 rounded-md bg-[#3b2222] border border-[#e05757]/30 text-[#e05757] text-xs leading-snug">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- User ID / Email -->
            <div>
              <label class="block text-xs font-medium text-[#9b9a97] mb-1">Email / User ID</label>
              <input
                type="text"
                formControlName="userId"
                placeholder="name@mploychek.com"
                class="notion-input"
                [class.border-[#e05757]]="isFieldInvalid('userId')"
              />
              @if (isFieldInvalid('userId')) {
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
                [class.border-[#e05757]]="isFieldInvalid('password')"
              />
              @if (isFieldInvalid('password')) {
                <p class="text-[11px] text-[#e05757] mt-1">Password must be at least 4 characters</p>
              }
            </div>

            <!-- Role Segmented Selector -->
            <div>
              <label class="block text-xs font-medium text-[#9b9a97] mb-1.5 flex items-center justify-between">
                <span>Account Role</span>
                <span class="text-[10px] text-[#6b6b68]">Enforced by DB</span>
              </label>
              
              <div class="grid grid-cols-2 p-1 rounded-lg bg-[#191919] border border-[#2a2a2a] gap-1">
                <button
                  type="button"
                  (click)="setRole('General User')"
                  class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center select-none"
                  [ngClass]="
                    loginForm.get('role')?.value === 'General User'
                      ? 'bg-[#282828] text-[#ffffff] border border-[#3a3a3a] shadow-sm'
                      : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                  "
                >
                  General User
                </button>

                <button
                  type="button"
                  (click)="setRole('Admin')"
                  class="py-1.5 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center select-none"
                  [ngClass]="
                    loginForm.get('role')?.value === 'Admin'
                      ? 'bg-[#282828] text-[#bc8c74] border border-[#48372f] shadow-sm'
                      : 'text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                  "
                >
                  Administrator
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
                <span>Connecting...</span>
              } @else {
                <span>Sign In to Workspace</span>
              }
            </button>
          </form>

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

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    userId: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['General User' as UserRole, [Validators.required]],
  });

  fillPreset(role: UserRole): void {
    if (role === 'Admin') {
      this.loginForm.patchValue({
        userId: 'admin@mploychek.com',
        password: 'Password@123',
        role: 'Admin',
      });
    } else {
      this.loginForm.patchValue({
        userId: 'user@mploychek.com',
        password: 'Password@123',
        role: 'General User',
      });
    }
    this.errorMessage.set(null);
  }

  setRole(role: UserRole): void {
    this.loginForm.patchValue({ role });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { userId, password, role } = this.loginForm.value;

    this.authService
      .login({
        userId: userId!,
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
          this.errorMessage.set(
            err?.error?.error || 'Authentication failed. Please verify credentials.'
          );
        },
      });
  }
}
