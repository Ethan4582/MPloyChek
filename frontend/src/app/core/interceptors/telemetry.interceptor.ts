import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { TelemetryService } from '../services/telemetry.service';
import { DelayService } from '../services/delay.service';

export const telemetryInterceptor: HttpInterceptorFn = (req, next) => {
  const telemetry = inject(TelemetryService);
  const delayService = inject(DelayService);

  const isApi = req.url.startsWith('/api');
  if (!isApi) {
    return next(req);
  }

  const delayMs = delayService.currentDelay();
  const traceId = telemetry.startTrace(req.method, req.urlWithParams || req.url, delayMs);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          telemetry.completeTrace(traceId, event.status);
        }
      },
      error: (err: HttpErrorResponse) => {
        telemetry.failTrace(traceId, err.status, err.error?.error || err.message);
      },
    })
  );
};
