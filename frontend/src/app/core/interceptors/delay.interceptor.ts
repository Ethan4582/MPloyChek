import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DelayService } from '../services/delay.service';

export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  const delayService = inject(DelayService);
  const currentDelay = delayService.currentDelay();

  // Only append delay parameter to internal /api requests
  if (req.url.startsWith('/api') && currentDelay > 0) {
    const updatedParams = req.params.set('delay', currentDelay.toString());
    const modifiedReq = req.clone({
      params: updatedParams,
      setHeaders: {
        'x-simulated-delay': currentDelay.toString(),
      },
    });
    return next(modifiedReq);
  }

  return next(req);
};
