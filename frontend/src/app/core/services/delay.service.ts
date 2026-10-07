import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DelayService {
  // Default to 1500ms to immediately showcase async network processing on page load
  readonly currentDelay = signal<number>(1500);

  setDelay(ms: number): void {
    const clamped = Math.min(10000, Math.max(0, ms));
    this.currentDelay.set(clamped);
  }
}
