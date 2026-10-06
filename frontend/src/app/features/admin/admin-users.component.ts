import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, CreateUserData } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { DelayService } from '../../core/services/delay.service';
import { IUser, UserRole, UserStatus } from '../../core/models/auth.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- Top Header & Breadcrumb -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <a routerLink="/dashboard" class="hover:text-slate-200">Dashboard</a>
            <span>/</span>
            <span class="text-amber-400 font-medium">User Management</span>
          </div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Database User Administration</span>
            <span class="badge-admin">Admin Protected</span>
          </h1>
          <p class="text-xs text-slate-400 mt-1">Manage user credentials, assign roles, toggle security status, and create new DB accounts</p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="loadUsers()" [disabled]="userService.isLoading()" class="btn-secondary text-xs">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <button (click)="openCreateModal()" class="btn-primary text-xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <!-- Users Table Card -->
      <div class="glass-card overflow-hidden">
        <!-- Toolbar -->
        <div class="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-300">Registered Accounts:</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {{ filteredUsers().length }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Search Filter -->
            <div class="relative min-w-[200px]">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by name, ID, department..."
                class="glass-input text-xs py-1.5 pl-8 pr-3"
              />
              <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Role Filter -->
            <select
              [(ngModel)]="selectedRole"
              class="bg-slate-950 text-slate-300 rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="General User">General User</option>
            </select>
          </div>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="py-3.5 px-4">User</th>
                <th class="py-3.5 px-4">User ID / Email</th>
                <th class="py-3.5 px-4">Department</th>
                <th class="py-3.5 px-4">Role & Quick Switch</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Last Login</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-800/60">
              @if (userService.isLoading()) {
                @for (i of [1, 2, 3, 4]; track i) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-3.5 w-32 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-40 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-24 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-5 w-24 bg-slate-800 rounded-full"></div></td>
                    <td class="py-3.5 px-4"><div class="h-5 w-16 bg-slate-800 rounded-full"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-28 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4 text-right"><div class="h-7 w-20 bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              } @else {
                @for (user of filteredUsers(); track user._id) {
                  <tr class="hover:bg-slate-900/60 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                          {{ user.name.substring(0, 2).toUpperCase() }}
                        </div>
                        <div>
                          <div class="font-medium text-slate-200">{{ user.name }}</div>
                          @if (user.userId === authService.currentUser()?.userId) {
                            <span class="text-[10px] text-brand-400 font-semibold">(You)</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 font-mono text-slate-300">
                      {{ user.userId }}
                    </td>
                    <td class="py-3.5 px-4 text-slate-300">
                      {{ user.department }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        @if (user.role === 'Admin') {
                          <span class="badge-admin">Admin</span>
                        } @else {
                          <span class="badge-user">General User</span>
                        }

                        <!-- Quick Toggle Role Button -->
                        <button
                          (click)="toggleRole(user)"
                          [disabled]="user.userId === authService.currentUser()?.userId"
                          title="Switch role between General User and Admin"
                          class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <button
                        (click)="toggleStatus(user)"
                        [disabled]="user.userId === authService.currentUser()?.userId"
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5"
                        [ngClass]="
                          user.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                        "
                        title="Click to toggle status"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                        <span>{{ user.status }}</span>
                      </button>
                    </td>
                    <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {{ user.lastLoginAt ? (user.lastLoginAt | date: 'short') : 'Never' }}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button
                        (click)="confirmDelete(user)"
                        [disabled]="user.userId === authService.currentUser()?.userId"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete user from database"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create User Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="glass-card max-w-md w-full p-6 border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add User to MongoDB Database</span>
              </h3>
              <button (click)="closeCreateModal()" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <form [formGroup]="userForm" (ngSubmit)="onCreateUser()" class="space-y-3.5 py-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">User ID / Email</label>
                <input
                  type="text"
                  formControlName="userId"
                  placeholder="e.g. michael.chang@mploychek.com"
                  class="glass-input"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Michael Chang"
                  class="glass-input"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  formControlName="department"
                  placeholder="e.g. Information Technology"
                  class="glass-input"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="At least 6 characters"
                  class="glass-input"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                  <select formControlName="role" class="glass-input cursor-pointer">
                    <option value="General User">General User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Account Status</label>
                  <select formControlName="status" class="glass-input cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button type="button" (click)="closeCreateModal()" class="btn-secondary text-xs">Cancel</button>
                <button type="submit" [disabled]="userForm.invalid || isSubmitting()" class="btn-primary text-xs">
                  @if (isSubmitting()) {
                    <span>Saving to MongoDB...</span>
                  } @else {
                    <span>Save User</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (userToDelete()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="glass-card max-w-sm w-full p-6 border-rose-500/40 shadow-2xl animate-in zoom-in-95 duration-150">
            <div class="flex items-center gap-3 mb-3 text-rose-400">
              <svg class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-sm font-bold text-white">Confirm User Deletion</h3>
            </div>
            
            <p class="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete user <strong class="text-white">{{ userToDelete()?.name }}</strong> (<code class="text-brand-300">{{ userToDelete()?.userId }}</code>) from the database?
            </p>

            <div class="mt-5 flex justify-end gap-2.5">
              <button (click)="userToDelete.set(null)" class="btn-secondary text-xs">Cancel</button>
              <button (click)="executeDelete()" class="btn-primary bg-rose-600 hover:bg-rose-500 text-xs shadow-rose-600/30">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);
  delayService = inject(DelayService);
  private fb = inject(FormBuilder);

  searchQuery = '';
  selectedRole = 'ALL';

  showCreateModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  userToDelete = signal<IUser | null>(null);

  userForm = this.fb.group({
    userId: ['', [Validators.required, Validators.minLength(3)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    department: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['General User' as UserRole, [Validators.required]],
    status: ['Active' as UserStatus, [Validators.required]],
  });

  filteredUsers = computed(() => {
    const list = this.userService.users();
    const query = this.searchQuery.toLowerCase().trim();
    const role = this.selectedRole;

    return list.filter((u) => {
      const matchesQuery =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.userId.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query);

      const matchesRole = role === 'ALL' || u.role === role;

      return matchesQuery && matchesRole;
    });
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe();
  }

  openCreateModal(): void {
    this.userForm.reset({
      userId: '',
      name: '',
      department: '',
      password: '',
      role: 'General User',
      status: 'Active',
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.userForm.value;
    const payload: CreateUserData = {
      userId: val.userId!,
      name: val.name!,
      department: val.department!,
      password: val.password!,
      role: val.role as UserRole,
      status: val.status as UserStatus,
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  toggleRole(user: IUser): void {
    const newRole: UserRole = user.role === 'Admin' ? 'General User' : 'Admin';
    this.userService.updateUser(user._id, { role: newRole }).subscribe();
  }

  toggleStatus(user: IUser): void {
    this.userService.toggleStatus(user._id).subscribe();
  }

  confirmDelete(user: IUser): void {
    this.userToDelete.set(user);
  }

  executeDelete(): void {
    const target = this.userToDelete();
    if (!target) return;

    this.userService.deleteUser(target._id).subscribe({
      next: () => {
        this.userToDelete.set(null);
      },
    });
  }
}
