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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- User Profile Header & Role Card -->
      <div class="glass-card p-6 relative overflow-hidden border-slate-800">
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-brand-500/20">
              {{ getUserInitials() }}
            </div>

            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-xl font-bold text-white">{{ authService.currentUser()?.name }}</h1>
                @if (authService.isAdmin()) {
                  <span class="badge-admin">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 2l2.5 5.5H18l-4.5 4 1.5 6.5-5-3.5-5 3.5 1.5-6.5L2 7.5h5.5L10 2z" clip-rule="evenodd" />
                    </svg>
                    Administrator
                  </span>
                } @else {
                  <span class="badge-user">
                    <svg class="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    General User
                  </span>
                }
              </div>

              <div class="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-400">
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                  <strong class="text-slate-300 font-mono">{{ authService.currentUser()?.userId }}</strong>
                </span>

                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ authService.currentUser()?.department }}</span>
                </span>

                <span class="flex items-center gap-1.5 text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{{ authService.currentUser()?.status }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="flex flex-wrap items-center gap-3">
            @if (authService.isAdmin()) {
              <a routerLink="/admin/users" class="btn-secondary text-xs">
                <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Manage Users (Admin Console)</span>
              </a>
            }

            <button (click)="loadRecords()" [disabled]="recordService.isLoading()" class="btn-primary text-xs">
              @if (recordService.isLoading()) {
                <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading ({{ activeTimer() }}ms)...</span>
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reload Records</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Async Latency Showcase & Access Level Control Bar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Latency Emulation Controls -->
        <div class="lg:col-span-2 glass-card p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <h3 class="text-xs font-semibold text-slate-200 uppercase tracking-wider">Simulated Network Delay Controller</h3>
                <p class="text-[11px] text-slate-400">Parameter appended to API request: <code class="text-brand-300 font-mono">?delay={{ delayService.currentDelay() }}</code></p>
              </div>
            </div>

            @if (lastDuration() !== null) {
              <span class="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-mono">
                Last Roundtrip: <strong class="text-emerald-400">{{ lastDuration() }}ms</strong>
              </span>
            }
          </div>

          <!-- Delay preset buttons -->
          <div class="grid grid-cols-5 gap-2">
            @for (opt of delayService.delayOptions; track opt.value) {
              <button
                type="button"
                (click)="onSelectDelay(opt.value)"
                class="py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center"
                [ngClass]="
                  delayService.currentDelay() === opt.value
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                "
              >
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <!-- Role Scope Insight Card -->
        <div class="glass-card p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-semibold text-slate-200 uppercase tracking-wider">Data Access Scope</span>
              @if (recordService.meta()?.confidentialFieldsVisible) {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">ALL RECORDS</span>
              } @else {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">PERSONAL ONLY</span>
              }
            </div>
            
            <p class="text-[11px] text-slate-400 leading-relaxed">
              @if (authService.isAdmin()) {
                You have <strong>Admin clearance</strong>. You can view all organizational records including confidential compensation tiers, risk scores, and audit notes.
              } @else {
                You are logged in as <strong>General User</strong>. You can only view your own records. Confidential fields are securely omitted at the backend repository.
              }
            </p>
          </div>

          <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Records Loaded: <strong class="text-slate-200">{{ filteredRecords().length }}</strong></span>
            <span>Confidential Columns: <strong [class.text-emerald-400]="authService.isAdmin()" [class.text-slate-500]="!authService.isAdmin()">{{ authService.isAdmin() ? 'Visible' : 'Masked' }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Live Async Progress Indicator (Showcasing async state) -->
      @if (recordService.isLoading()) {
        <div class="glass-card p-4 border-brand-500/30 bg-brand-950/20 animate-in fade-in duration-150">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="flex items-center gap-2 font-medium text-brand-300">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span>Processing asynchronous API request with {{ delayService.currentDelay() }}ms simulated delay...</span>
            </span>
            <span class="font-mono text-brand-400 font-semibold">{{ activeTimer() }}ms</span>
          </div>

          <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-100 rounded-full"
              [style.width.%]="getProgressPercent()"
            ></div>
          </div>
        </div>
      }

      <!-- Records Section with Search & Table -->
      <div class="glass-card overflow-hidden">
        <!-- Table Toolbar -->
        <div class="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-white">Employment Verification Records</h2>
            <p class="text-xs text-slate-400 mt-0.5">Records returned from MongoDB API matching your role permissions</p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Search Input -->
            <div class="relative min-w-[200px]">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search records..."
                class="glass-input text-xs py-1.5 pl-8 pr-3"
              />
              <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Status Filter -->
            <select
              [(ngModel)]="selectedStatus"
              class="bg-slate-950 text-slate-300 rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Flagged">Flagged</option>
            </select>

            <!-- Access Level Filter -->
            <select
              [(ngModel)]="selectedAccessLevel"
              class="bg-slate-950 text-slate-300 rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Access Levels</option>
              <option value="General">General</option>
              <option value="Confidential">Confidential</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        <!-- Table View with Shimmer Skeleton States -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="py-3.5 px-4">Record ID</th>
                <th class="py-3.5 px-4">Employee</th>
                <th class="py-3.5 px-4">Department & Position</th>
                <th class="py-3.5 px-4">Access Level</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Screen Date</th>
                
                <!-- Admin-Exclusive Columns -->
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-amber-400">Comp Grade</th>
                  <th class="py-3.5 px-4 text-amber-400">Risk Score</th>
                  <th class="py-3.5 px-4 text-amber-400">Audit Notes</th>
                }
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-800/60">
              <!-- Skeleton Loaders when data is being asynchronously fetched -->
              @if (recordService.isLoading()) {
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr class="animate-pulse">
                    <td class="py-3.5 px-4"><div class="h-3.5 w-24 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-32 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-40 bg-slate-800 rounded"></div></td>
                    <td class="py-3.5 px-4"><div class="h-5 w-20 bg-slate-800 rounded-full"></div></td>
                    <td class="py-3.5 px-4"><div class="h-5 w-20 bg-slate-800 rounded-full"></div></td>
                    <td class="py-3.5 px-4"><div class="h-3.5 w-24 bg-slate-800 rounded"></div></td>
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4"><div class="h-3.5 w-16 bg-slate-800 rounded"></div></td>
                      <td class="py-3.5 px-4"><div class="h-3.5 w-10 bg-slate-800 rounded"></div></td>
                      <td class="py-3.5 px-4"><div class="h-3.5 w-44 bg-slate-800 rounded"></div></td>
                    }
                    <td class="py-3.5 px-4 text-right"><div class="h-7 w-14 bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                }
              } @else if (filteredRecords().length === 0) {
                <tr>
                  <td [attr.colspan]="authService.isAdmin() ? 10 : 7" class="py-12 text-center text-slate-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <svg class="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p class="text-sm font-medium">No matching records found.</p>
                      <p class="text-xs text-slate-600">Try modifying your search or filter filters.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                <!-- Render Records -->
                @for (record of filteredRecords(); track record._id) {
                  <tr class="hover:bg-slate-900/60 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-medium text-brand-300">
                      {{ record.recordId }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-medium text-slate-200">{{ record.employeeName }}</div>
                      <div class="text-[10px] text-slate-500 font-mono">{{ record.userId }}</div>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="text-slate-200 font-medium">{{ record.position }}</div>
                      <div class="text-[10px] text-slate-400">{{ record.department }}</div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        [ngClass]="{
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20': record.accessLevel === 'General',
                          'bg-purple-500/10 text-purple-400 border border-purple-500/20': record.accessLevel === 'Confidential',
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20': record.accessLevel === 'Executive'
                        }"
                      >
                        {{ record.accessLevel }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4">
                      @if (record.verificationStatus === 'Verified') {
                        <span class="badge-verified">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified
                        </span>
                      } @else if (record.verificationStatus === 'Pending Review') {
                        <span class="badge-pending">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Pending
                        </span>
                      } @else {
                        <span class="badge-flagged">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Flagged
                        </span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {{ record.backgroundCheckDate }}
                    </td>

                    <!-- Admin-Only Columns -->
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 font-mono text-slate-300">
                        {{ record.compensationGrade || 'N/A' }}
                      </td>
                      <td class="py-3.5 px-4">
                        @if (record.riskScore !== undefined) {
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                            [ngClass]="{
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': record.riskScore <= 10,
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20': record.riskScore > 10 && record.riskScore <= 30,
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20': record.riskScore > 30
                            }"
                          >
                            Risk: {{ record.riskScore }}%
                          </span>
                        }
                      </td>
                      <td class="py-3.5 px-4 text-slate-400 max-w-xs truncate" [title]="record.auditNotes || ''">
                        {{ record.auditNotes || '—' }}
                      </td>
                    }

                    <td class="py-3.5 px-4 text-right">
                      <button
                        (click)="selectRecord(record)"
                        class="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
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
      </div>

      <!-- Record Detail Modal -->
      @if (selectedRecord()) {
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="glass-card max-w-lg w-full p-6 border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <h3 class="text-sm font-bold text-white">{{ selectedRecord()?.recordId }}</h3>
                  <p class="text-[11px] text-slate-400">{{ selectedRecord()?.employeeName }} • {{ selectedRecord()?.position }}</p>
                </div>
              </div>
              <button (click)="selectedRecord.set(null)" class="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div class="py-4 space-y-3 text-xs">
              <div class="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span class="text-slate-500 block text-[10px]">Department</span>
                  <span class="text-slate-200 font-medium">{{ selectedRecord()?.department }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[10px]">Status</span>
                  <span class="text-slate-200 font-medium">{{ selectedRecord()?.verificationStatus }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[10px]">Access Level</span>
                  <span class="text-slate-200 font-medium">{{ selectedRecord()?.accessLevel }}</span>
                </div>
                <div>
                  <span class="text-slate-500 block text-[10px]">Screening Date</span>
                  <span class="text-slate-200 font-mono">{{ selectedRecord()?.backgroundCheckDate }}</span>
                </div>
              </div>

              <!-- Confidential Details (Admin Only) -->
              @if (authService.isAdmin()) {
                <div class="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-2">
                  <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Admin Confidential Metrics</div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="text-slate-500 block text-[10px]">Compensation Grade</span>
                      <span class="text-amber-300 font-mono font-medium">{{ selectedRecord()?.compensationGrade || 'None' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block text-[10px]">Risk Score</span>
                      <span class="text-amber-300 font-mono font-medium">{{ selectedRecord()?.riskScore }}%</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[10px]">Audit Notes</span>
                    <p class="text-slate-300 text-[11px] leading-relaxed mt-0.5">{{ selectedRecord()?.auditNotes }}</p>
                  </div>
                </div>
              } @else {
                <div class="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-500 text-center">
                  Confidential compensation & audit notes are restricted to Administrator accounts.
                </div>
              }
            </div>

            <div class="pt-3 border-t border-slate-800 flex justify-end">
              <button (click)="selectedRecord.set(null)" class="btn-secondary text-xs">Close</button>
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

  searchQuery = '';
  selectedStatus = 'ALL';
  selectedAccessLevel = 'ALL';

  selectedRecord = signal<IEmployeeRecord | null>(null);
  activeTimer = signal<number>(0);
  lastDuration = signal<number | null>(null);

  private timerInterval: any = null;

  filteredRecords = computed(() => {
    const list = this.recordService.records();
    const query = this.searchQuery.toLowerCase().trim();
    const status = this.selectedStatus;
    const access = this.selectedAccessLevel;

    return list.filter((r) => {
      const matchesQuery =
        !query ||
        r.recordId.toLowerCase().includes(query) ||
        r.employeeName.toLowerCase().includes(query) ||
        r.department.toLowerCase().includes(query) ||
        r.position.toLowerCase().includes(query);

      const matchesStatus = status === 'ALL' || r.verificationStatus === status;
      const matchesAccess = access === 'ALL' || r.accessLevel === access;

      return matchesQuery && matchesStatus && matchesAccess;
    });
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
