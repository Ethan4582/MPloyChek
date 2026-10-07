import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface TelemetryMetric {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  delayMs: number;
  userRole?: string;
  userId?: string;
}

export interface TelemetryData {
  status: string;
  serverTime: string;
  uptimeSeconds: number;
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
    };
  };
  database: {
    provider: string;
    status: string;
    pingMs: number;
  };
  traffic: {
    totalRequests: number;
    activeRequests: number;
    avgLatencyMs: number;
    statusCodes: Record<string, number>;
    recentRequests: TelemetryMetric[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService implements OnDestroy {
  private http = inject(HttpClient);

  readonly data = signal<TelemetryData | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isInspectorOpen = signal<boolean>(false);

  private pollIntervalId: any = null;

  constructor() {
    this.fetchMetrics().subscribe();
    // Auto-poll metrics every 5 seconds to keep sidebar telemetry real-time
    this.startPolling(5000);
  }

  fetchMetrics(): Observable<{ success: boolean; data: TelemetryData }> {
    this.isLoading.set(true);
    return this.http.get<{ success: boolean; data: TelemetryData }>('/api/telemetry').pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.data.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      })
    );
  }

  refresh(): void {
    this.fetchMetrics().subscribe();
  }

  resetMetrics(): Observable<any> {
    return this.http.post('/api/telemetry/reset', {}).pipe(
      tap(() => {
        this.fetchMetrics().subscribe();
      })
    );
  }

  startPolling(intervalMs = 5000): void {
    this.stopPolling();
    this.pollIntervalId = setInterval(() => {
      this.fetchMetrics().subscribe();
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  toggleInspector(): void {
    this.isInspectorOpen.update((open) => !open);
  }

  closeInspector(): void {
    this.isInspectorOpen.set(false);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
