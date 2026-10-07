import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DelayService } from '../services/delay.service';

export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  // Do not slow down telemetry polling or health checks
  if (req.url.includes('/api/telemetry') || req.url.includes('/api/health')) {
    return next(req);
  }

  // Only apply to API requests
  if (req.url.startsWith('/api/')) {
    const delayService = inject(DelayService);
    const delay = delayService.currentDelay();

    // If query string doesn't already specify delay, inject the global simulated delay
    if (delay > 0 && !req.params.has('delay') && !req.url.includes('delay=')) {
      const clonedReq = req.clone({
        setParams: {
          delay: delay.toString(),
        },
      });
      return next(clonedReq);
    }
  }

  return next(req);
};
