import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { ToastService } from '../../core/services/toast.service';

interface SocialLink {
  title: string;
  handle: string;
  url: string;
  description: string;
  badge: string;
  iconType: 'github' | 'linkedin' | 'x' | 'email' | 'web';
}

@Component({
  selector: 'app-creator',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkspaceHeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      
      <!-- Render Sidebar if authenticated -->
      @if (authService.isAuthenticated()) {
        <app-sidebar></app-sidebar>
      }

      <!-- Main Content Area -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]="authService.isAuthenticated() && sidebarService.isOpen()"
        [class.md:pl-0]="!authService.isAuthenticated() || !sidebarService.isOpen()"
      >
        <!-- Top Workspace Header -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'Creator Profile' }]"
        ></app-workspace-header>

        <!-- Profile Page Content -->
        <div class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <!-- Profile Hero Header -->
          <div class="p-6 sm:p-8 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-5 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center gap-5">
              <!-- Avatar -->
              <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#292929] border border-[#3d3d3d] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#ffffff] shadow-inner shrink-0">
                <span>EC</span>
                <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#5cb87a] border-2 border-[#202020]" title="Available for opportunities"></span>
              </div>

              <!-- Title & Bio -->
              <div class="space-y-1.5 flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-xl sm:text-2xl font-bold text-[#ffffff] tracking-tight">
                    Ethan &bull; Creator & Architect
                  </h1>
                  <span class="tag-bronze text-[10px]">Full-Stack Systems</span>
                </div>
                <p class="text-xs sm:text-sm text-[#9b9a97] leading-relaxed">
                  Builder of MPloyChek. Focused on scalable enterprise Angular applications, high-performance Node.js / TypeScript microservices, and distributed database seams.
                </p>
                <div class="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#787774] font-mono">
                  <span>📍 Global / Remote</span>
                  <span>&bull;</span>
                  <span class="text-[#5cb87a]">● Open to Collaborations</span>
                </div>
              </div>
            </div>

            <!-- Quick Stats Banner -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#2b2b2b] text-xs">
              <div class="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#282828]">
                <div class="text-[10px] text-[#787774] uppercase tracking-wider">Frontend</div>
                <div class="font-mono font-semibold text-[#e6e6e5] mt-0.5">Angular 19</div>
              </div>
              <div class="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#282828]">
                <div class="text-[10px] text-[#787774] uppercase tracking-wider">Backend</div>
                <div class="font-mono font-semibold text-[#e6e6e5] mt-0.5">Node.js / TS</div>
              </div>
              <div class="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#282828]">
                <div class="text-[10px] text-[#787774] uppercase tracking-wider">Storage</div>
                <div class="font-mono font-semibold text-[#bc8c74] mt-0.5">Dual DB Seam</div>
              </div>
              <div class="p-2.5 rounded-lg bg-[#1a1a1a] border border-[#282828]">
                <div class="text-[10px] text-[#787774] uppercase tracking-wider">Telemetry</div>
                <div class="font-mono font-semibold text-[#5cb87a] mt-0.5">Real-time ns</div>
              </div>
            </div>
          </div>

          <!-- Social Links Grid -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold uppercase tracking-wider text-[#e6e6e5]">Connect & Socials</h2>
                <p class="text-xs text-[#787774]">Direct links to my profiles, codebase, and engineering network.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              @for (social of socials; track social.title) {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group p-4 rounded-xl bg-[#202020] border border-[#2b2b2b] hover:border-[#3d3d3d] hover:bg-[#242424] transition-all flex flex-col justify-between space-y-3 cursor-pointer shadow-xs"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <!-- Icon Box -->
                      <div class="w-9 h-9 rounded-lg bg-[#272727] border border-[#353535] flex items-center justify-center text-[#e6e6e5] group-hover:text-[#ffffff] group-hover:border-[#444] transition-colors shrink-0">
                        @switch (social.iconType) {
                          @case ('github') {
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                          }
                          @case ('linkedin') {
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                            </svg>
                          }
                          @case ('x') {
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          }
                          @case ('email') {
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          }
                          @case ('web') {
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          }
                        }
                      </div>

                      <div>
                        <div class="text-xs font-semibold text-[#ffffff] group-hover:text-[#bc8c74] transition-colors flex items-center gap-1.5">
                          <span>{{ social.title }}</span>
                          <span class="text-[10px] text-[#666] group-hover:translate-x-0.5 transition-transform">↗</span>
                        </div>
                        <div class="text-[11px] font-mono text-[#8a8986]">{{ social.handle }}</div>
                      </div>
                    </div>

                    <span class="tag-bronze text-[10px]">{{ social.badge }}</span>
                  </div>

                  <p class="text-[11px] text-[#787774] leading-relaxed">
                    {{ social.description }}
                  </p>
                </a>
              }
            </div>
          </div>

          <!-- Engineering Highlights Section -->
          <div class="p-6 rounded-xl bg-[#202020] border border-[#2b2b2b] space-y-4">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-[#e6e6e5]">MPloyChek Architecture Highlights</h2>
            
            <div class="space-y-3 text-xs text-[#9b9a97] leading-relaxed">
              <div class="flex items-start gap-2.5">
                <span class="text-[#bc8c74] font-mono mt-0.5">&bull;</span>
                <div>
                  <strong class="text-[#ffffff]">Strict Notion Dark Design System:</strong> No generic third-party UI framework styling; custom hex palette (#191919 workspace background, #202020 card surfaces, #2f2f2f borders, and bronze accents).
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="text-[#bc8c74] font-mono mt-0.5">&bull;</span>
                <div>
                  <strong class="text-[#ffffff]">Dual-Database Repository Seam:</strong> Abstract storage pattern that effortlessly allows production swapping between In-Memory MongoDB (for instant self-contained testing) and AWS DynamoDB.
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="text-[#bc8c74] font-mono mt-0.5">&bull;</span>
                <div>
                  <strong class="text-[#ffffff]">Field-Level RBAC Query Projections:</strong> Sensitive metrics (compensation tier and background check risk score) are completely stripped at the database query level for General Users.
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="text-[#bc8c74] font-mono mt-0.5">&bull;</span>
                <div>
                  <strong class="text-[#ffffff]">Real-Time Parameterized Delay & Telemetry:</strong> High-resolution nanosecond measurement middleware capturing HTTP latency, process memory, and live rolling buffers.
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-[#2b2b2b] flex items-center justify-between text-xs">
              <a
                routerLink="/docs"
                class="text-[#bc8c74] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Read Full System Design Specification</span>
                <span>→</span>
              </a>

              <a
                routerLink="/dashboard"
                class="text-[#8a8986] hover:text-[#ffffff] transition-colors"
              >
                Go to Workspace →
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class CreatorComponent {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  toastService = inject(ToastService);

  socials: SocialLink[] = [
    {
      title: 'GitHub',
      handle: 'Ethan4582',
      url: 'https://github.com/Ethan4582',
      description: 'Repositories, full-stack open source architecture, and enterprise application samples.',
      badge: 'Code & Repos',
      iconType: 'github',
    },
    {
      title: 'LinkedIn',
      handle: 'in/ethan4582',
      url: 'https://www.linkedin.com/in/ethan-singh-0536a0279/',
      description: 'Professional engineering track record, enterprise consulting, and connections.',
      badge: 'Professional',
      iconType: 'linkedin',
    },
    {
      title: 'X / Twitter',
      handle: '@ethan4582',
      url: 'https://x.com/ethan4582',
      description: 'System design insights, frontend architecture discussions, and dev updates.',
      badge: 'Discussions',
      iconType: 'x',
    },
    {
      title: 'Repository',
      handle: 'Ethan4582/MPloyChek',
      url: 'https://github.com/Ethan4582/MPloyChek',
      description: 'Direct repository for MPloyChek containing system design docs and test seed.',
      badge: 'Source',
      iconType: 'web',
    },
    {
      title: 'Direct Email',
      handle: 'ethan4582.dev@gmail.com',
      url: 'mailto:ethan4582.dev@gmail.com',
      description: 'Inquiries regarding software engineering, system architecture, or full-stack opportunities.',
      badge: 'Contact',
      iconType: 'email',
    },
  ];
}
