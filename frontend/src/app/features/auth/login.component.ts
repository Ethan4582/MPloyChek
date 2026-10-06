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
    <div class="min-h-[calc(100vh-3rem)] flex items-center justify-center p-4 bg-[#191919]">
      <div class="w-full max-w-sm">
        
        <!-- Notion Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#222222] border border-[#2f2f2f] text-2xl mb-3 shadow-sm">
            🛡️
          </div>
          <h1 class="text-xl font-semibold text-[#ffffff] tracking-tight">MPloyChek Workspace</h1>
          <p class="text-xs text-[#9b9a97] mt-1">Employment Verification & RBAC Portal</p>
        </div>

        <!-- Notion Login Card -->
        <div class="notion-card p-6 border-[#2f2f2f] bg-[#202020]">
          
          <!-- Test Account Presets -->
          <div class="mb-5 p-2.5 rounded-md bg-[#191919] border border-[#2a2a2a]">
            <div class="text-[10px] font-medium uppercase tracking-wider text-[#6b6b68] mb-2 flex items-center justify-between">
              <span>Quick Fill Accounts</span>
              <span class="text-[#529cca]">1-Click</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="fillPreset('Admin')"
                class="px-2.5 py-1.5 rounded text-xs font-medium bg-[#2f223d] hover:bg-[#382649] text-[#9d68d3] border border-[#9d68d3]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>Admin User</span>
              </button>
              <button
                type="button"
                (click)="fillPreset('General User')"
                class="px-2.5 py-1.5 rounded text-xs font-medium bg-[#1e2d3d] hover:bg-[#24374b] text-[#529cca] border border-[#529cca]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>👤</span>
                <span>General User</span>
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="mb-4 p-2.5 rounded-md bg-[#3b2222] border border-[#e05757]/30 text-[#e05757] text-xs flex items-start gap-2">
              <span class="text-sm leading-none mt-0.5">⚠️</span>
              <div class="flex-1 leading-snug">{{ errorMessage() }}</div>
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
                <p class="text-[11px] text-[#e05757] mt-1">Please enter your User ID</p>
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

            <!-- Role Selector (Mandatory per assignment specs) -->
            <div>
              <label class="block text-xs font-medium text-[#9b9a97] mb-1 flex items-center justify-between">
                <span>Select Login Role</span>
                <span class="text-[10px] text-[#6b6b68]">Enforced by DB</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="setRole('General User')"
                  class="py-1.5 px-2 rounded-md border text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  [ngClass]="
                    loginForm.get('role')?.value === 'General User'
                      ? 'bg-[#1e2d3d] text-[#529cca] border-[#529cca]/50'
                      : 'bg-[#191919] text-[#787774] border-[#2f2f2f] hover:text-[#9b9a97] hover:bg-[#222222]'
                  "
                >
                  <span>👤</span>
                  <span>General User</span>
                </button>

                <button
                  type="button"
                  (click)="setRole('Admin')"
                  class="py-1.5 px-2 rounded-md border text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  [ngClass]="
                    loginForm.get('role')?.value === 'Admin'
                      ? 'bg-[#2f223d] text-[#9d68d3] border-[#9d68d3]/50'
                      : 'bg-[#191919] text-[#787774] border-[#2f2f2f] hover:text-[#9b9a97] hover:bg-[#222222]'
                  "
                >
                  <span>⚡</span>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full notion-btn-primary mt-2 py-2"
            >
              @if (isLoading()) {
                <span class="inline-block animate-spin mr-1">⏳</span>
                <span>Connecting ({{ delayService.currentDelay() }}ms)...</span>
              } @else {
                <span>Continue</span>
              }
            </button>
          </form>

          <div class="mt-5 pt-3 border-t border-[#2a2a2a] text-center">
            <span class="text-[11px] text-[#6b6b68]">MongoDB Dual-Mode &bull; JWT Authentication</span>
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
