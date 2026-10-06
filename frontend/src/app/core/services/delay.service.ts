import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DelayService {
  private readonly STORAGE_KEY = 'mploychek_delay_ms';

  // Available delay options in milliseconds
  readonly delayOptions = [
    { label: 'Instant (0ms)', value: 0 },
    { label: 'Fast (500ms)', value: 500 },
    { label: 'Normal (1.5s)', value: 1500 },
    { label: 'Simulated Lag (3.0s)', value: 3000 },
    { label: 'Heavy Delay (5.0s)', value: 5000 },
  ];

  // Default to 1500ms so async processing is clearly visible
  private delaySignal = signal<number>(this.getStoredDelay());
  readonly currentDelay = this.delaySignal.asReadonly();

  setDelay(ms: number): void {
    const clamped = Math.max(0, Math.min(ms, 15000));
    this.delaySignal.set(clamped);
    try {
      localStorage.setItem(this.STORAGE_KEY, clamped.toString());
    } catch {
      // Ignore storage errors
    }
  }

  private getStoredDelay(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) return val;
      }
    } catch {
      // Fallback
    }
    return 1500;
  }
}
