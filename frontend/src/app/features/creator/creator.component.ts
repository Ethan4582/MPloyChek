import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

interface SocialLink {
  title: string;
  handle: string;
  url: string;
  description: string;
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
        <div class="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          
          <!-- Simple Creator Card -->
          <div class="p-6 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-4 shadow-sm">
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div class="w-14 h-14 rounded-xl bg-[#292929] border border-[#3d3d3d] flex items-center justify-center text-lg font-bold text-[#ffffff] shadow-inner shrink-0">
                <span>AS</span>
              </div>

              <!-- Title & Bio -->
              <div class="space-y-1 min-w-0 flex-1">
                <h1 class="text-lg font-bold text-[#ffffff] tracking-tight">
                  Ashirwad Singh
                </h1>
                <p class="text-xs text-[#9b9a97] leading-relaxed">
                  Creator of MPloyChek. Full-stack developer specializing in Angular, Node.js, and web systems.
                </p>
              </div>
            </div>
          </div>

          <!-- Social Links List -->
          <div class="space-y-3">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8a8986]">Connect</h2>

            <div class="space-y-2">
              @for (social of socials; track social.title) {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group p-3.5 rounded-lg bg-[#202020] border border-[#2b2b2b] hover:border-[#3d3d3d] hover:bg-[#242424] transition-all flex items-center justify-between cursor-pointer shadow-xs"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Icon Box -->
                    <div class="w-8 h-8 rounded-md bg-[#272727] border border-[#353535] flex items-center justify-center text-[#e6e6e5] group-hover:text-[#ffffff] transition-colors shrink-0">
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

                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-[#ffffff] group-hover:text-[#bc8c74] transition-colors flex items-center gap-1.5">
                        <span>{{ social.title }}</span>
                        <span class="text-[10px] text-[#666] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                      </div>
                      <div class="text-[11px] font-mono text-[#8a8986] truncate">{{ social.handle }}</div>
                    </div>
                  </div>

                  <span class="text-xs text-[#787774] hidden sm:inline">{{ social.description }}</span>
                </a>
              }
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

  socials: SocialLink[] = [
    {
      title: 'Portfolio',
      handle: 'aash7.xyz',
      url: 'https://www.aash7.xyz/',
      description: 'Personal portfolio and projects',
      iconType: 'web',
    },
    {
      title: 'LinkedIn',
      handle: 'ashirwad08singh',
      url: 'https://www.linkedin.com/in/ashirwad08singh/',
      description: 'Professional profile & network',
      iconType: 'linkedin',
    },
    {
      title: 'X / Twitter',
      handle: '@ashirwadsingh_',
      url: 'https://x.com/ashirwadsingh_',
      description: 'Updates and thoughts',
      iconType: 'x',
    },
    {
      title: 'Email',
      handle: 'singhashirwad2003@gmail.com',
      url: 'mailto:singhashirwad2003@gmail.com',
      description: 'Direct email contact',
      iconType: 'email',
    },
    {
      title: 'GitHub',
      handle: 'Ethan4582',
      url: 'https://github.com/Ethan4582',
      description: 'GitHub repositories and open-source code',
      iconType: 'github',
    },
  ];
}
