import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, CreateUserData } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { IUser, UserRole, UserStatus } from '../../core/models/auth.models';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    SidebarComponent,
    WorkspaceHeaderComponent,
  ],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      
      <!-- Collapsible Vertical Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Workspace View Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]=\"sidebarService.isOpen()\"
        [class.md:pl-0]=\"!sidebarService.isOpen()\"
      >
        
        <!-- Breadcrumb & Contextual Header (Top-Right Action Button) -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'Verification Directory', url: '/dashboard' }, { label: 'User Administration' }]"
          actionLabel="+ New Account"
          [isActionLoading]="userService.isLoading()"
          (actionClicked)="openCreateModal()"
        ></app-workspace-header>

        <!-- Edge-to-Edge Workspace Container -->
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          
          <!-- Top Header -->
          <div class="space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold text-[#ffffff] tracking-tight">Database User Administration</h1>
                  <span class="tag-bronze">Admin Restricted</span>
                </div>
                <p class="text-xs text-[#9b9a97] mt-0.5">
                  Manage accounts, assign roles (General User / Admin), and toggle security state in MongoDB.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="loadUsers()"
                  [disabled]="userService.isLoading()"
                  class="notion-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  title="Reload users from MongoDB"
                >
                  <svg class="w-3.5 h-3.5 text-[#8a8986]" [class.animate-spin]="userService.isLoading()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{{ userService.isLoading() ? 'Syncing...' : 'Sync' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Users Database Card -->
          <div class="notion-card border-[#2a2a2a] bg-[#202020] overflow-hidden shadow-notion-card">
            
            <!-- Filter & Toolbar -->
            <div class="p-3 sm:px-4 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="relative">
                <input
                  type="text"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  placeholder="Search user accounts..."
                  class="notion-input py-1 px-2.5 w-64 text-xs"
                />
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="toggleRoleMenu()"
                  class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                  [class.text-[#529cca]]="selectedRole() !== 'ALL'"
                >
                  <span>Role: <strong>{{ selectedRole() === 'ALL' ? 'All Roles' : selectedRole() }}</strong></span>
                  <svg class="w-3 h-3 text-[#787774]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (isRoleMenuOpen()) {
                  <div (click)="isRoleMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
                  <div class="absolute right-6 mt-24 w-40 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in duration-100">
                    <button
                      type="button"
                      (click)="selectRole('ALL')"
                      class="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-[#2f2f2f] transition-colors"
                    >
                      All Roles
                    </button>
                    <button
                      type="button"
                      (click)="selectRole('Admin')"
                      class="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-[#2f2f2f] transition-colors"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      (click)="selectRole('General User')"
                      class="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-[#2f2f2f] transition-colors"
                    >
                      General User
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Table of Users -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse font-mono">
                <thead class="bg-[#1c1c1c] text-[#787774] font-medium border-b border-[#2a2a2a] text-[11px] select-none">
                  <tr>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">User ID (Email)</th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">Name</th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">Department</th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">Role</th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">Account Status</th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">Created</th>
                    <th class="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#262626]">
                  @if (userService.isLoading()) {
                    <tr>
                      <td colspan="7" class="py-12 text-center text-[#787774]">
                        <span class="inline-block animate-spin text-xl">⏳</span>
                        <div class="mt-1 text-xs">Querying MongoDB users collection...</div>
                      </td>
                    </tr>
                  } @else if (filteredUsers().length === 0) {
                    <tr>
                      <td colspan="7" class="py-8 text-center text-[#787774] text-xs">
                        No user accounts match the search criteria.
                      </td>
                    </tr>
                  } @else {
                    @for (user of filteredUsers(); track user.userId) {
                      <tr class="hover:bg-[#242424] transition-colors">
                        <td class="py-2 px-3 text-[#e6e6e5] border-r border-[#262626]">
                          {{ user.userId }}
                        </td>
                        <td class="py-2 px-3 text-[#e6e6e5] font-sans font-medium border-r border-[#262626]">
                          {{ user.name }}
                        </td>
                        <td class="py-2 px-3 text-[#9b9a97] font-sans border-r border-[#262626]">
                          {{ user.department || 'Operations' }}
                        </td>
                        <td class="py-2 px-3 border-r border-[#262626]">
                          @if (user.role === 'Admin') {
                            <span class="tag-bronze text-[10px]">Admin</span>
                          } @else {
                            <span class="tag-blue text-[10px]">General User</span>
                          }
                        </td>
                        <td class="py-2 px-3 border-r border-[#262626]">
                          @if (user.status === 'Active') {
                            <span class="tag-green text-[10px]">Active</span>
                          } @else {
                            <span class="tag-red text-[10px]">Disabled</span>
                          }
                        </td>
                        <td class="py-2 px-3 text-[#787774] text-[11px] border-r border-[#262626]">
                          {{ user.createdAt ? (user.createdAt | date:'shortDate') : 'System Seed' }}
                        </td>
                        <td class="py-2 px-3 text-right space-x-1 whitespace-nowrap">
                          <!-- Toggle Role -->
                          <button
                            type="button"
                            (click)="onToggleRole(user)"
                            class="px-2 py-0.5 rounded text-[10px] font-sans bg-[#2a2a2a] text-[#bc8c74] hover:bg-[#353535] transition-colors"
                            title="Flip role between Admin and General User"
                          >
                            Set {{ user.role === 'Admin' ? 'General' : 'Admin' }}
                          </button>

                          <!-- Toggle Status -->
                          <button
                            type="button"
                            (click)="onToggleStatus(user)"
                            class="px-2 py-0.5 rounded text-[10px] font-sans bg-[#2a2a2a] text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#353535] transition-colors"
                            title="Toggle active status"
                          >
                            {{ user.status === 'Active' ? 'Disable' : 'Enable' }}
                          </button>

                          <!-- Delete -->
                          <button
                            type="button"
                            (click)="onDeleteUser(user)"
                            class="p-1 rounded text-[#787774] hover:text-[#e05757] hover:bg-[#353535] transition-colors"
                            title="Delete user from database"
                          >
                            <svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div class="p-2.5 bg-[#1c1c1c] border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-[#787774]">
              <span>Total: <strong class="text-[#9b9a97]">{{ filteredUsers().length }}</strong> Accounts</span>
              <span class="text-[10px] text-[#555552]">MongoDB User Model Collection</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Create User Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="notion-card max-w-md w-full p-6 border-[#383838] bg-[#222222] shadow-notion-dropdown animate-in zoom-in-95 duration-100">
            <div class="flex items-center justify-between pb-3 border-b border-[#2f2f2f] mb-4">
              <h3 class="text-sm font-semibold text-[#ffffff]">Create New Database User</h3>
              <button (click)="closeCreateModal()" class="text-[#787774] hover:text-[#ffffff] text-sm">✕</button>
            </div>

            <form [formGroup]="userForm" (ngSubmit)="onCreateUser()" class="space-y-3.5 text-xs">
              <div>
                <label class="block text-[#9b9a97] mb-1 font-medium">Email / User ID</label>
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
                <label class="block text-[#9b9a97] mb-1 font-medium">Password</label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="Min 6 characters"
                  class="notion-input"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[#9b9a97] mb-1 font-medium">Role</label>
                  <select formControlName="role" class="notion-input cursor-pointer">
                    <option value="General User">General User</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[#9b9a97] mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    formControlName="department"
                    placeholder="Engineering"
                    class="notion-input"
                  />
                </div>
              </div>

              @if (createError()) {
                <div class="p-2.5 rounded bg-[#2c1d1d] border border-[#4a2a2a] text-[#e05757] text-[11px]">
                  {{ createError() }}
                </div>
              }

              <div class="pt-3 border-t border-[#2f2f2f] flex justify-end gap-2">
                <button type="button" (click)="closeCreateModal()" class="notion-btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="userForm.invalid || isSubmitting()"
                  class="notion-btn-primary"
                >
                  {{ isSubmitting() ? 'Saving...' : 'Create Account' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  private fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  selectedRole = signal<string>('ALL');
  isRoleMenuOpen = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  createError = signal<string | null>(null);

  userForm = this.fb.group({
    userId: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['General User' as UserRole, Validators.required],
    department: ['Engineering'],
    status: ['Active' as UserStatus],
  });

  filteredUsers = computed(() => {
    let list = this.userService.users();
    const q = this.searchQuery().trim().toLowerCase();

    if (this.selectedRole() !== 'ALL') {
      list = list.filter((u) => u.role === this.selectedRole());
    }

    if (q) {
      list = list.filter(
        (u) =>
          u.userId.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleRoleMenu(): void {
    this.isRoleMenuOpen.update((v) => !v);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
    this.isRoleMenuOpen.set(false);
  }

  openCreateModal(): void {
    this.userForm.reset({
      userId: '',
      password: '',
      name: '',
      role: 'General User',
      department: 'Engineering',
      status: 'Active',
    });
    this.createError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateUser(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    this.createError.set(null);

    const val = this.userForm.value as CreateUserData;
    this.userService.createUser(val).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.createError.set(err.error?.message || 'Failed to create user account.');
      },
    });
  }

  onToggleRole(user: IUser): void {
    const newRole = user.role === 'Admin' ? 'General User' : 'Admin';
    this.userService.updateUser(user.userId, { role: newRole }).subscribe();
  }

  onToggleStatus(user: IUser): void {
    const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    this.userService.updateUser(user.userId, { status: newStatus }).subscribe();
  }

  onDeleteUser(user: IUser): void {
    if (confirm(`Permanently remove ${user.name} (${user.userId}) from the database?`)) {
      this.userService.deleteUser(user.userId).subscribe();
    }
  }
}
