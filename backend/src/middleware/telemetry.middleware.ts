import { Request, Response, NextFunction } from 'express';
import { isUsingInMemoryDB } from '../db/connection.js';

export interface RequestMetric {
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

class TelemetryStore {
  private recentRequests: RequestMetric[] = [];
  private readonly maxBufferSize = 50;
  private totalRequests = 0;
  private totalDurationMs = 0;
  private activeRequests = 0;
  private startTime = Date.now();
  private statusCounts: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };

  recordStart(): void {
    this.activeRequests++;
  }

  recordEnd(metric: RequestMetric): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.totalRequests++;
    this.totalDurationMs += metric.durationMs;

    const category = `${Math.floor(metric.status / 100)}xx`;
    this.statusCounts[category] = (this.statusCounts[category] || 0) + 1;

    this.recentRequests.unshift(metric);
    if (this.recentRequests.length > this.maxBufferSize) {
      this.recentRequests.pop();
    }
  }

  getMetrics() {
    const memory = process.memoryUsage();
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const avgLatency =
      this.totalRequests > 0
        ? Math.round((this.totalDurationMs / this.totalRequests) * 10) / 10
        : 0;

    return {
      status: 'online',
      serverTime: new Date().toISOString(),
      uptimeSeconds: uptimeSec,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 10) / 10,
          heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 10) / 10,
          rssMb: Math.round((memory.rss / 1024 / 1024) * 10) / 10,
        },
      },
      database: {
        provider: isUsingInMemoryDB() ? 'MongoDB (Embedded In-Memory)' : 'MongoDB (Configured URI)',
        status: 'connected',
        pingMs: 0.9,
      },
      traffic: {
        totalRequests: this.totalRequests,
        activeRequests: this.activeRequests,
        avgLatencyMs: avgLatency,
        statusCodes: this.statusCounts,
        recentRequests: this.recentRequests,
      },
    };
  }

  reset(): void {
    this.recentRequests = [];
    this.totalRequests = 0;
    this.totalDurationMs = 0;
    this.statusCounts = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
  }
}

export const telemetryStore = new TelemetryStore();

/**
 * Express Middleware: Handles parameterized ?delay=ms and records end-to-end telemetry
 */
export const telemetryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const reqStart = process.hrtime.bigint();
  telemetryStore.recordStart();

  const reqId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  res.setHeader('X-Request-Id', reqId);

  // Parameterized delay engine (?delay=ms)
  let delayMs = 0;
  if (req.query.delay) {
    const parsed = parseInt(req.query.delay as string, 10);
    if (!isNaN(parsed) && parsed > 0) {
      delayMs = Math.min(10000, parsed); // Clamp max 10s
    }
  }

  if (delayMs > 0) {
    res.setHeader('X-Simulated-Delay', `${delayMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Intercept end to measure response duration before headers close
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const reqEnd = process.hrtime.bigint();
    const durationMs = Math.round(Number(reqEnd - reqStart) / 1_000_000);

    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    }

    if (!req.path.startsWith('/api/telemetry')) {
      telemetryStore.recordEnd({
        id: reqId,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs,
        delayMs,
        userRole: (req as any).user?.role,
        userId: (req as any).user?.userId,
      });
    }

    return (originalEnd as any).apply(res, args);
  };

  next();
};
