import { Injectable, signal, computed } from '@angular/core';
import { TelemetryTrace, RequestStatus } from '../models/telemetry.models';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private tracesSignal = signal<TelemetryTrace[]>([]);
  readonly traces = this.tracesSignal.asReadonly();

  readonly activeRequestsCount = computed(
    () => this.traces().filter((t) => t.status === 'PENDING').length
  );

  readonly hasActiveRequests = computed(() => this.activeRequestsCount() > 0);

  readonly lastTrace = computed(() => {
    const list = this.traces();
    return list.length > 0 ? list[0] : null;
  });

  startTrace(method: string, url: string, simulatedDelay: number): string {
    const id = Math.random().toString(36).substring(2, 9);
    const trace: TelemetryTrace = {
      id,
      method,
      url,
      startTime: Date.now(),
      simulatedDelay,
      status: 'PENDING',
    };

    this.tracesSignal.update((prev) => [trace, ...prev.slice(0, 19)]);
    return id;
  }

  completeTrace(id: string, statusCode: number, durationMs?: number): void {
    this.tracesSignal.update((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const now = Date.now();
          return {
            ...t,
            endTime: now,
            durationMs: durationMs ?? now - t.startTime,
            status: 'SUCCESS',
            statusCode,
          };
        }
        return t;
      })
    );
  }

  failTrace(id: string, statusCode?: number, errorMessage?: string): void {
    this.tracesSignal.update((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const now = Date.now();
          return {
            ...t,
            endTime: now,
            durationMs: now - t.startTime,
            status: 'ERROR',
            statusCode,
            errorMessage,
          };
        }
        return t;
      })
    );
  }

  clearTraces(): void {
    this.tracesSignal.set([]);
  }
}
