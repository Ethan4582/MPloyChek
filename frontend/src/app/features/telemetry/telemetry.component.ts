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
                2xx: {{ telemetryService.data()?.traffic?.statusCodes?.['2xx'] || 0 }} • 4xx: {{ telemetryService.data()?.traffic?.statusCodes?.['4xx'] || 0 }}
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

          <!-- Raw Endpoint Latency List -->
          <div class="p-5 rounded-lg bg-[#202020] border border-[#2c2c2c] space-y-3">
            <h2 class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
              Endpoint Latency Log (Last 10 Requests)
            </h2>

            <div class="space-y-1.5 font-mono text-xs">
              @for (req of telemetryService.data()?.traffic?.recentRequests || []; track req.id || $index) {
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
                <div class="text-[#8a8986] py-3 text-center text-xs">
                  No requests captured yet. Trigger actions across the portal to see live telemetry.
                </div>
              }
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
      next: () => this.telemetryService.refresh(),
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
}
