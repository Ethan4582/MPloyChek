import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RecordService } from '../../core/services/record.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { IEmployeeRecord } from '../../core/models/record.models';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { AddRecordModalComponent } from './add-record-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SidebarComponent,
    WorkspaceHeaderComponent,
    AddRecordModalComponent,
  ],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      
      <!-- Collapsible Vertical Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Workspace View Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]="sidebarService.isOpen()"
        [class.md:pl-0]="!sidebarService.isOpen()"
      >
        
        <!-- Breadcrumb & Contextual Header (Top-Right Action Button) -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'Employment Verification Directory' }]"
          [actionLabel]="authService.isAdmin() ? '+ New Record' : '🔄 Sync'"
          [actionIcon]="authService.isAdmin() ? '➕' : '🔄'"
          [isActionLoading]="recordService.isLoading()"
          (actionClicked)="onHeaderAction()"
          (refreshClicked)="loadRecords()"
        ></app-workspace-header>

        <!-- Edge-to-Edge Workspace Container -->
        <div class="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          
          <!-- Page Header & Access Scope Callout -->
          <div class="space-y-3">
            <div class="space-y-1">
              <h1 class="text-2xl font-bold text-[#ffffff] tracking-tight">Employment Verification Directory</h1>
              <p class="text-xs text-[#9b9a97]">
                Secure RBAC directory of employee screening audits, clearances, and background checks.
              </p>
            </div>

            <!-- Active Profile & Scope Callout -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#202020] border border-[#2f2f2f] text-xs">
              <div class="flex items-start sm:items-center gap-3">
                <div class="w-8 h-8 rounded-md bg-[#292929] border border-[#383838] flex items-center justify-center text-xs font-semibold text-[#e6e6e5] shrink-0">
                  {{ getUserInitials() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-[#e6e6e5]">{{ authService.currentUser()?.name }}</span>
                    <span class="text-[#605f5b]">&bull;</span>
                    <span class="text-[#9b9a97] font-mono text-[11px]">{{ authService.currentUser()?.userId }}</span>
                    
                    @if (authService.isAdmin()) {
                      <span class="tag-bronze">Admin Clearance</span>
                    } @else {
                      <span class="tag-blue">General User</span>
                    }
                  </div>
                  <div class="text-[11px] text-[#787774] mt-0.5">
                    Department: {{ authService.currentUser()?.department || 'Operations' }} &bull; Access Policy: 
                    <span class="text-[#e6e6e5]">{{ authService.isAdmin() ? 'Full DB Records & Administration' : 'Restricted Personal Scope' }}</span>
                  </div>
                </div>
              </div>

              <!-- Scope Indicator Badge -->
              <div class="flex items-center gap-2">
                <span class="tag-default text-[11px]">
                  <span>Status: </span>
                  <strong class="text-[#e6e6e5] font-mono">Active</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Main Directory Data View (Notion Database Layout) -->
          <div class="notion-card border-[#2a2a2a] bg-[#202020] overflow-hidden shadow-notion-card">
            
            <!-- Database Controls Bar -->
            <div class="p-3 sm:px-4 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <!-- Tab Views Filter (ALL, Verified, Pending, Flagged) -->
              <div class="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  (click)="setView('ALL')"
                  class="px-2.5 py-1 rounded transition-colors"
                  [ngClass]="activeView() === 'ALL' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
                >
                  All Records
                </button>

                <button
                  type="button"
                  (click)="setView('Verified')"
                  class="px-2.5 py-1 rounded transition-colors"
                  [ngClass]="activeView() === 'Verified' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
                >
                  Verified
                </button>

                <button
                  type="button"
                  (click)="setView('Pending Review')"
                  class="px-2.5 py-1 rounded transition-colors"
                  [ngClass]="activeView() === 'Pending Review' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
                >
                  Pending
                </button>

                <button
                  type="button"
                  (click)="setView('Flagged')"
                  class="px-2.5 py-1 rounded transition-colors"
                  [ngClass]="activeView() === 'Flagged' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
                >
                  Flagged
                </button>
              </div>

              <!-- Filters & Search Toolbar -->
              <div class="flex flex-wrap items-center gap-2">
                
                <!-- Search Bar -->
                <div class="relative">
                  <input
                    type="text"
                    [value]="searchQuery()"
                    (input)="onSearchInput($event)"
                    placeholder="Search database..."
                    class="notion-input py-1 px-2.5 w-44 sm:w-56 text-xs"
                  />
                  @if (searchQuery()) {
                    <button
                      (click)="searchQuery.set('')"
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#787774] hover:text-[#e6e6e5]"
                    >
                      ✕
                    </button>
                  }
                </div>

                <!-- Status Filter Dropdown Trigger -->
                <div class="relative">
                  <button
                    type="button"
                    (click)="toggleStatusMenu()"
                    class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                    [class.border-[#529cca]]="selectedStatus() !== 'ALL'"
                    [class.text-[#529cca]]="selectedStatus() !== 'ALL'"
                  >
                    <span>Status: <strong>{{ selectedStatus() === 'ALL' ? 'All' : selectedStatus() }}</strong></span>
                    <svg class="w-3 h-3 text-[#787774]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Popover Menu -->
                  @if (isStatusMenuOpen()) {
                    <div (click)="isStatusMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
                    <div class="absolute right-0 mt-1 w-40 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6b6b68]">Filter by Status</div>
                      @for (status of statusOptions; track status) {
                        <button
                          type="button"
                          (click)="selectStatus(status)"
                          class="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left hover:bg-[#2f2f2f] transition-colors"
                          [class.text-[#529cca]]="selectedStatus() === status"
                        >
                          <span>{{ status === 'ALL' ? 'All Statuses' : status }}</span>
                          @if (selectedStatus() === status) {
                            <svg class="w-3.5 h-3.5 text-[#529cca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- Access Level Filter Dropdown Trigger -->
                <div class="relative">
                  <button
                    type="button"
                    (click)="toggleAccessMenu()"
                    class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                    [class.border-[#529cca]]="selectedAccessLevel() !== 'ALL'"
                    [class.text-[#529cca]]="selectedAccessLevel() !== 'ALL'"
                  >
                    <span>Clearance: <strong>{{ selectedAccessLevel() === 'ALL' ? 'All' : selectedAccessLevel() }}</strong></span>
                    <svg class="w-3 h-3 text-[#787774]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Popover Menu -->
                  @if (isAccessMenuOpen()) {
                    <div (click)="isAccessMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
                    <div class="absolute right-0 mt-1 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div class="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6b6b68]">Filter by Clearance</div>
                      @for (level of accessOptions; track level) {
                        <button
                          type="button"
                          (click)="selectAccessLevel(level)"
                          class="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left hover:bg-[#2f2f2f] transition-colors"
                          [class.text-[#529cca]]="selectedAccessLevel() === level"
                        >
                          <span>{{ level === 'ALL' ? 'All Clearances' : level }}</span>
                          @if (selectedAccessLevel() === level) {
                            <svg class="w-3.5 h-3.5 text-[#529cca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- Clear filters button -->
                @if (hasActiveFilters()) {
                  <button
                    type="button"
                    (click)="resetFilters()"
                    class="notion-btn-ghost text-xs py-1 px-2 text-[#9b9a97] hover:text-[#ffffff]"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                }

              </div>
            </div>

            <!-- Database Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-[#1c1c1c] text-[#787774] font-medium border-b border-[#2a2a2a] text-[11px] select-none">
                  <tr>
                    <th class="py-2.5 px-3 w-32 border-r border-[#2a2a2a]">
                      Record ID
                    </th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                      Candidate
                    </th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                      Role & Team
                    </th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                      Clearance
                    </th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                      Status
                    </th>
                    <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                      Screen Date
                    </th>

                    <!-- Admin Protected Columns -->
                    @if (authService.isAdmin()) {
                      <th class="py-2.5 px-3 border-r border-[#2a2a2a] text-[#bc8c74]">
                        Compensation
                      </th>
                      <th class="py-2.5 px-3 border-r border-[#2a2a2a] text-[#bc8c74]">
                        Risk Score
                      </th>
                      <th class="py-2.5 px-3 border-r border-[#2a2a2a] text-[#bc8c74]">
                        Audit Notes
                      </th>
                    }

                    <th class="py-2.5 px-3 w-16 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-[#262626]">
                  @if (recordService.isLoading()) {
                    <tr>
                      <td [attr.colspan]="authService.isAdmin() ? 10 : 7" class="py-12 text-center text-[#787774]">
                        <div class="flex flex-col items-center justify-center gap-2">
                          <span class="inline-block animate-spin text-xl">⏳</span>
                          <span class="text-xs">Fetching records from MongoDB...</span>
                        </div>
                      </td>
                    </tr>
                  } @else if (filteredRecords().length === 0) {
                    <tr>
                      <td [attr.colspan]="authService.isAdmin() ? 10 : 7" class="py-12 text-center text-[#787774]">
                        <div class="flex flex-col items-center justify-center gap-1.5">
                          <span class="text-2xl">📋</span>
                          <p class="text-xs font-medium text-[#9b9a97]">No verification records found</p>
                          <p class="text-[11px] text-[#605f5b]">Try adjusting your search query or status filter.</p>
                        </div>
                      </td>
                    </tr>
                  } @else {
                    @for (record of filteredRecords(); track record._id) {
                      <tr
                        class="hover:bg-[#232323] transition-colors group cursor-pointer"
                        (click)="viewRecordDetails(record)"
                      >
                        <td class="py-2 px-3 font-mono text-[11px] text-[#7da0ca] border-r border-[#262626]">
                          {{ record.recordId }}
                        </td>

                        <td class="py-2 px-3 border-r border-[#262626]">
                          <div class="font-medium text-[#e6e6e5]">{{ record.employeeName }}</div>
                          <div class="text-[10px] text-[#787774] font-mono">{{ record.userId }}</div>
                        </td>

                        <td class="py-2 px-3 border-r border-[#262626]">
                          <div class="text-[#e6e6e5]">{{ record.position }}</div>
                          <div class="text-[10px] text-[#787774]">{{ record.department }}</div>
                        </td>

                        <td class="py-2 px-3 border-r border-[#262626]">
                          @if (record.accessLevel === 'General') {
                            <span class="tag-blue">{{ record.accessLevel }}</span>
                          } @else if (record.accessLevel === 'Confidential') {
                            <span class="tag-bronze">{{ record.accessLevel }}</span>
                          } @else {
                            <span class="tag-orange">{{ record.accessLevel }}</span>
                          }
                        </td>

                        <!-- Status Pill -->
                        <td class="py-2 px-3 border-r border-[#262626]">
                          @if (record.verificationStatus === 'Verified') {
                            <span class="tag-green">Verified</span>
                          } @else if (record.verificationStatus === 'Pending Review') {
                            <span class="tag-yellow">Pending</span>
                          } @else {
                            <span class="tag-red">Flagged</span>
                          }
                        </td>

                        <td class="py-2 px-3 font-mono text-[11px] text-[#9b9a97] border-r border-[#262626]">
                          {{ record.backgroundCheckDate }}
                        </td>

                        <!-- Admin Only Metrics -->
                        @if (authService.isAdmin()) {
                          <td class="py-2 px-3 font-mono text-[11px] text-[#e6e6e5] border-r border-[#262626]">
                            {{ record.compensationGrade || 'N/A' }}
                          </td>

                          <td class="py-2 px-3 border-r border-[#262626]">
                            @if (record.riskScore !== undefined) {
                              <span
                                class="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                [ngClass]="{
                                  'tag-green': record.riskScore <= 10,
                                  'tag-yellow': record.riskScore > 10 && record.riskScore <= 30,
                                  'tag-red': record.riskScore > 30
                                }"
                              >
                                {{ record.riskScore }}%
                              </span>
                            }
                          </td>

                          <td class="py-2 px-3 text-[#9b9a97] max-w-xs truncate border-r border-[#262626]" [title]="record.auditNotes || ''">
                            {{ record.auditNotes || '—' }}
                          </td>
                        }

                        <!-- Action Cell -->
                        <td class="py-2 px-3 text-right" (click)="$event.stopPropagation()">
                          <button
                            type="button"
                            (click)="viewRecordDetails(record)"
                            class="p-1 rounded text-[#787774] hover:text-[#ffffff] hover:bg-[#2d2d2d] transition-colors"
                            title="Inspect Record Detail"
                          >
                            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </td>

                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Table Footer Status / Count -->
            <div class="px-4 py-2 bg-[#1b1b1b] border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-[#787774]">
              <div class="flex items-center gap-3">
                <span>Count: <strong class="text-[#9b9a97] font-mono">{{ filteredRecords().length }}</strong></span>
                @if (recordService.meta()) {
                  <span>&bull;</span>
                  <span>Scope: <strong class="text-[#9b9a97]">{{ recordService.meta()?.scope }}</strong></span>
                }
              </div>
              <span class="text-[10px] text-[#555552]">MongoDB Mongoose Indexed View</span>
            </div>

          </div>

        </div>

      </div>

      <!-- Record Detail Modal -->
      @if (selectedRecord()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="notion-card max-w-lg w-full p-6 border-[#383838] bg-[#222222] shadow-notion-dropdown animate-in zoom-in-95 duration-100">
            <div class="flex items-start justify-between pb-3 border-b border-[#2f2f2f]">
              <div>
                <h3 class="text-sm font-semibold text-[#ffffff]">{{ selectedRecord()?.employeeName }}</h3>
                <p class="text-xs text-[#9b9a97] font-mono">{{ selectedRecord()?.recordId }} &bull; {{ selectedRecord()?.position }}</p>
              </div>
              <button (click)="selectedRecord.set(null)" class="text-[#787774] hover:text-[#ffffff] text-sm p-1">✕</button>
            </div>

            <!-- Properties List -->
            <div class="py-4 space-y-2.5 text-xs">
              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774]">Department</span>
                <span class="col-span-2 text-[#e6e6e5]">{{ selectedRecord()?.department }}</span>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774]">Status</span>
                <div class="col-span-2">
                  @if (selectedRecord()?.verificationStatus === 'Verified') {
                    <span class="tag-green">Verified</span>
                  } @else if (selectedRecord()?.verificationStatus === 'Pending Review') {
                    <span class="tag-yellow">Pending</span>
                  } @else {
                    <span class="tag-red">Flagged</span>
                  }
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774]">Access Level</span>
                <span class="col-span-2 text-[#e6e6e5]">{{ selectedRecord()?.accessLevel }} Clearance</span>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774]">Check Date</span>
                <span class="col-span-2 font-mono text-[#e6e6e5]">{{ selectedRecord()?.backgroundCheckDate }}</span>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774]">Masked ID</span>
                <span class="col-span-2 font-mono text-[#e6e6e5]">{{ selectedRecord()?.govIdMasked || 'XXX-XX-####' }}</span>
              </div>

              <!-- Admin Only Sensitive Section in Modal -->
              @if (authService.isAdmin()) {
                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#bc8c74]">Comp Grade</span>
                  <span class="col-span-2 font-mono text-[#ffffff]">{{ selectedRecord()?.compensationGrade || 'None' }}</span>
                </div>

                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#bc8c74]">Risk Score</span>
                  <span class="col-span-2 font-mono text-[#ffffff]">{{ selectedRecord()?.riskScore !== undefined ? selectedRecord()?.riskScore + '%' : 'None' }}</span>
                </div>

                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#bc8c74]">Audit Notes</span>
                  <span class="col-span-2 text-[#e6e6e5]">{{ selectedRecord()?.auditNotes || 'None' }}</span>
                </div>
              } @else {
                <div class="p-2.5 bg-[#191919] rounded border border-[#2a2a2a] text-[11px] text-[#787774]">
                  Confidential compensation and risk metrics are restricted to Administrator roles.
                </div>
              }
            </div>

            <div class="pt-3 border-t border-[#2f2f2f] flex justify-end">
              <button (click)="selectedRecord.set(null)" class="notion-btn text-xs">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Add Record Modal (Admin Action) -->
      @if (isAddRecordModalOpen()) {
        <app-add-record-modal
          (recordCreated)="loadRecords()"
          (close)="isAddRecordModalOpen.set(false)"
        ></app-add-record-modal>
      }

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  recordService = inject(RecordService);
  sidebarService = inject(SidebarService);

  activeView = signal<string>('ALL');
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('ALL');
  selectedAccessLevel = signal<string>('ALL');

  isStatusMenuOpen = signal<boolean>(false);
  isAccessMenuOpen = signal<boolean>(false);
  isAddRecordModalOpen = signal<boolean>(false);

  selectedRecord = signal<IEmployeeRecord | null>(null);

  statusOptions = ['ALL', 'Verified', 'Pending Review', 'Flagged'];
  accessOptions = ['ALL', 'General', 'Confidential', 'Executive'];

  filteredRecords = computed(() => {
    let list = this.recordService.records();

    // 1. Tab view filter
    if (this.activeView() !== 'ALL') {
      list = list.filter((r) => r.verificationStatus === this.activeView());
    }

    // 2. Status dropdown filter
    if (this.selectedStatus() !== 'ALL') {
      list = list.filter((r) => r.verificationStatus === this.selectedStatus());
    }

    // 3. Access level dropdown filter
    if (this.selectedAccessLevel() !== 'ALL') {
      list = list.filter((r) => r.accessLevel === this.selectedAccessLevel());
    }

    // 4. Search query
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.recordId.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.position.toLowerCase().includes(q) ||
          r.userId.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.recordService.getRecords().subscribe();
  }

  setView(view: string): void {
    this.activeView.set(view);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((v) => !v);
    this.isAccessMenuOpen.set(false);
  }

  toggleAccessMenu(): void {
    this.isAccessMenuOpen.update((v) => !v);
    this.isStatusMenuOpen.set(false);
  }

  selectStatus(status: string): void {
    this.selectedStatus.set(status);
    this.isStatusMenuOpen.set(false);
  }

  selectAccessLevel(level: string): void {
    this.selectedAccessLevel.set(level);
    this.isAccessMenuOpen.set(false);
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedStatus() !== 'ALL' ||
      this.selectedAccessLevel() !== 'ALL' ||
      !!this.searchQuery().trim()
    );
  }

  resetFilters(): void {
    this.selectedStatus.set('ALL');
    this.selectedAccessLevel.set('ALL');
    this.searchQuery.set('');
    this.activeView.set('ALL');
  }

  viewRecordDetails(record: IEmployeeRecord): void {
    this.selectedRecord.set(record);
  }

  onHeaderAction(): void {
    if (this.authService.isAdmin()) {
      this.isAddRecordModalOpen.set(true);
    } else {
      this.loadRecords();
    }
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
