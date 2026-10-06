import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg shadow-notion-dropdown border bg-[#242424] text-[#e6e6e5] text-xs transition-all animate-in slide-in-from-bottom-2 duration-150"
          [ngClass]="{
            'border-[#383838]': toast.type === 'info',
            'border-[#4dab7e]/40': toast.type === 'success',
            'border-[#e05757]/40': toast.type === 'error',
            'border-[#d8a33f]/40': toast.type === 'warning'
          }"
        >
          <div class="mt-0.5 shrink-0 text-sm">
            @if (toast.type === 'success') {
              <span>✅</span>
            } @else if (toast.type === 'error') {
              <span>⚠️</span>
            } @else if (toast.type === 'warning') {
              <span>🔔</span>
            } @else {
              <span>ℹ️</span>
            }
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-[#ffffff]">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="text-[11px] text-[#9b9a97] mt-0.5 leading-snug">{{ toast.message }}</p>
            }
          </div>

          <button
            (click)="toastService.remove(toast.id)"
            class="text-[#787774] hover:text-[#ffffff] transition-colors shrink-0 p-0.5"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
