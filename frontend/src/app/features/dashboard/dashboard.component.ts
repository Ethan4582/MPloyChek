import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RecordService } from '../../core/services/record.service';
import { DelayService } from '../../core/services/delay.service';
import { IEmployeeRecord } from '../../core/models/record.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Notion Page Title & Header -->
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl select-none">🛡️</span>
          <div>
            <h1 class="text-2xl font-bold text-[#ffffff] tracking-tight">Employment Verification Directory</h1>
            <p class="text-xs text-[#9b9a97] mt-0.5">
              Secure RBAC directory of employee screening audits and security clearances.
            </p>
          </div>
        </div>

        <!-- Notion Callout: Active Profile & Access Scope -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#202020] border border-[#2f2f2f] text-xs">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-8 h-8 rounded bg-[#292929] border border-[#383838] flex items-center justify-center text-sm font-medium text-[#e6e6e5] shrink-0">
              {{ getUserInitials() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-[#e6e6e5]">{{ authService.currentUser()?.name }}</span>
                <span class="text-[#605f5b]">&bull;</span>
                <span class="text-[#9b9a97] font-mono text-[11px]">{{ authService.currentUser()?.userId }}</span>
                
                @if (authService.isAdmin()) {
                  <span class="tag-purple">Admin Clearance</span>
                } @else {
                  <span class="tag-blue">General User</span>
                }
              </div>
              <p class="text-[11px] text-[#787774] mt-0.5">
                {{ authService.currentUser()?.department }} &bull;
                @if (authService.isAdmin()) {
                  <span class="text-[#9d68d3]">Organization-wide scope: Viewing all records including confidential compensation & risk audit notes.</span>
                } @else {
                  <span class="text-[#529cca]">User-restricted scope: Restricted strictly to your records. Confidential data is stripped at the API.</span>
                }
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            @if (authService.isAdmin()) {
              <a routerLink="/admin/users" class="notion-btn text-xs py-1">
                <span>⚙️</span>
                <span>Manage DB Users</span>
              </a>
            }
            <button
              (click)="loadRecords()"
              [disabled]="recordService.isLoading()"
              class="notion-btn text-xs py-1"
            >
              @if (recordService.isLoading()) {
                <span class="animate-spin text-xs">⏳</span>
                <span>Fetching ({{ activeTimer() }}ms)...</span>
              } @else {
                <span>🔄</span>
                <span>Reload</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Latency Emulation Bar (Notion Toolbar) -->
      <div class="p-3 rounded-lg bg-[#202020] border border-[#2f2f2f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-sm">⏱️</span>
          <div>
            <span class="text-[#e6e6e5] font-medium">Asynchronous Latency Simulator:</span>
            <span class="text-[#9b9a97] ml-1.5 hidden sm:inline">Testing API delay handling</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          @for (opt of delayService.delayOptions; track opt.value) {
            <button
              type="button"
              (click)="onSelectDelay(opt.value)"
              class="px-2.5 py-1 rounded text-xs transition-colors"
              [ngClass]="
                delayService.currentDelay() === opt.value
                  ? 'bg-[#2f2f2f] text-[#ffffff] font-medium border border-[#3e3e3e]'
                  : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#262626] border border-transparent'
              "
            >
              {{ opt.label }}
            </button>
          }

          @if (lastDuration() !== null) {
            <span class="ml-2 pl-2 border-l border-[#2f2f2f] font-mono text-[11px] text-[#4dab7e]">
              {{ lastDuration() }}ms
            </span>
          }
        </div>
      </div>

      <!-- Live Loading Progress Bar -->
      @if (recordService.isLoading()) {
        <div class="p-2.5 rounded-lg bg-[#202020] border border-[#333333] space-y-1.5 animate-in fade-in duration-100">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-[#529cca] flex items-center gap-1.5">
              <span class="animate-pulse">●</span>
              <span>Awaiting server response with {{ delayService.currentDelay() }}ms simulated delay...</span>
            </span>
            <span class="font-mono text-[#9b9a97]">{{ activeTimer() }}ms</span>
          </div>
          <div class="w-full h-1 bg-[#191919] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#529cca] transition-all duration-75 rounded-full"
              [style.width.%]="getProgressPercent()"
            ></div>
          </div>
        </div>
      }

      <!-- Notion Database Container -->
      <div class="notion-card overflow-hidden">
        
        <!-- Notion Database Controls (Views, Filter Popovers, Search) -->
        <div class="p-3 border-b border-[#2f2f2f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-[#202020]">
          
          <!-- View Tabs (Notion style) -->
          <div class="flex items-center gap-1">
            <button
              type="button"
              (click)="setView('ALL')"
              class="px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
              [ngClass]="activeView() === 'ALL' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
            >
              <span>📋</span>
              <span>All Records</span>
              <span class="text-[10px] text-[#6b6b68]">({{ recordService.records().length }})</span>
            </button>

            <button
              type="button"
              (click)="setView('Verified')"
              class="px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
              [ngClass]="activeView() === 'Verified' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#4dab7e]"></span>
              <span>Verified</span>
            </button>

            <button
              type="button"
              (click)="setView('Pending Review')"
              class="px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
              [ngClass]="activeView() === 'Pending Review' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#d8a33f]"></span>
              <span>Pending</span>
            </button>

            <button
              type="button"
              (click)="setView('Flagged')"
              class="px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
              [ngClass]="activeView() === 'Flagged' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#9b9a97] hover:text-[#e6e6e5] hover:bg-[#252525]'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#e05757]"></span>
              <span>Flagged</span>
            </button>
          </div>

          <!-- Filters & Search Toolbar (shadcn/Notion Popover Style) -->
          <div class="flex flex-wrap items-center gap-2">
            
            <!-- Search Bar -->
            <div class="relative">
              <input
                type="text"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                placeholder="Search database..."
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

            <!-- Status Filter Popover Trigger -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleStatusMenu()"
                class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                [class.border-[#529cca]]="selectedStatus() !== 'ALL'"
                [class.text-[#529cca]]="selectedStatus() !== 'ALL'"
              >
                <span>🔘</span>
                <span>Status: <strong>{{ selectedStatus() === 'ALL' ? 'All' : selectedStatus() }}</strong></span>
                <svg class="w-3 h-3 text-[#787774]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Popover Menu -->
              @if (isStatusMenuOpen()) {
                <div (click)="isStatusMenuOpen.set(false)" class="fixed inset-0 z-40"></div>
                <div class="absolute right-0 mt-1 w-44 bg-[#252525] border border-[#333333] rounded-lg shadow-notion-dropdown p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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

            <!-- Access Level Filter Popover Trigger -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleAccessMenu()"
                class="notion-btn py-1 px-2.5 text-xs flex items-center gap-1.5"
                [class.border-[#529cca]]="selectedAccessLevel() !== 'ALL'"
                [class.text-[#529cca]]="selectedAccessLevel() !== 'ALL'"
              >
                <span>🏷️</span>
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

            <!-- Clear filters button if active -->
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

        <!-- Notion Database Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <!-- Table Header with Notion Property Icons -->
            <thead class="bg-[#1c1c1c] text-[#787774] font-medium border-b border-[#2a2a2a] text-[11px] select-none">
              <tr>
                <th class="py-2.5 px-3 w-32 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>#</span>
                    <span>Record ID</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>👤</span>
                    <span>Candidate</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>💼</span>
                    <span>Role & Team</span>
                  </span>
                </th>
                <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                  <span class="flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>Clearance</span>
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
                    <span>Screen Date</span>
                  </span>
                </th>

                <!-- Admin Protected Columns -->
                @if (authService.isAdmin()) {
                  <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                    <span class="flex items-center gap-1.5 text-[#9d68d3]">
                      <span>🔒</span>
                      <span>Comp Grade</span>
                    </span>
                  </th>
                  <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                    <span class="flex items-center gap-1.5 text-[#9d68d3]">
                      <span>🔒</span>
                      <span>Risk</span>
                    </span>
                  </th>
                  <th class="py-2.5 px-3 border-r border-[#2a2a2a]">
                    <span class="flex items-center gap-1.5 text-[#9d68d3]">
                      <span>🔒</span>
                      <span>Audit Notes</span>
                    </span>
                  </th>
                }

                <th class="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[#262626]">
              <!-- Loading Skeleton State -->
              @if (recordService.isLoading()) {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr class="animate-pulse bg-[#202020]">
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-20 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-28 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-36 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-4 w-16 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-4 w-16 bg-[#2a2a2a] rounded"></div></td>
                    <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-20 bg-[#2a2a2a] rounded"></div></td>
                    @if (authService.isAdmin()) {
                      <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-12 bg-[#2a2a2a] rounded"></div></td>
                      <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-10 bg-[#2a2a2a] rounded"></div></td>
                      <td class="py-2.5 px-3 border-r border-[#262626]"><div class="h-3 w-32 bg-[#2a2a2a] rounded"></div></td>
                    }
                    <td class="py-2.5 px-3 text-right"><div class="h-5 w-12 bg-[#2a2a2a] rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (filteredRecords().length === 0) {
                <tr>
                  <td [attr.colspan]="authService.isAdmin() ? 10 : 7" class="py-12 text-center text-[#787774]">
                    <div class="flex flex-col items-center justify-center gap-1.5">
                      <span class="text-xl">📭</span>
                      <p class="text-xs font-medium text-[#9b9a97]">No records match the current filters.</p>
                      <button (click)="resetFilters()" class="text-xs text-[#529cca] hover:underline mt-1">
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              } @else {
                <!-- Render Database Rows -->
                @for (record of filteredRecords(); track record._id) {
                  <tr class="hover:bg-[#262626] transition-colors group">
                    <td class="py-2 px-3 font-mono text-[11px] text-[#9b9a97] border-r border-[#262626]">
                      {{ record.recordId }}
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      <div class="font-medium text-[#ffffff]">{{ record.employeeName }}</div>
                      <div class="text-[10px] text-[#605f5b] font-mono">{{ record.userId }}</div>
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      <div class="text-[#e6e6e5]">{{ record.position }}</div>
                      <div class="text-[10px] text-[#787774]">{{ record.department }}</div>
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      @if (record.accessLevel === 'General') {
                        <span class="tag-blue">{{ record.accessLevel }}</span>
                      } @else if (record.accessLevel === 'Confidential') {
                        <span class="tag-purple">{{ record.accessLevel }}</span>
                      } @else {
                        <span class="tag-orange">{{ record.accessLevel }}</span>
                      }
                    </td>

                    <td class="py-2 px-3 border-r border-[#262626]">
                      @if (record.verificationStatus === 'Verified') {
                        <span class="tag-green">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#4dab7e]"></span>
                          <span>Verified</span>
                        </span>
                      } @else if (record.verificationStatus === 'Pending Review') {
                        <span class="tag-yellow">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#d8a33f]"></span>
                          <span>Pending</span>
                        </span>
                      } @else {
                        <span class="tag-red">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#e05757]"></span>
                          <span>Flagged</span>
                        </span>
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

                    <td class="py-2 px-3 text-right">
                      <button
                        (click)="selectRecord(record)"
                        class="notion-btn-ghost text-[11px] py-0.5 px-2 opacity-80 group-hover:opacity-100"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Notion Database Footer -->
        <div class="p-2.5 bg-[#1c1c1c] border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-[#787774]">
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

      <!-- Record Detail Modal (Notion Side Peek Dialog Style) -->
      @if (selectedRecord()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="notion-card max-w-lg w-full p-6 border-[#383838] bg-[#222222] shadow-notion-dropdown animate-in zoom-in-95 duration-100">
            <div class="flex items-start justify-between pb-3 border-b border-[#2f2f2f]">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">📋</span>
                <div>
                  <h3 class="text-sm font-semibold text-[#ffffff]">{{ selectedRecord()?.employeeName }}</h3>
                  <p class="text-xs text-[#9b9a97] font-mono">{{ selectedRecord()?.recordId }} &bull; {{ selectedRecord()?.position }}</p>
                </div>
              </div>
              <button (click)="selectedRecord.set(null)" class="text-[#787774] hover:text-[#ffffff] text-sm p-1">✕</button>
            </div>

            <!-- Properties List (Notion Page Properties Style) -->
            <div class="py-4 space-y-2.5 text-xs">
              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774] flex items-center gap-1"><span>💼</span> Department</span>
                <span class="col-span-2 text-[#e6e6e5]">{{ selectedRecord()?.department }}</span>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774] flex items-center gap-1"><span>🔘</span> Status</span>
                <div class="col-span-2">
                  @if (selectedRecord()?.verificationStatus === 'Verified') {
                    <span class="tag-green">Verified</span>
                  } @else if (selectedRecord()?.verificationStatus === 'Pending Review') {
                    <span class="tag-yellow">Pending Review</span>
                  } @else {
                    <span class="tag-red">Flagged</span>
                  }
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774] flex items-center gap-1"><span>🏷️</span> Clearance</span>
                <div class="col-span-2">
                  <span class="tag-blue">{{ selectedRecord()?.accessLevel }}</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                <span class="text-[#787774] flex items-center gap-1"><span>📅</span> Screen Date</span>
                <span class="col-span-2 font-mono text-[#e6e6e5]">{{ selectedRecord()?.backgroundCheckDate }}</span>
              </div>

              @if (authService.isAdmin()) {
                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#9d68d3] flex items-center gap-1"><span>🔒</span> Comp Grade</span>
                  <span class="col-span-2 font-mono text-[#ffffff]">{{ selectedRecord()?.compensationGrade || 'None' }}</span>
                </div>

                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#9d68d3] flex items-center gap-1"><span>🔒</span> Risk Score</span>
                  <span class="col-span-2 font-mono text-[#ffffff]">{{ selectedRecord()?.riskScore }}%</span>
                </div>

                <div class="grid grid-cols-3 gap-2 py-1 border-b border-[#2a2a2a]">
                  <span class="text-[#9d68d3] flex items-center gap-1"><span>🔒</span> Audit Notes</span>
                  <p class="col-span-2 text-[#e6e6e5] leading-relaxed">{{ selectedRecord()?.auditNotes }}</p>
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

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  recordService = inject(RecordService);
  delayService = inject(DelayService);

  // Angular Signals for fully reactive filters
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('ALL');
  selectedAccessLevel = signal<string>('ALL');
  activeView = signal<'ALL' | 'Verified' | 'Pending Review' | 'Flagged'>('ALL');

  // Popover menus state
  isStatusMenuOpen = signal<boolean>(false);
  isAccessMenuOpen = signal<boolean>(false);

  readonly statusOptions = ['ALL', 'Verified', 'Pending Review', 'Flagged'];
  readonly accessOptions = ['ALL', 'General', 'Confidential', 'Executive'];

  selectedRecord = signal<IEmployeeRecord | null>(null);
  activeTimer = signal<number>(0);
  lastDuration = signal<number | null>(null);

  private timerInterval: any = null;

  // Fully reactive computed stream tracking all filter signals
  filteredRecords = computed(() => {
    const list = this.recordService.records();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const access = this.selectedAccessLevel();

    return list.filter((r) => {
      // 1. Full-field Text Search matching
      const matchesQuery =
        !query ||
        r.recordId.toLowerCase().includes(query) ||
        r.employeeName.toLowerCase().includes(query) ||
        r.department.toLowerCase().includes(query) ||
        r.position.toLowerCase().includes(query) ||
        r.accessLevel.toLowerCase().includes(query) ||
        r.verificationStatus.toLowerCase().includes(query) ||
        r.backgroundCheckDate.toLowerCase().includes(query) ||
        (r.compensationGrade ? r.compensationGrade.toLowerCase().includes(query) : false);

      // 2. Status matching (synced with view tab)
      const matchesStatus = status === 'ALL' || r.verificationStatus === status;

      // 3. Dropdown Clearance Filter matching
      const matchesAccess = access === 'ALL' || r.accessLevel === access;

      return matchesQuery && matchesStatus && matchesAccess;
    });
  });

  hasActiveFilters = computed(() => {
    return (
      this.searchQuery() !== '' ||
      this.selectedStatus() !== 'ALL' ||
      this.selectedAccessLevel() !== 'ALL'
    );
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    const startTime = Date.now();
    this.activeTimer.set(0);

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.activeTimer.set(Date.now() - startTime);
    }, 50);

    this.recordService.getRecords().subscribe({
      next: () => {
        clearInterval(this.timerInterval);
        const duration = Date.now() - startTime;
        this.activeTimer.set(duration);
        this.lastDuration.set(duration);
      },
      error: () => {
        clearInterval(this.timerInterval);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setView(view: 'ALL' | 'Verified' | 'Pending Review' | 'Flagged'): void {
    this.activeView.set(view);
    this.selectedStatus.set(view);
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
    if (['ALL', 'Verified', 'Pending Review', 'Flagged'].includes(status)) {
      this.activeView.set(status as any);
    } else {
      this.activeView.set('ALL');
    }
    this.isStatusMenuOpen.set(false);
  }

  selectAccessLevel(level: string): void {
    this.selectedAccessLevel.set(level);
    this.isAccessMenuOpen.set(false);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('ALL');
    this.selectedAccessLevel.set('ALL');
    this.activeView.set('ALL');
  }

  onSelectDelay(ms: number): void {
    this.delayService.setDelay(ms);
    this.loadRecords();
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

  selectRecord(record: IEmployeeRecord): void {
    this.selectedRecord.set(record);
  }

  getProgressPercent(): number {
    const expected = Math.max(500, this.delayService.currentDelay());
    const current = this.activeTimer();
    return Math.min(100, Math.round((current / expected) * 100));
  }
}
