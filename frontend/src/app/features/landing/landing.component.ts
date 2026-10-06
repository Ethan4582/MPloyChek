import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex-1 flex flex-col justify-between w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-5xl mx-auto">
      
      <!-- Main Hero Section -->
      <section class="flex flex-col items-start gap-8 my-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <!-- Category Pill -->
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#1e2d3d] text-[#529cca] border border-[#273c52]">
          <span>RBAC Verification Portal</span>
          <span class="text-[#3c5d7d]">&bull;</span>
          <span class="text-[#888885]">v1.0</span>
        </div>

        <!-- Headline & Description -->
        <div class="space-y-4 max-w-3xl">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#ffffff] leading-tight">
            Role-based employment verification.
          </h1>
          <p class="text-sm sm:text-base text-[#9b9a97] leading-relaxed max-w-2xl font-normal">
            A compliance workspace separating organizational management from employee records. Built with Angular 18 and Node.js with zero-configuration in-memory database fallback.
          </p>
        </div>

        <!-- Action CTAs -->
        <div class="flex flex-wrap items-center gap-3 pt-1">
          @if (authService.isAuthenticated()) {
            <a
              routerLink="/dashboard"
              class="notion-btn-primary px-4 py-2 text-xs font-medium"
            >
              Open Workspace &rarr;
            </a>
          } @else {
            <a
              routerLink="/login"
              class="notion-btn-primary px-4 py-2 text-xs font-medium"
            >
              Launch Portal &rarr;
            </a>
          }

          <a
            href="https://github.com/Ethan4582/MPloyChek/blob/master/system-design.md"
            target="_blank"
            rel="noopener noreferrer"
            class="notion-btn px-4 py-2 text-xs font-medium text-[#9b9a97] hover:text-[#ffffff]"
          >
            System Design Docs
          </a>

          <a
            href="https://github.com/Ethan4582/MPloyChek"
            target="_blank"
            rel="noopener noreferrer"
            class="notion-btn-ghost px-3 py-2 text-xs font-medium text-[#9b9a97] hover:text-[#ffffff] flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        <!-- Specimen Preview Card: Notion Style -->
        <div class="w-full mt-4 p-5 rounded-lg bg-[#202020] border border-[#2f2f2f] hover:border-[#3a3a3a] transition-all duration-200 text-xs shadow-sm">
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

      </section>

      <!-- Minimal Footer -->
      <footer class="pt-12 sm:pt-16 pb-4 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#787774]">
        <div class="flex items-center gap-2">
          <span class="text-[#9b9a97] font-medium">MPloyChek</span>
          <span>&copy; 2026</span>
          <span class="text-[#3a3a3a]">&bull;</span>
          <span>Role-Based Verification Portal</span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <a
            href="https://github.com/Ethan4582/MPloyChek/blob/master/system-design.md"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[#ffffff] transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/Ethan4582/MPloyChek"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-[#ffffff] transition-colors"
          >
            GitHub
          </a>
          <a
            routerLink="/login"
            class="hover:text-[#ffffff] transition-colors"
          >
            Sign In
          </a>
        </div>
      </footer>

    </div>
  `,
})
export class LandingComponent {
  authService = inject(AuthService);
}
