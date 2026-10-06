export type RequestStatus = 'PENDING' | 'SUCCESS' | 'ERROR' | 'CANCELLED';

export interface TelemetryTrace {
  id: string;
  method: string;
  url: string;
  startTime: number;
  simulatedDelay: number;
  endTime?: number;
  durationMs?: number;
  status: RequestStatus;
  statusCode?: number;
  errorMessage?: string;
}
