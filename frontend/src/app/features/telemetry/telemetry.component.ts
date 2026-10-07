import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { TelemetryService } from '../../core/services/telemetry.service';
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
          actionIcon="⚡"
          [isActionLoading]="isPinging()"
          (actionClicked)="sendTestPing()"
          [showRefresh]="true"
          (refreshClicked)="refreshMetrics()"
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
                <span class="w-2 h-2 rounded-full bg-[#5cb87a] animate-pulse"></span>
                <span>Live Streaming</span>
              </span>
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

            <!-- Heap Memory -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Heap Memory</div>
              <div class="text-sm font-semibold text-[#ffffff] font-mono">
                {{ telemetryService.data()?.system?.memory?.heapUsedMb || 0 }} MB
              </div>
              <div class="text-xs text-[#8a8986]">
                RSS: {{ telemetryService.data()?.system?.memory?.rssMb || 0 }} MB
              </div>
            </div>

            <!-- Server Latency -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Average Latency</div>
              <div class="text-sm font-semibold text-[#bc8c74] font-mono">
                {{ telemetryService.data()?.traffic?.avgLatencyMs || 0 }} ms
              </div>
              <div class="text-xs text-[#8a8986]">
                Simulated: +{{ delayService.currentDelay() }}ms
              </div>
            </div>

            <!-- Total Requests -->
            <div class="p-4 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-1">
              <div class="text-[10px] uppercase font-mono tracking-wider text-[#8a8986]">Recorded Requests</div>
              <div class="text-sm font-semibold text-[#7da0ca] font-mono">
                {{ telemetryService.data()?.traffic?.totalRequests || 0 }}
              </div>
              <div class="text-xs text-[#8a8986] font-mono">
                2xx: {{ telemetryService.data()?.traffic?.statusCodes?.['2xx'] || 0 }} &bull; 4xx: {{ telemetryService.data()?.traffic?.statusCodes?.['4xx'] || 0 }}
              </div>
            </div>
          </div>

          <!-- Parameterized Delay Controller -->
          <div class="p-5 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                  Asynchronous Delay Controller
                </h2>
                <p class="text-xs text-[#9b9a97] mt-0.5">
                  Appends <span class="font-mono text-[#bc8c74]">?delay=ms</span> to all outbound API calls to test asynchronous loaders and loaders without blocking the server event loop.
                </p>
              </div>
              <div class="text-right">
                <span class="text-xs text-[#8a8986]">Current Parameter: </span>
                <span class="text-sm font-mono font-bold text-[#bc8c74]">{{ delayService.currentDelay() }}ms</span>
              </div>
            </div>

            <!-- Preset Buttons -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              @for (preset of presets; track preset.ms) {
                <button
                  type="button"
                  (click)="delayService.setDelay(preset.ms)"
                  class="py-2 px-3 rounded-md text-xs font-mono transition-all text-center border cursor-pointer"
                  [ngClass]="
                    delayService.currentDelay() === preset.ms
                      ? 'bg-[#332924] text-[#bc8c74] border-[#48372f] font-semibold shadow-sm'
                      : 'bg-[#191919] text-[#8a8986] hover:text-[#ffffff] border-[#2c2c2c]'
                  "
                >
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>

          <!-- Live Request History Buffer -->
          <div class="p-5 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                Recent Request Stream
              </h2>
              <span class="text-[11px] text-[#787774] font-mono">
                Buffer: {{ telemetryService.data()?.traffic?.recentRequests?.length || 0 }} events
              </span>
            </div>

            <div class="overflow-x-auto rounded border border-[#2a2a2a]">
              <table class="w-full text-left text-xs font-mono">
                <thead class="bg-[#191919] text-[#787774] text-[10px] uppercase border-b border-[#2a2a2a]">
                  <tr>
                    <th class="py-2.5 px-3">Timestamp</th>
                    <th class="py-2.5 px-3">Method</th>
                    <th class="py-2.5 px-3">Endpoint</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3 text-right">Server Duration</th>
                    <th class="py-2.5 px-3 text-right">Injected Delay</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#262626]">
                  @if (telemetryService.data()?.traffic?.recentRequests?.length) {
                    @for (req of telemetryService.data()!.traffic.recentRequests; track req.id) {
                      <tr class="hover:bg-[#252525]/60 transition-colors">
                        <td class="py-2 px-3 text-[#8a8986] whitespace-nowrap text-[11px]">
                          {{ formatTime(req.timestamp) }}
                        </td>
                        <td class="py-2 px-3 whitespace-nowrap">
                          <span
                            class="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            [ngClass]="{
                              'bg-[#1a2e22] text-[#5cb87a]': req.method === 'GET',
                              'bg-[#1a2530] text-[#7da0ca]': req.method === 'POST',
                              'bg-[#302619] text-[#e0a857]': req.method === 'PATCH',
                              'bg-[#301a1a] text-[#e05757]': req.method === 'DELETE'
                            }"
                          >
                            {{ req.method }}
                          </span>
                        </td>
                        <td class="py-2 px-3 text-[#e6e6e5] truncate max-w-xs">
                          {{ req.path }}
                        </td>
                        <td class="py-2 px-3 whitespace-nowrap">
                          <span
                            class="text-[11px]"
                            [ngClass]="
                              req.status < 400
                                ? 'text-[#5cb87a]'
                                : req.status === 401 || req.status === 403
                                ? 'text-[#e0a857]'
                                : 'text-[#e05757]'
                            "
                          >
                            {{ req.status }}
                          </span>
                        </td>
                        <td class="py-2 px-3 text-right text-[#e6e6e5] whitespace-nowrap">
                          {{ req.durationMs }}ms
                        </td>
                        <td class="py-2 px-3 text-right text-[#bc8c74] whitespace-nowrap">
                          +{{ req.delayMs }}ms
                        </td>
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td colspan="6" class="py-8 text-center text-[#787774] text-xs">
                        No telemetry events recorded yet. Click "Send Ping" to trigger an event.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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

  isPinging = signal<boolean>(false);

  presets = [
    { label: '0ms (Baseline)', ms: 0 },
    { label: '500ms (Fast)', ms: 500 },
    { label: '1,500ms (Noticeable)', ms: 1500 },
    { label: '3,000ms (Heavy)', ms: 3000 },
  ];

  ngOnInit(): void {
    this.telemetryService.fetchMetrics();
  }

  refreshMetrics(): void {
    this.telemetryService.fetchMetrics();
  }

  sendTestPing(): void {
    this.isPinging.set(true);
    const delay = this.delayService.currentDelay();
    this.http.get(`/api/health?delay=${delay}`).subscribe({
      next: () => {
        this.isPinging.set(false);
        this.telemetryService.fetchMetrics();
      },
      error: () => {
        this.isPinging.set(false);
        this.telemetryService.fetchMetrics();
      },
    });
  }

  clearBuffer(): void {
    this.http.post('/api/telemetry/reset', {}).subscribe({
      next: () => {
        this.telemetryService.fetchMetrics();
      },
    });
  }

  formatTime(isoString: string): string {
    if (!isoString) return '--:--:--';
    try {
      const d = new Date(isoString);
      return d.toTimeString().split(' ')[0];
    } catch {
      return isoString;
    }
  }
}
