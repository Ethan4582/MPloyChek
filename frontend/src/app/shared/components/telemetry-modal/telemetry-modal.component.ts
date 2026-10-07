import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { DelayService } from '../../../core/services/delay.service';

@Component({
  selector: 'app-telemetry-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (telemetryService.isInspectorOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
        
        <!-- Backdrop click listener -->
        <div class="fixed inset-0" (click)="telemetryService.closeInspector()"></div>

        <!-- Telemetry Modal Box -->
        <div class="relative w-full max-w-3xl max-h-[88vh] bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-150">
          
          <!-- Header -->
          <div class="px-5 py-3.5 border-b border-[#2d2d2d] bg-[#222222] flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-base">📡</span>
              <div>
                <h2 class="text-sm font-semibold text-[#ffffff] flex items-center gap-2">
                  <span>Backend Telemetry & Async Metrics</span>
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1c2e22] text-[#5cb87a] border border-[#2d5238]">
                    Live Streaming
                  </span>
                </h2>
                <p class="text-[11px] text-[#9b9a97]">Real-time Express middleware telemetry & delay telemetry</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="sendTestPing()"
                [disabled]=\"isPinging\"
                class="notion-btn text-[11px] py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
                title="Send a sample request with current simulated delay"
              >
                <span>⚡</span>
                <span>{{ isPinging ? 'Pinging...' : 'Send Test Ping' }}</span>
              </button>

              <button
                (click)="resetLogs()"
                class="notion-btn text-[11px] py-1 px-2.5 text-[#e05757] hover:border-[#e05757]/40 cursor-pointer"
                title="Clear request history buffer"
              >
                Clear Buffer
              </button>

              <button
                (click)="telemetryService.closeInspector()"
                class="p-1 rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#2e2e2e] transition-colors ml-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Body with scroll -->
          <div class="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            
            <!-- Real-time Stats Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <!-- DB Provider -->
              <div class="p-3 rounded-lg bg-[#252525] border border-[#303030]">
                <div class="text-[10px] uppercase font-mono text-[#8a8986]">Database</div>
                <div class="text-xs font-semibold text-[#e6e6e5] mt-1 truncate">
                  {{ telemetryService.data()?.database?.provider || 'MongoDB In-Memory' }}
                </div>
                <div class="text-[10px] text-[#5cb87a] font-mono mt-0.5 flex items-center gap-1">
                  <span>●</span> {{ telemetryService.data()?.database?.status || 'connected' }} ({{ telemetryService.data()?.database?.pingMs }}ms)
                </div>
              </div>

              <!-- Memory Heap -->
              <div class="p-3 rounded-lg bg-[#252525] border border-[#303030]">
                <div class="text-[10px] uppercase font-mono text-[#8a8986]">Heap Memory</div>
                <div class="text-sm font-semibold text-[#e6e6e5] mt-1 font-mono">
                  {{ telemetryService.data()?.system?.memory?.heapUsedMb || 0 }} MB
                </div>
                <div class="text-[10px] text-[#8a8986] mt-0.5">
                  RSS: {{ telemetryService.data()?.system?.memory?.rssMb || 0 }} MB
                </div>
              </div>

              <!-- Avg Latency -->
              <div class="p-3 rounded-lg bg-[#252525] border border-[#303030]">
                <div class="text-[10px] uppercase font-mono text-[#8a8986]">Avg Server Latency</div>
                <div class="text-sm font-semibold text-[#bc8c74] mt-1 font-mono">
                  {{ telemetryService.data()?.traffic?.avgLatencyMs || 0 }} ms
                </div>
                <div class="text-[10px] text-[#8a8986] mt-0.5">
                  Delay: +{{ delayService.currentDelay() }}ms simulated
                </div>
              </div>

              <!-- Total Calls -->
              <div class="p-3 rounded-lg bg-[#252525] border border-[#303030]">
                <div class="text-[10px] uppercase font-mono text-[#8a8986]">Logged Requests</div>
                <div class="text-sm font-semibold text-[#7da0ca] mt-1 font-mono">
                  {{ telemetryService.data()?.traffic?.totalRequests || 0 }}
                </div>
                <div class="text-[10px] text-[#8a8986] mt-0.5 font-mono">
                  2xx: {{ telemetryService.data()?.traffic?.statusCodes?.['2xx'] || 0 }} &bull; 4xx: {{ telemetryService.data()?.traffic?.statusCodes?.['4xx'] || 0 }}
                </div>
              </div>

            </div>

            <!-- Active Simulated Delay Controller -->
            <div class="p-3.5 rounded-lg bg-[#252525] border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="text-xs font-semibold text-[#e6e6e5] flex items-center gap-1.5">
                  <span>⏱️ Global Parameterized Delay (?delay=ms)</span>
                </div>
                <p class="text-[11px] text-[#9b9a97] mt-0.5">
                  Injected into application endpoints to demonstrate asynchronous loading states and network resiliency.
                </p>
              </div>

              <div class="flex items-center gap-1.5 shrink-0 bg-[#1c1c1c] p-1 rounded-md border border-[#303030]">
                @for (d of delayOptions; track d.ms) {
                  <button
                    type="button"
                    (click)="setDelay(d.ms)"
                    class="px-2.5 py-1 rounded text-[11px] font-medium transition-all"
                    [ngClass]="
                      delayService.currentDelay() === d.ms
                        ? 'bg-[#332924] text-[#bc8c74] border border-[#48372f] shadow-sm'
                        : 'text-[#8a8986] hover:text-[#ffffff]'
                    "
                  >
                    {{ d.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Live Request Buffer Table -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-[#9b9a97]">
                <span class="font-medium text-[#e6e6e5]">Real-time Request Log (Rolling 50 Requests)</span>
                <span class="text-[11px] font-mono">Uptime: {{ formatUptime(telemetryService.data()?.uptimeSeconds) }}</span>
              </div>

              <div class="rounded-lg border border-[#2d2d2d] overflow-hidden bg-[#181818]">
                <div class="overflow-x-auto max-h-[300px]">
                  <table class="w-full text-left text-[11px] font-mono border-collapse">
                    <thead class="sticky top-0 bg-[#222222] border-b border-[#2d2d2d] text-[#8a8986] select-none">
                      <tr>
                        <th class="py-2 px-3 font-medium">Method</th>
                        <th class="py-2 px-3 font-medium">Path</th>
                        <th class="py-2 px-3 font-medium">Status</th>
                        <th class="py-2 px-3 font-medium">Server Latency</th>
                        <th class="py-2 px-3 font-medium">Simulated Delay</th>
                        <th class="py-2 px-3 font-medium text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#262626]">
                      @for (req of telemetryService.data()?.traffic?.recentRequests; track req.id) {
                        <tr class="hover:bg-[#202020] transition-colors">
                          <td class="py-2 px-3">
                            <span
                              class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              [ngClass]="{
                                'bg-[#182838] text-[#529cca] border border-[#233d59]': req.method === 'GET',
                                'bg-[#1a2d1d] text-[#5cb87a] border border-[#24472a]': req.method === 'POST',
                                'bg-[#332924] text-[#bc8c74] border border-[#48372f]': req.method === 'PATCH' || req.method === 'PUT',
                                'bg-[#3b2222] text-[#e05757] border border-[#522929]': req.method === 'DELETE'
                              }"
                            >
                              {{ req.method }}
                            </span>
                          </td>
                          <td class="py-2 px-3 text-[#dcdcdc] truncate max-w-[200px]" [title]="req.path">
                            {{ req.path }}
                          </td>
                          <td class="py-2 px-3">
                            <span
                              class="px-1.5 py-0.5 rounded text-[10px]"
                              [ngClass]="
                                req.status >= 200 && req.status < 300
                                  ? 'bg-[#1c2e22] text-[#5cb87a]'
                                  : 'bg-[#3b2222] text-[#e05757]'
                              "
                            >
                              {{ req.status }}
                            </span>
                          </td>
                          <td class="py-2 px-3 text-[#bc8c74] font-semibold">
                            {{ req.durationMs }}ms
                          </td>
                          <td class="py-2 px-3 text-[#8a8986]">
                            +{{ req.simulatedDelayMs }}ms
                          </td>
                          <td class="py-2 px-3 text-[#8a8986] text-right">
                            {{ formatTime(req.timestamp) }}
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="py-8 text-center text-[#8a8986] text-xs">
                            No requests recorded yet. Perform actions across the workspace.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="px-5 py-3 border-t border-[#2d2d2d] bg-[#222222] flex items-center justify-between text-xs text-[#8a8986]">
            <span>Auto-refreshing every 1.5s</span>
            <button
              (click)="telemetryService.closeInspector()"
              class="notion-btn px-3 py-1 text-xs text-[#e6e6e5]"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    }
  `,
})
export class TelemetryModalComponent {
  telemetryService = inject(TelemetryService);
  delayService = inject(DelayService);
  private http = inject(HttpClient);

  isPinging = false;

  delayOptions = [
    { label: '0ms (Instant)', ms: 0 },
    { label: '500ms (Fast)', ms: 500 },
    { label: '1500ms (Default)', ms: 1500 },
    { label: '3000ms (Slow)', ms: 3000 },
  ];

  setDelay(ms: number): void {
    this.delayService.setDelay(ms);
  }

  resetLogs(): void {
    this.http.post('/api/telemetry/reset', {}).subscribe({
      next: () => this.telemetryService.refresh(),
    });
  }

  sendTestPing(): void {
    this.isPinging = true;
    this.http.get('/api/health').subscribe({
      next: () => {
        setTimeout(() => {
          this.isPinging = false;
        }, 300);
      },
      error: () => {
        this.isPinging = false;
      },
    });
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
    } catch {
      return isoString;
    }
  }

  formatUptime(seconds?: number): string {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
}
