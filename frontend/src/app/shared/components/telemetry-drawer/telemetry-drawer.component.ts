import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { DelayService } from '../../../core/services/delay.service';

@Component({
  selector: 'app-telemetry-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Telemetry Widget in Bottom-Left -->
    <div class="fixed bottom-4 left-4 z-40">
      @if (!isOpen()) {
        <button
          (click)="toggle()"
          class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-xl backdrop-blur-md transition-all text-xs font-medium text-slate-300 hover:text-white"
        >
          <span class="relative flex h-2.5 w-2.5">
            @if (telemetry.hasActiveRequests()) {
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            } @else {
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            }
          </span>
          <span>Async Telemetry</span>
          @if (telemetry.hasActiveRequests()) {
            <span class="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              {{ telemetry.activeRequestsCount() }} in-flight
            </span>
          } @else if (telemetry.lastTrace()) {
            <span class="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px]">
              {{ telemetry.lastTrace()?.durationMs }}ms
            </span>
          }
        </button>
      } @else {
        <!-- Expanded Telemetry Panel -->
        <div class="w-96 max-w-[calc(100vw-2rem)] glass-card border border-slate-700/80 p-4 shadow-2xl animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <span class="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div>
                <h4 class="text-xs font-semibold text-slate-200 uppercase tracking-wider">Async Pipeline Telemetry</h4>
                <p class="text-[10px] text-slate-400">Live API round-trip & latency emulations</p>
              </div>
            </div>
            
            <div class="flex items-center gap-1">
              <button
                (click)="telemetry.clearTraces()"
                title="Clear logs"
                class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
              >
                Clear
              </button>
              <button
                (click)="toggle()"
                class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Active Simulated Delay Indicator -->
          <div class="my-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <span class="text-slate-400">Active Delay Parameter:</span>
            <span class="font-mono font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              ?delay={{ delayService.currentDelay() }}ms
            </span>
          </div>

          <!-- Request traces list -->
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            @if (telemetry.traces().length === 0) {
              <div class="text-center py-6 text-slate-500 text-xs">
                No API requests recorded yet.
              </div>
            }

            @for (trace of telemetry.traces(); track trace.id) {
              <div class="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex flex-col gap-1.5">
                <div class="flex items-center justify-between font-mono">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="{
                        'bg-blue-500/20 text-blue-400': trace.method === 'GET',
                        'bg-emerald-500/20 text-emerald-400': trace.method === 'POST',
                        'bg-amber-500/20 text-amber-400': trace.method === 'PUT' || trace.method === 'PATCH',
                        'bg-rose-500/20 text-rose-400': trace.method === 'DELETE'
                      }"
                    >
                      {{ trace.method }}
                    </span>
                    <span class="text-slate-300 truncate max-w-[170px]" [title]="trace.url">
                      {{ trace.url }}
                    </span>
                  </div>

                  @if (trace.status === 'PENDING') {
                    <span class="flex items-center gap-1 text-amber-400 text-[10px] animate-pulse">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> In-Flight
                    </span>
                  } @else if (trace.status === 'SUCCESS') {
                    <span class="text-emerald-400 text-[10px] font-bold">
                      {{ trace.statusCode }}
                    </span>
                  } @else {
                    <span class="text-rose-400 text-[10px] font-bold">
                      {{ trace.statusCode || 'ERR' }}
                    </span>
                  }
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Simulated Delay: <strong class="text-slate-300 font-mono">{{ trace.simulatedDelay }}ms</strong></span>
                  @if (trace.durationMs !== undefined) {
                    <span>Total Latency: <strong class="text-brand-300 font-mono">{{ trace.durationMs }}ms</strong></span>
                  } @else {
                    <span class="text-amber-400 animate-pulse">Awaiting server...</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TelemetryDrawerComponent {
  telemetry = inject(TelemetryService);
  delayService = inject(DelayService);

  isOpen = signal<boolean>(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }
}
