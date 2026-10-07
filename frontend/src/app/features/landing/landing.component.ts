import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex-1 flex flex-col justify-between w-full px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 max-w-4xl mx-auto">
      
      <!-- Main Hero Section -->
      <section class="flex flex-col items-start gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <!-- Category Pill -->
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#1e2d3d] text-[#529cca] border border-[#273c52]">
          <span>RBAC Verification Portal</span>
          <span class="text-[#3c5d7d]">&bull;</span>
          <span class="text-[#888885]">v1.0</span>
        </div>

        <!-- Headline & Description -->
        <div class="space-y-4 max-w-2xl">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#ffffff] leading-tight">
            Role-based employment verification.
          </h1>
          <p class="text-sm sm:text-base text-[#9b9a97] leading-relaxed font-normal">
            A compliance workspace separating organizational management from employee records. Built with Angular 18 and Node.js with zero-configuration in-memory database fallback.
          </p>
        </div>

        <!-- Action CTAs -->
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <a
            [routerLink]="authService.isAuthenticated() ? '/dashboard' : '/login'"
            class="notion-btn-primary px-4 py-2 text-xs font-medium"
          >
            {{ authService.isAuthenticated() ? 'Open Workspace' : 'Launch Portal' }} &rarr;
          </a>

          <a
            routerLink="/docs"
            class="notion-btn px-3.5 py-2 text-xs font-medium text-[#e6e6e5] hover:text-[#ffffff] flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5 text-[#bc8c74]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>System Design</span>
          </a>

          <a
            href="https://github.com/Ethan4582/MPloyChek"
            target="_blank"
            rel="noopener noreferrer"
            class="notion-btn px-3.5 py-2 text-xs font-medium text-[#9b9a97] hover:text-[#ffffff] flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        <!-- Specimen Previews: Tabbed Notion Style -->
        <div id="preview" class="w-full mt-2 space-y-2">
          
          <!-- Tab Selector -->
          <div class="flex items-center gap-2 text-xs">
            <button
              type="button"
              (click)="activePreviewTab.set('record')"
              class="px-3 py-1.5 rounded transition-colors"
              [ngClass]="activePreviewTab() === 'record' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#202020]'"
            >
              Verification Record
            </button>
            <button
              type="button"
              (click)="activePreviewTab.set('architecture')"
              class="px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
              [ngClass]="activePreviewTab() === 'architecture' ? 'bg-[#292929] text-[#ffffff] font-medium' : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#202020]'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#bc8c74]"></span>
              <span>System Design Document</span>
            </button>
          </div>

          <!-- Preview Card 1: Record -->
          @if (activePreviewTab() === 'record') {
            <div class="w-full p-5 rounded-lg bg-[#202020] border border-[#2f2f2f] hover:border-[#3a3a3a] transition-all duration-200 text-xs shadow-sm animate-in fade-in duration-150">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#2b2b2b] gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[11px] text-[#787774]">REC-2026-001</span>
                  <span class="text-[#3a3a3a]">&bull;</span>
                  <span class="font-medium text-[#ffffff]">Jordan Rivera</span>
                  <span class="text-[#787774] text-[11px]">Senior Full Stack Engineer</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="tag-green text-[10px]">Verified</span>
                  <span class="tag-blue text-[10px]">General Clearance</span>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span class="block text-[#787774] mb-0.5">Department</span>
                  <span class="text-[#e6e6e5] font-medium">Software Engineering</span>
                </div>
                <div>
                  <span class="block text-[#787774] mb-0.5">Background Date</span>
                  <span class="text-[#e6e6e5] font-mono">2026-01-15</span>
                </div>
                <div>
                  <span class="block text-[#787774] mb-0.5">Risk Rating</span>
                  <span class="text-[#4dab7e] font-medium">Low Risk (4/100)</span>
                </div>
                <div>
                  <span class="block text-[#787774] mb-0.5">RBAC Scope</span>
                  <span class="text-[#9b9a97]">Admin: Full &bull; User: Scoped</span>
                </div>
              </div>
            </div>
          }

          <!-- Preview Card 2: System Design Architecture -->
          @if (activePreviewTab() === 'architecture') {
            <div class="w-full p-5 rounded-lg bg-[#202020] border border-[#2f2f2f] hover:border-[#3a3a3a] transition-all duration-200 text-xs shadow-sm space-y-3.5 animate-in fade-in duration-150">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#2b2b2b] gap-2">
                <div class="flex items-center gap-2 font-mono text-xs">
                  <span class="text-[#bc8c74] font-semibold">Dual-Mode Architecture Spec</span>
                  <span class="text-[#555]">&bull;</span>
                  <span class="text-[#888885]">system-design.md</span>
                </div>
                <a
                  routerLink="/docs"
                  class="text-[11px] font-mono text-[#bc8c74] hover:underline flex items-center gap-1"
                >
                  <span>Read Full Spec</span>
                  <span>&rarr;</span>
                </a>
              </div>

              <!-- Pipeline Flow Visual -->
              <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-[#171717] border border-[#282828] font-mono text-[11px]">
                <div class="flex items-center gap-1.5 text-[#e6e6e5]">
                  <span class="w-2 h-2 rounded-full bg-[#529cca]"></span>
                  <span>Angular 18 SPA</span>
                </div>
                <span class="text-[#555]">&rarr;</span>
                <div class="flex items-center gap-1.5 text-[#e6e6e5]">
                  <span class="w-2 h-2 rounded-full bg-[#e6c15c]"></span>
                  <span>Express Gateway</span>
                </div>
                <span class="text-[#555]">&rarr;</span>
                <div class="flex items-center gap-1.5 text-[#e6e6e5]">
                  <span class="w-2 h-2 rounded-full bg-[#bc8c74]"></span>
                  <span>Delay Middleware</span>
                </div>
                <span class="text-[#555]">&rarr;</span>
                <div class="flex items-center gap-1.5 text-[#5cb87a]">
                  <span class="w-2 h-2 rounded-full bg-[#5cb87a]"></span>
                  <span>Dual DB Fallback</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-[#9b9a97]">
                <div class="p-2 rounded bg-[#191919] border border-[#262626]">
                  <div class="font-medium text-[#e6e6e5] mb-0.5">RBAC Projection Seam</div>
                  <div class="text-[10px] text-[#787774]">Sanitizes risk scores and compensation grades at query level.</div>
                </div>
                <div class="p-2 rounded bg-[#191919] border border-[#262626]">
                  <div class="font-medium text-[#e6e6e5] mb-0.5">Parameterized Delay</div>
                  <div class="text-[10px] text-[#787774]">Simulates asynchronous queue latency with clamp window.</div>
                </div>
                <div class="p-2 rounded bg-[#191919] border border-[#262626]">
                  <div class="font-medium text-[#e6e6e5] mb-0.5">Zero-Config Startup</div>
                  <div class="text-[10px] text-[#787774]">Starts embedded in-memory database if no external URI is provided.</div>
                </div>
              </div>
            </div>
          }

        </div>

      </section>

      <!-- Minimal Creator & Project Footer -->
      <footer class="mt-16 sm:mt-24 pt-8 border-t border-[#262626] text-xs text-[#787774] space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <!-- Project Info & MIT License -->
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-md bg-[#222222] border border-[#333333] flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="MPloyChek Logo" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-[#e6e6e5] text-xs">MPloyChek</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#262626] text-[#9b9a97] border border-[#333333] font-mono">MIT License</span>
              </div>
              <div class="text-[11px] text-[#787774] mt-0.5">Enterprise Employment Verification & Access Control</div>
            </div>
          </div>

          <!-- Creator Credentials -->
          <div class="flex flex-col sm:items-end gap-1.5">
            <div class="text-[11px] text-[#9b9a97]">
              Created by <a href="https://aash7.xyz/" target="_blank" rel="noopener noreferrer" class="text-[#ffffff] font-medium hover:underline">Ashirwad Singh</a>
            </div>
            
            <div class="flex items-center gap-3 text-[11px]">
              <a
                href="https://aash7.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#ffffff] transition-colors"
              >
                Portfolio
              </a>
              <span class="text-[#3a3a3a]">&bull;</span>
              <a
                href="https://www.linkedin.com/in/ashirwad08singh/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#ffffff] transition-colors"
              >
                LinkedIn
              </a>
              <span class="text-[#3a3a3a]">&bull;</span>
              <a
                href="https://x.com/ashirwadsingh_"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#ffffff] transition-colors"
              >
                X (Twitter)
              </a>
              <span class="text-[#3a3a3a]">&bull;</span>
              <a
                href="https://github.com/Ethan4582"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#ffffff] transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#222222] text-[10px] text-[#555552]">
          <span>&copy; 2026 Ashirwad Singh. Released under the MIT License.</span>
          <div class="flex items-center gap-3">
            <a
              routerLink="/docs"
              class="hover:text-[#9b9a97] transition-colors"
            >
              System Design Document
            </a>
            <span class="text-[#333]">&bull;</span>
            <a
              href="https://github.com/Ethan4582/MPloyChek/blob/master/system-design.md"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-[#9b9a97] transition-colors"
            >
              GitHub Spec
            </a>
          </div>
        </div>
      </footer>

    </div>
  `,
})
export class LandingComponent {
  authService = inject(AuthService);
  activePreviewTab = signal<'record' | 'architecture'>('record');
}
