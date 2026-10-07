import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { TelemetryService, TelemetryMetric } from '../../core/services/telemetry.service';
import { DelayService } from '../../core/services/delay.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [CommonModule, SidebarComponent, WorkspaceHeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      <!-- Minimal Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Workspace Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]="sidebarService.isOpen()"
        [class.md:pl-0]="!sidebarService.isOpen()"
      >
        <!-- Workspace Header -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'Telemetry & Asynchronous Metrics' }]"
          actionLabel="Send Ping"
          [isActionLoading]="isPinging()"
          (actionClicked)="sendTestPing()"
        ></app-workspace-header>

        <!-- Page Content -->
        <div class="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          <!-- Page Title & Overview -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-[#ffffff] tracking-tight">Telemetry & Latency</h1>
              <p class="text-xs text-[#9b9a97] mt-0.5">
                Real-time Express middleware performance metrics and parameterized asynchronous delay simulation.
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-[#1c2e22] text-[#5cb87a] border border-[#2d5238]">
                <span>Live Streaming</span>
              </span>
              <button
                type="button"
                (click)="refreshMetrics()"
                class="notion-btn text-xs py-1 px-2.5 cursor-pointer"
                title="Fetch latest metrics"
              >
                Sync
              </button>
              <button
                type="button"
                (click)="clearBuffer()"
                class="notion-btn text-xs py-1 px-2.5 text-[#e05757] hover:border-[#e05757]/40 cursor-pointer"
              >
                Clear Buffer
              </button>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <!-- Database Health -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Database</div>
              <div class="text-sm font-semibold text-[#ffffff] truncate">
                {{ telemetryService.data()?.database?.provider || 'MongoDB In-Memory' }}
              </div>
              <div class="text-xs text-[#5cb87a] font-mono flex items-center gap-1">
                <span>●</span>
                <span>{{ telemetryService.data()?.database?.status || 'connected' }} ({{ telemetryService.data()?.database?.pingMs || 0.9 }}ms)</span>
              </div>
            </div>

            <!-- Total Recorded Traffic -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Total Requests</div>
              <div class="text-xl font-bold text-[#ffffff]">
                {{ telemetryService.data()?.traffic?.totalRequests || 0 }}
              </div>
              <div class="text-xs text-[#8a8986] font-mono">
                Active in Flight: {{ telemetryService.data()?.traffic?.activeRequests || 0 }}
              </div>
            </div>

            <!-- Average Event Latency -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Average Latency</div>
              <div class="text-xl font-bold text-[#bc8c74]">
                {{ telemetryService.data()?.traffic?.avgLatencyMs || 0 }}ms
              </div>
              <div class="text-xs text-[#8a8986] font-mono">
                Current Delay: {{ delayService.currentDelay() }}ms
              </div>
            </div>

            <!-- Server Node Runtime & Memory -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Process Memory</div>
              <div class="text-sm font-semibold text-[#ffffff]">
                {{ telemetryService.data()?.system?.memory?.heapUsedMb || 0 }} MB / {{ telemetryService.data()?.system?.memory?.rssMb || 0 }} MB
              </div>
              <div class="text-xs text-[#8a8986] font-mono">
                Uptime: {{ telemetryService.data()?.uptimeSeconds || 0 }}s
              </div>
            </div>
          </div>

          <!-- Interactive Latency Simulator Preset Strip -->
          <div class="p-5 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                  Parameterized Latency Engine (?delay=ms)
                </h2>
                <p class="text-xs text-[#8a8986] mt-0.5">
                  Adjust simulated latency across all portal API calls. Uses non-blocking Express middleware timers.
                </p>
              </div>
              <span class="text-xs font-mono font-bold text-[#bc8c74] px-2.5 py-1 rounded bg-[#2a2420] border border-[#48372f]">
                {{ delayService.currentDelay() }}ms
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-1">
              @for (preset of presets; track preset.ms) {
                <button
                  type="button"
                  (click)="delayService.setDelay(preset.ms)"
                  class="notion-btn text-xs py-1 px-3 cursor-pointer"
                  [ngClass]="delayService.currentDelay() === preset.ms ? 'bg-[#ffffff] text-[#141414] font-semibold border-white' : ''"
                >
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>

          <!-- Paginated Endpoint Latency Log -->
          <div class="p-5 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <h2 class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                  Endpoint Latency Log
                </h2>
                <span class="text-[11px] font-mono text-[#8a8986] px-2 py-0.5 rounded bg-[#191919] border border-[#2a2a2a]">
                  {{ allRequests().length }} Total Records
                </span>
              </div>

              <!-- Pagination Controls & Page Size Selector -->
              <div class="flex items-center gap-2 text-xs font-mono">
                <!-- Page size selector -->
                <div class="flex items-center gap-1 text-[#8a8986]">
                  <span>Show:</span>
                  <select
                    [value]="pageSize()"
                    (change)="onPageSizeChange($event)"
                    class="bg-[#191919] border border-[#2c2c2c] rounded px-1.5 py-0.5 text-xs text-[#e6e6e5] focus:outline-none"
                  >
                    <option [value]="5">5</option>
                    <option [value]="10">10</option>
                    <option [value]="20">20</option>
                  </select>
                </div>

                <!-- Page indicator -->
                <span class="text-[#8a8986] px-1">
                  Page <span class="text-[#ffffff] font-medium">{{ currentPage() }}</span> of {{ totalPages() }}
                </span>

                <!-- Prev / Next Buttons -->
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    (click)="prevPage()"
                    [disabled]="currentPage() <= 1"
                    class="notion-btn py-0.5 px-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Page"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages()"
                    class="notion-btn py-0.5 px-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Page"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <!-- Paginated Request List -->
            <div class="space-y-1.5 font-mono text-xs">
              @for (req of paginatedRequests(); track req.id || $index) {
                <div class="flex items-center justify-between p-2 rounded bg-[#171717] border border-[#262626]">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="
                        req.method === 'GET'
                          ? 'bg-[#1e2d3d] text-[#529cca]'
                          : req.method === 'POST'
                            ? 'bg-[#1c2e22] text-[#5cb87a]'
                            : req.method === 'DELETE'
                              ? 'bg-[#331f1f] text-[#e05757]'
                              : 'bg-[#332924] text-[#bc8c74]'
                      "
                    >
                      {{ req.method }}
                    </span>
                    <span class="text-[#e6e6e5]">{{ req.path }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="text-[#8a8986]">{{ req.durationMs }}ms</span>
                    <span
                      class="px-1.5 py-0.2 rounded text-[10px]"
                      [ngClass]="
                        req.status < 300
                          ? 'text-[#5cb87a]'
                          : req.status < 400
                            ? 'text-[#529cca]'
                            : 'text-[#e05757]'
                      "
                    >
                      {{ req.status }}
                    </span>
                  </div>
                </div>
              } @empty {
                <div class="text-[#8a8986] py-4 text-center text-xs">
                  No requests captured yet. Trigger actions across the portal to see live telemetry.
                </div>
              }
            </div>

            <!-- Bottom pagination footer if multiple pages exist -->
            @if (totalPages() > 1) {
              <div class="flex items-center justify-between pt-2 border-t border-[#262626] text-xs font-mono text-[#8a8986]">
                <div>
                  Showing {{ (currentPage() - 1) * pageSize() + 1 }} to {{ Math.min(currentPage() * pageSize(), allRequests().length) }} of {{ allRequests().length }} requests
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    (click)="goToPage(1)"
                    [disabled]="currentPage() === 1"
                    class="notion-btn py-0.5 px-2 text-[11px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    (click)="prevPage()"
                    [disabled]="currentPage() <= 1"
                    class="notion-btn py-0.5 px-2 text-[11px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Prev
                  </button>
                  <span class="px-2 text-[#e6e6e5] font-semibold">{{ currentPage() }} / {{ totalPages() }}</span>
                  <button
                    type="button"
                    (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages()"
                    class="notion-btn py-0.5 px-2 text-[11px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    (click)="goToPage(totalPages())"
                    [disabled]="currentPage() === totalPages()"
                    class="notion-btn py-0.5 px-2 text-[11px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Last
                  </button>
                </div>
              </div>
            }
          </div>

        </div>

      </div>

    </div>
  `,
})
export class TelemetryComponent implements OnInit {
  telemetryService = inject(TelemetryService);
  delayService = inject(DelayService);
  sidebarService = inject(SidebarService);
  private http = inject(HttpClient);

  readonly Math = Math;

  isPinging = signal<boolean>(false);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  allRequests = computed<TelemetryMetric[]>(() => {
    return this.telemetryService.data()?.traffic?.recentRequests || [];
  });

  totalPages = computed<number>(() => {
    const total = this.allRequests().length;
    return total === 0 ? 1 : Math.ceil(total / this.pageSize());
  });

  paginatedRequests = computed<TelemetryMetric[]>(() => {
    const list = this.allRequests();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  presets = [
    { label: '0ms (Instant)', ms: 0 },
    { label: '500ms (Quick)', ms: 500 },
    { label: '1500ms (Default)', ms: 1500 },
    { label: '3000ms (Heavy)', ms: 3000 },
  ];

  ngOnInit(): void {
    this.telemetryService.startPolling(2000);
  }

  refreshMetrics(): void {
    this.telemetryService.refresh();
  }

  clearBuffer(): void {
    this.http.post('/api/telemetry/reset', {}).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.telemetryService.refresh();
      },
    });
  }

  sendTestPing(): void {
    this.isPinging.set(true);
    this.http.get('/api/health').subscribe({
      next: () => {
        setTimeout(() => this.isPinging.set(false), 300);
      },
      error: () => this.isPinging.set(false),
    });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize.set(Number(select.value));
    this.currentPage.set(1);
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
