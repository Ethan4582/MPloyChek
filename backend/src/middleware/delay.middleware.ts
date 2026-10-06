import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function delayMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Extract delay from query param (?delay=2000) or header (x-simulated-delay: 2000)
  const queryDelay = req.query.delay ? parseInt(req.query.delay as string, 10) : NaN;
  const headerDelay = req.headers['x-simulated-delay']
    ? parseInt(req.headers['x-simulated-delay'] as string, 10)
    : NaN;

  let delayMs = !isNaN(queryDelay) ? queryDelay : !isNaN(headerDelay) ? headerDelay : config.defaultDelayMs;

  // Clamp delay between 0 and 15000ms to prevent abusive DoS while allowing rich async testing
  delayMs = Math.max(0, Math.min(delayMs, 15000));

  res.setHeader('X-Simulated-Delay', `${delayMs}ms`);

  const originalSend = res.send;
  res.send = function (body?: any): Response {
    const totalDuration = Date.now() - startTime;
    res.setHeader('X-Response-Duration', `${totalDuration}ms`);
    return originalSend.call(this, body);
  };

  if (delayMs > 0) {
    console.log(`[Delay Engine] Emulating network/server latency: ${delayMs}ms on ${req.method} ${req.path}`);
    setTimeout(() => {
      next();
    }, delayMs);
  } else {
    next();
  }
}
