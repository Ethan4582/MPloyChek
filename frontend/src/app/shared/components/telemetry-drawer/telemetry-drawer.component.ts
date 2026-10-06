import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { DelayService } from '../../../core/services/delay.service';

@Component({
  selector: 'app-telemetry-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Telemetry Widget (Notion Style) -->
    <div class="fixed bottom-3 left-3 z-40">
      @if (!isOpen()) {
        <button
          (click)="toggle()"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#222222] hover:bg-[#282828] border border-[#2f2f2f] text-xs font-medium text-[#9b9a97] hover:text-[#ffffff] transition-colors shadow-sm"
        >
          <span class="text-xs">⏱️</span>
          <span>Telemetry</span>
          @if (telemetry.hasActiveRequests()) {
            <span class="tag-yellow text-[10px] py-0 px-1">
              {{ telemetry.activeRequestsCount() }} in-flight
            </span>
          } @else if (telemetry.lastTrace()) {
            <span class="font-mono text-[10px] text-[#6b6b68]">
              {{ telemetry.lastTrace()?.durationMs }}ms
            </span>
          }
        </button>
      } @else {
        <!-- Expanded Telemetry Panel -->
        <div class="w-80 max-w-[calc(100vw-1.5rem)] notion-card border-[#333333] bg-[#222222] p-3 shadow-notion-dropdown animate-in zoom-in-95 duration-100">
          <div class="flex items-center justify-between pb-2 border-b border-[#2f2f2f]">
            <div class="flex items-center gap-1.5">
              <span class="text-xs">⏱️</span>
              <span class="text-xs font-semibold text-[#ffffff]">Async Network Telemetry</span>
            </div>
            
            <div class="flex items-center gap-1">
              <button
                (click)="telemetry.clearTraces()"
                class="text-[11px] text-[#787774] hover:text-[#ffffff] px-1"
                title="Clear"
              >
                Clear
              </button>
              <button
                (click)="toggle()"
                class="text-xs text-[#787774] hover:text-[#ffffff] px-1"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Parameter Indicator -->
          <div class="my-2 p-1.5 rounded bg-[#191919] border border-[#2a2a2a] flex items-center justify-between text-[11px]">
            <span class="text-[#787774]">Simulated Delay:</span>
            <span class="font-mono text-[#529cca] font-medium">?delay={{ delayService.currentDelay() }}ms</span>
          </div>

          <!-- Traces list -->
          <div class="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            @if (telemetry.traces().length === 0) {
              <div class="text-center py-4 text-[#605f5b] text-xs">
                No requests recorded yet.
              </div>
            }

            @for (trace of telemetry.traces(); track trace.id) {
              <div class="p-2 rounded bg-[#1c1c1c] border border-[#282828] text-xs space-y-1">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <div class="flex items-center gap-1.5 truncate max-w-[190px]">
                    <span
                      class="px-1 py-0.2 rounded text-[10px] font-semibold"
                      [ngClass]="{
                        'tag-blue': trace.method === 'GET',
                        'tag-green': trace.method === 'POST',
                        'tag-yellow': trace.method === 'PUT' || trace.method === 'PATCH',
                        'tag-red': trace.method === 'DELETE'
                      }"
                    >
                      {{ trace.method }}
                    </span>
                    <span class="text-[#9b9a97] truncate" [title]="trace.url">
                      {{ trace.url }}
                    </span>
                  </div>

                  @if (trace.status === 'PENDING') {
                    <span class="tag-yellow text-[10px]">Pending</span>
                  } @else if (trace.status === 'SUCCESS') {
                    <span class="text-[#4dab7e] font-mono text-[10px]">{{ trace.statusCode }}</span>
                  } @else {
                    <span class="text-[#e05757] font-mono text-[10px]">{{ trace.statusCode || 'ERR' }}</span>
                  }
                </div>

                <div class="flex items-center justify-between text-[10px] text-[#6b6b68] pt-1 border-t border-[#262626]">
                  <span>Delay: {{ trace.simulatedDelay }}ms</span>
                  @if (trace.durationMs !== undefined) {
                    <span class="text-[#e6e6e5] font-mono">{{ trace.durationMs }}ms</span>
                  } @else {
                    <span class="text-[#d8a33f] animate-pulse">waiting...</span>
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
