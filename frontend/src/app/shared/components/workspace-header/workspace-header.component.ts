import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';
import { DelayService } from '../../../core/services/delay.service';
import { TelemetryService } from '../../../core/services/telemetry.service';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-workspace-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-30 w-full h-14 bg-[#191919]/95 backdrop-blur-md border-b border-[#2a2a2a] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      <!-- Left: Mobile Toggle & Breadcrumbs -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Mobile Sidebar Hamburger Toggle -->
        <button
          type="button"
          (click)="sidebarService.toggle()"
          class="p-1.5 -ml-1 rounded-md text-[#8a8986] hover:text-[#ffffff] hover:bg-[#252525] md:hidden transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <span class="text-base leading-none">☰</span>
        </button>

        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-1.5 text-xs text-[#8a8986] truncate select-none">
          <a routerLink="/" class="hover:text-[#ffffff] transition-colors shrink-0">
            MPloyChek
          </a>

          @for (item of breadcrumbs; track item.label) {
            <span class="text-[#555] shrink-0">/</span>
            @if (item.url) {
              <a [routerLink]="item.url" class="hover:text-[#ffffff] transition-colors truncate">
                {{ item.label }}
              </a>
            } @else {
              <span class="text-[#ffffff] font-medium truncate">
                {{ item.label }}
              </span>
            }
          }
        </nav>
      </div>

      <!-- Right: Contextual Page Action & Live Delay Pill -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        
        <!-- Live Parameterized Delay Pill -->
        <button
          type="button"
          (click)="telemetryService.toggleInspector()"
          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#222222] border border-[#2f2f2f] text-[#bc8c74] hover:border-[#bc8c74]/50 transition-all cursor-pointer"
          title="Click to view live telemetry metrics"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#5cb87a] animate-pulse"></span>
          <span>Delay: {{ delayService.currentDelay() }}ms</span>
        </button>

        <!-- Contextual Action Button (Top-Right requirement) -->
        @if (actionLabel) {
          <button
            type="button"
            (click)="onActionClick()"
            [disabled]="isActionLoading"
            class="notion-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            @if (actionIcon) {
              <span>{{ actionIcon }}</span>
            }
            <span>{{ actionLabel }}</span>
          </button>
        }

        <!-- Secondary Action / Refresh -->
        @if (showRefresh) {
          <button
            type="button"
            (click)="onRefreshClick()"
            [disabled]="isActionLoading"
            class="notion-btn text-xs py-1.5 px-2.5 flex items-center gap-1 cursor-pointer"
            title="Reload with current delay"
          >
            <span>🔄</span>
            <span class="hidden sm:inline">Sync</span>
          </button>
        }

      </div>

    </header>
  `,
})
export class WorkspaceHeaderComponent {
  sidebarService = inject(SidebarService);
  delayService = inject(DelayService);
  telemetryService = inject(TelemetryService);

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actionLabel: string | null = null;
  @Input() actionIcon: string | null = null;
  @Input() isActionLoading = false;
  @Input() showRefresh = true;

  @Output() actionClicked = new EventEmitter<void>();
  @Output() refreshClicked = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClicked.emit();
  }

  onRefreshClick(): void {
    this.refreshClicked.emit();
  }
}
