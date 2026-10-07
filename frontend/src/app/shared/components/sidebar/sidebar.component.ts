import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop -->
    @if (sidebarService.isOpen()) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        (click)="sidebarService.close()"
      ></div>
    }

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0"
      [class.translate-x-0]="sidebarService.isOpen()"
      [class.-translate-x-full]="!sidebarService.isOpen()"
    >
      <!-- Top Section -->
      <div class="flex flex-col flex-1 overflow-y-auto">
        
        <!-- Workspace Header -->
        <div class="p-3.5 border-b border-[#2a2a2a] flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-7 h-7 rounded-md bg-[#252525] border border-[#383838] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#bc8c74]/70 shadow-sm">
              <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="text-xs font-bold text-[#ffffff] tracking-tight group-hover:text-[#bc8c74] transition-colors">
                MPloyChek
              </div>
              <div class="text-[10px] text-[#787774] font-mono leading-none">
                Workspace
              </div>
            </div>
          </a>

          <!-- Mobile Close Button -->
          <button
            type="button"
            (click)="sidebarService.close()"
            class="p-1 rounded text-[#8a8986] hover:text-[#ffffff] md:hidden"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        <!-- Current User Profile Details Widget -->
        @if (authService.currentUser(); as user) {
          <div class="p-3 m-3 rounded-lg bg-[#242424] border border-[#303030]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-md bg-[#2f2f2f] border border-[#404040] flex items-center justify-center text-xs font-semibold text-[#e6e6e5] shrink-0">
                {{ getUserInitials(user.name) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-semibold text-[#ffffff] truncate">
                  {{ user.name }}
                </div>
                <div class="text-[10px] text-[#8a8986] truncate font-mono">
                  {{ user.userId }}
                </div>
              </div>
            </div>

            <div class="mt-2.5 pt-2 border-t border-[#2e2e2e] flex items-center justify-between text-[10px]">
              <span class="text-[#8a8986] truncate">{{ user.department }}</span>
              @if (user.role === 'Admin') {
                <span class="tag-bronze text-[9px] px-1.5 py-0.5">Admin Clearance</span>
              } @else {
                <span class="tag-blue text-[9px] px-1.5 py-0.5">General User</span>
              }
            </div>
          </div>
        }

        <!-- Navigation Links -->
        <nav class="px-3 py-1 space-y-1 text-xs">
          <div class="text-[10px] uppercase font-mono tracking-wider text-[#686866] px-2 py-1 select-none">
            Directory & Controls
          </div>

          <a
            routerLink="/dashboard"
            routerLinkActive="bg-[#292929] text-[#ffffff] font-medium border-[#3d3d3d]"
            (click)="sidebarService.close()"
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#252525] border border-transparent transition-all select-none"
          >
            <span>📋</span>
            <span>Verification Directory</span>
          </a>

          @if (authService.isAdmin()) {
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-[#292929] text-[#ffffff] font-medium border-[#3d3d3d]"
              (click)="sidebarService.close()"
              class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#252525] border border-transparent transition-all select-none"
            >
              <span>👥</span>
              <span>User Administration</span>
            </a>
          }

          <a
            routerLink="/docs"
            routerLinkActive="bg-[#292929] text-[#ffffff] font-medium border-[#3d3d3d]"
            (click)="sidebarService.close()"
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#252525] border border-transparent transition-all select-none"
          >
            <span>📖</span>
            <span>System Architecture</span>
          </a>
        </nav>

        <!-- Real-Time Telemetry & Delay Section in Sidebar -->
        <div class="px-3 pt-3 mt-3 border-t border-[#2a2a2a] text-xs space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <span class="text-[10px] uppercase font-mono tracking-wider text-[#686866]">Live Telemetry</span>
            <div class="flex items-center gap-1 text-[10px] text-[#5cb87a] font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-[#5cb87a] animate-pulse"></span>
              <span>Online ({{ telemetryService.data()?.database?.pingMs || 0.9 }}ms)</span>
            </div>
          </div>

          <!-- Simulated Delay Selector -->
          <div class="p-2.5 rounded-lg bg-[#242424] border border-[#2f2f2f] space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-[#8a8986]">API Delay Parameter:</span>
              <span class="font-mono text-[#bc8c74] font-semibold">{{ delayService.currentDelay() }}ms</span>
            </div>

            <div class="grid grid-cols-4 gap-1">
              @for (d of delayOptions; track d.ms) {
                <button
                  type="button"
                  (click)="delayService.setDelay(d.ms)"
                  class="py-1 text-[10px] font-mono rounded transition-all text-center"
                  [ngClass]="
                    delayService.currentDelay() === d.ms
                      ? 'bg-[#332924] text-[#bc8c74] border border-[#48372f] font-semibold'
                      : 'bg-[#1e1e1e] text-[#787774] hover:text-[#e6e6e5] border border-transparent'
                  "
                >
                  {{ d.label }}
                </button>
              }
            </div>

            <!-- Mini Telemetry Counters -->
            <div class="pt-2 border-t border-[#2c2c2c] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#8a8986]">
              <div>
                <span>Avg Latency: </span>
                <span class="text-[#e6e6e5]">{{ telemetryService.data()?.traffic?.avgLatencyMs || 0 }}ms</span>
              </div>
              <div class="text-right">
                <span>Requests: </span>
                <span class="text-[#7da0ca]">{{ telemetryService.data()?.traffic?.totalRequests || 0 }}</span>
              </div>
            </div>

            <!-- Open Inspector Button -->
            <button
              type="button"
              (click)="telemetryService.toggleInspector()"
              class="w-full notion-btn text-[11px] py-1 text-center justify-center flex items-center gap-1.5 cursor-pointer mt-1"
            >
              <span>📊</span>
              <span>Open Telemetry Stream</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Bottom Session / Sign Out -->
      <div class="p-3 border-t border-[#2a2a2a] bg-[#1a1a1a]">
        <button
          type="button"
          (click)="onSignOut()"
          class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-[#8a8986] hover:text-[#e05757] hover:bg-[#252525] transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <span>🚪</span>
            <span>Sign Out</span>
          </div>
          <span class="text-[10px] font-mono text-[#555]">JWT</span>
        </button>
      </div>

    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
  delayService = inject(DelayService);
  telemetryService = inject(TelemetryService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  delayOptions = [
    { label: '0ms', ms: 0 },
    { label: '500ms', ms: 500 },
    { label: '1.5s', ms: 1500 },
    { label: '3.0s', ms: 3000 },
  ];

  getUserInitials(name = ''): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onSignOut(): void {
    this.authService.logout();
    this.sidebarService.close();
    this.router.navigate(['/login']);
  }
}
