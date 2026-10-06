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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Top Notion Breadcrumbs & Header -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-xs text-[#9b9a97]">
          <a routerLink="/dashboard" class="hover:text-[#ffffff] transition-colors">Workspace</a>
          <span class="text-[#444444]">/</span>
          <span class="text-[#ffffff] font-medium">User Management</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl select-none">⚙️</span>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-[#ffffff] tracking-tight">Database User Administration</h1>
                <span class="tag-purple">Admin Restricted</span>
              </div>
              <p class="text-xs text-[#9b9a97] mt-0.5">
                Manage accounts, assign roles (General User / Admin), and toggle security state in MongoDB.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="loadUsers()" [disabled]="userService.isLoading()" class="notion-btn text-xs py-1.5 px-3">
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            <button (click)="openCreateModal()" class="notion-btn-primary text-xs py-1.5 px-3">
              <span>+</span>
              <span>New Account</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Users Notion Database Container -->
      <div class="notion-card overflow-hidden">
        
        <!-- Toolbar & Filter Popover -->
        <div class="p-3 border-b border-[#2f2f2f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#202020]">
          <div class="flex items-center gap-2">
            <span class="text-[#787774]">Registered DB Users:</span>
            <span class="font-mono font-medium text-[#ffffff]">{{ filteredUsers().length }}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Search Input -->
            <div class="relative">
              <input
                type="text"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                placeholder="Filter by name, ID..."
                class="notion-input py-1 pl-7 pr-2.5 w-44 sm:w-56 text-xs"
              />
              <span class="absolute left-2.5 top-1.5 text-[11px] text-[#6b6b68] pointer-events-none">🔍</span>
              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="searchQuery.set('')"
                  class="absolute right-2 top-1.5 text-[#6b6b68] hover:text-[#e6e6e5] text-xs"
                >
                  ✕
                </button>
              }
            </div>

            <!-- Role Filter Popover Trigger -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleRoleMenu()"
                class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                [class.border-[#529cca]]="selectedRole() !== 'ALL'"
                [class.text-[#529cca]]="selectedRole() !== 'ALL'"
              >
                <span>🏷️</span>
                <span>Role: <strong>{{ selectedRole() === 'ALL' ? 'All' : selectedRole() }}</strong></span>
                <svg class="w-3 h-3 text-[#787774]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Popover Menu -->
              @if (isRoleMenuOpen()) {
                <div (click)="isRoleMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
                <div class="absolute right-0 mt-1 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6b6b68]">Filter Role</div>
                  @for (role of ['ALL', 'Admin', 'General User']; track role) {
                    <button
                      type="button"
                      (click)="selectRole(role)"
                      class="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left hover:bg-[#2f2f2f] transition-colors"
                      [class.text-[#529cca]]="selectedRole() === role"
                    >
                      <span>{{ role === 'ALL' ? 'All Roles' : role }}</span>
                      @if (selectedRole() === role) {
                        <svg class="w-3.5 h-3.5 text-[#529cca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    </button>
                  }
                </div>
              }
            </div>

            @if (searchQuery() || selectedRole() !== 'ALL') {
              <button
                type="button"
                (click)="resetFilters()"
                class="notion-btn-ghost text-xs py-1 px-2 text-[#9b9a97] hover:text-[#ffffff]"
              >
                Reset
              </button>
            }
          </div>
        </div>

        <!-- Notion Users Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#1c1c1c] text-[#787774] font-medium border-b border-[#2a2a2a] text-[11px] select-none">
              <tr>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>👤</span>
                    <span>Name</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>#</span>
                    <span>User ID / Email</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>💼</span>
                    <span>Department</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>Role Assignment</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>🔘</span>
                    <span>Status</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>📅</span>
                    <span>Last Login</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[#262626]">
              @if (userService.isLoading()) {
                @for (i of [1, 2, 3, 4]; track i) {
                  <tr class="animate-pulse bg-[#202020]">
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-28 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-36 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-24 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-4 w-20 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-4 w-16 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-24 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 text-right"><div class="h-4 w-12 bg-[#2a2a2a] rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (filteredUsers().length === 0) {
                <tr>
                  <td colspan="7" class="py-12 text-center text-[#787774]">
                    No users matching criteria.
                  </td>
                </tr>
              } @else {
                @for (user of filteredUsers(); track user._id) {
                  <tr class="hover:bg-[#262626] transition-colors group">
                    <td class="py-2 px-3 border-r border-[#262626]">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-[#2a2a2a] border border-[#333333] flex items-center justify-center font-medium text-[11px] text-[#e6e6e5]">
                          {{ user.name.substring(0, 1).toUpperCase() }}
                        </div>
                        <span class="font-medium text-[#ffffff]">{{ user.name }}</span>
                        @if (user.userId === authService.currentUser()?.userId) {
                          <span class="text-[10px] text-[#529cca] font-mono">(You)</span>
                        }
                      </div>
                    </td>

                    <td class="py-2 px-3 font-mono text-[11px] text-[#9b9a97] border-r border-[#262626]">
                      {{ user.userId }}
                    </td>

                    <td class="py-2 px-3 text-[#e6e6e5] border-r border-[#262626]">
                      {{ user.department }}
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      <div class="flex items-center gap-1.5">
                        @if (user.role === 'Admin') {
                          <span class="tag-purple">Admin</span>
                        } @else {
                          <span class="tag-blue">General User</span>
                        }

                        <button
                          (click)="toggleRole(user)"
                          [disabled]="user.userId === authService.currentUser()?.userId"
                          title="Switch between General User and Admin"
                          class="notion-btn-ghost py-0.5 px-1 text-[11px] text-[#787774] hover:text-[#ffffff] disabled:opacity-30"
                        >
                          ⇄
                        </button>
                      </div>
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      <button
                        (click)="toggleStatus(user)"
                        [disabled]="user.userId === authService.currentUser()?.userId"
                        class="cursor-pointer disabled:cursor-not-allowed"
                        title="Click to toggle status"
                      >
                        @if (user.status === 'Active') {
                          <span class="tag-green">Active</span>
                        } @else {
                          <span class="tag-red">Disabled</span>
                        }
                      </button>
                    </td>

                    <td class="py-2 px-3 font-mono text-[11px] text-[#787774] border-r border-[#262626]">
                      {{ user.lastLoginAt ? (user.lastLoginAt | date: 'short') : 'Never' }}
                    </td>

                    <td class="py-2 px-3 text-right">
                      <button
                        (click)="confirmDelete(user)"
                        [disabled]="user.userId === authService.currentUser()?.userId"
                        class="notion-btn-ghost text-[#787774] hover:text-[#e05757] text-xs py-0.5 px-1.5 disabled:opacity-20"
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="p-2.5 bg-[#1c1c1c] border-t border-[#2a2a2a] text-[11px] text-[#787774]">
          Role-Based Access Control enforced at MongoDB schema and Express middleware.
        </div>

      </div>

      <!-- Create User Modal (Notion Dialog) -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="notion-card max-w-md w-full p-6 border-[#383838] bg-[#222222] shadow-notion-dropdown animate-in zoom-in-95 duration-100">
            <div class="flex items-center justify-between pb-3 border-b border-[#2f2f2f]">
              <div class="flex items-center gap-2">
                <span class="text-xl">➕</span>
                <h3 class="text-sm font-semibold text-[#ffffff]">New User Account</h3>
              </div>
              <button (click)="closeCreateModal()" class="text-[#787774] hover:text-[#ffffff] text-sm">✕</button>
            </div>

            <form [formGroup]="userForm" (ngSubmit)="onCreateUser()" class="space-y-3 py-4 text-xs">
              <div>
                <label class="block text-[#9b9a97] mb-1 font-medium">User ID / Email</label>
                <input
                  type="text"
                  formControlName="userId"
                  placeholder="e.g. michael.chang@mploychek.com"
                  class="notion-input"
                />
              </div>

              <div>
                <label class="block text-[#9b9a97] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Michael Chang"
                  class="notion-input"
                />
              </div>

              <div>
                <label class="block text-[#9b9a97] mb-1 font-medium">Department</label>
                <input
                  type="text"
                  formControlName="department"
                  placeholder="e.g. Security Engineering"
                  class="notion-input"
                />
              </div>

              <div>
                <label class="block text-[#9b9a97] mb-1 font-medium">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="At least 6 characters"
                  class="notion-input"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[#9b9a97] mb-1 font-medium">Role</label>
                  <select formControlName="role" class="notion-input cursor-pointer">
                    <option value="General User">General User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[#9b9a97] mb-1 font-medium">Status</label>
                  <select formControlName="status" class="notion-input cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div class="pt-3 border-t border-[#2f2f2f] flex justify-end gap-2">
                <button type="button" (click)="closeCreateModal()" class="notion-btn">Cancel</button>
                <button type="submit" [disabled]="userForm.invalid || isSubmitting()" class="notion-btn-primary">
                  @if (isSubmitting()) {
                    <span>Saving...</span>
                  } @else {
                    <span>Save User</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete User Modal -->
      @if (userToDelete()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="notion-card max-w-sm w-full p-5 border-[#e05757]/40 bg-[#222222] shadow-notion-dropdown">
            <h3 class="text-sm font-semibold text-[#ffffff] flex items-center gap-2">
              <span>⚠️</span>
              <span>Confirm Account Deletion</span>
            </h3>
            <p class="text-xs text-[#9b9a97] mt-2 leading-relaxed">
              Are you sure you want to permanently delete user <strong class="text-[#ffffff]">{{ userToDelete()?.name }}</strong> (<code class="text-[#529cca]">{{ userToDelete()?.userId }}</code>) from MongoDB?
            </p>

            <div class="mt-4 flex justify-end gap-2">
              <button (click)="userToDelete.set(null)" class="notion-btn">Cancel</button>
              <button (click)="executeDelete()" class="notion-btn-danger">
                Delete
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

  searchQuery = signal<string>('');
  selectedRole = signal<string>('ALL');
  isRoleMenuOpen = signal<boolean>(false);

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
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.selectedRole();

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

  toggleRoleMenu(): void {
    this.isRoleMenuOpen.update((v) => !v);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
    this.isRoleMenuOpen.set(false);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedRole.set('ALL');
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
