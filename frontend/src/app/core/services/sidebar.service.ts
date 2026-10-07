import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // On screens smaller than 768px (md breakpoint), sidebar should be closed by default
  readonly isOpen = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
