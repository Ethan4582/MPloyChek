import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { marked } from 'marked';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, WorkspaceHeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      
      <!-- Collapsible Vertical Sidebar (Shown when logged in) -->
      @if (authService.isAuthenticated()) {
        <app-sidebar></app-sidebar>
      }

      <!-- Main Content Layout Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]="authService.isAuthenticated() && sidebarService.isOpen()"
        [class.md:pl-0]="!authService.isAuthenticated() || !sidebarService.isOpen()"
      >
        <!-- Workspace Header (Shown when authenticated) -->
        @if (authService.isAuthenticated()) {
          <app-workspace-header
            [breadcrumbs]="[{ label: 'System Design & Architecture' }]"
            actionLabel="Download Spec"
            (actionClicked)="downloadRawSpec()"
          ></app-workspace-header>
        }

        <!-- Main Blog / Documentation Two-Column View -->
        <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- Outer Flex Container: Markdown Content (Left) + Sticky TOC (Right) -->
          <div class="flex items-start justify-center gap-10 max-w-7xl mx-auto">
            
            <!-- Left / Center: Main Article Content -->
            <main class="flex-1 max-w-4xl min-w-0 space-y-6">
              
              <!-- Document Title & Meta Header -->
              <div class="space-y-2 pb-5 border-b border-[#2a2a2a]">
                <h1 class="text-2xl sm:text-3xl font-bold text-[#ffffff] tracking-tight">
                  System Design Specification
                </h1>
                
                <p class="text-xs sm:text-sm text-[#9b9a97] leading-relaxed">
                  Technical architecture, dual-database seam, field-level query projection RBAC, and parameterized non-blocking delay engineering.
                </p>

                <!-- Document Author Strip -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#8a8986] font-mono">
                  <div class="flex flex-wrap items-center gap-3">
                    @if (!authService.isAuthenticated()) {
                      <a routerLink="/" class="text-[#8a8986] hover:text-[#ffffff] transition-colors flex items-center gap-1 font-sans">
                        <span>&larr;</span>
                        <span>Home</span>
                      </a>
                      <div>&bull;</div>
                    }
                    <div>Author: <span class="text-[#e6e6e5]">Ashirwad Singh</span></div>
                    <div>&bull;</div>
                    <div>Source: <span class="text-[#bc8c74]">system-design.md</span></div>
                  </div>

                  @if (!authService.isAuthenticated()) {
                    <button
                      type="button"
                      (click)="downloadRawSpec()"
                      class="notion-btn text-xs py-1 px-2.5 flex items-center gap-1.5 text-[#e6e6e5] cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download Spec</span>
                    </button>
                  }
                </div>

                <!-- Mobile Floating TOC Button (Small Screens Only) -->
                <div class="block xl:hidden pt-2">
                  <button
                    type="button"
                    (click)="toggleMobileToc()"
                    class="notion-btn text-xs py-1.5 px-3 flex items-center gap-2 text-[#bc8c74]"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                    <span>Jump to Section ({{ tocList().length }})</span>
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              @if (isLoading()) {
                <div class="py-24 text-center space-y-3">
                  <div class="inline-block animate-spin text-2xl">⏳</div>
                  <div class="text-sm text-[#8a8986]">Rendering system architecture documentation...</div>
                </div>
              } @else {
                <!-- Rendered Markdown Body -->
                <article
                  class="markdown-body text-sm leading-relaxed text-[#c7c6c1]"
                  [innerHTML]="renderedHtml()"
                ></article>
              }

            </main>

            <!-- Right: Sticky Desktop Table of Contents (Blog-Style) -->
            <aside class="hidden xl:block w-72 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 pr-1 select-none">
              
              <!-- Sticky Box Container -->
              <div class="p-4 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-3 shadow-xs">
                
                <div class="flex items-center justify-between pb-2 border-b border-[#2b2b2b]">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-[#e6e6e5]">
                      On This Page
                    </span>
                  </div>
                  <span class="text-[10px] font-mono text-[#8a8986]">{{ tocList().length }} Sections</span>
                </div>

                <!-- Scrollable TOC Navigation Links -->
                <nav class="space-y-0.5 max-h-[55vh] overflow-y-auto pr-1">
                  @for (item of tocList(); track item.id) {
                    <button
                      type="button"
                      (click)="scrollTo(item.id)"
                      class="w-full text-left py-1.5 px-2 rounded-md text-[11px] transition-all truncate block cursor-pointer"
                      [class.pl-4]="item.level === 3"
                      [ngClass]="activeHeadingId() === item.id 
                        ? 'text-[#ffffff] bg-[#292929] font-medium border-l-2 border-[#bc8c74]' 
                        : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#242424] border-l-2 border-transparent'"
                      [title]="item.title"
                    >
                      {{ item.title }}
                    </button>
                  }
                </nav>
              </div>

              <!-- Compact Stack Architecture Summary -->
              <div class="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] space-y-2 text-xs">
                <div class="flex items-center gap-1.5 font-mono text-[11px] text-[#8a8986]">
                  <span class="text-[#e6e6e5] font-semibold">Dual-Mode Architecture</span>
                </div>

                <div class="flex items-center justify-between py-1 px-2 rounded bg-[#171717] border border-[#262626] font-mono text-[10px] text-[#9b9a97]">
                  <span>SPA</span>
                  <span class="text-[#555]">&rarr;</span>
                  <span>Gateway</span>
                  <span class="text-[#555]">&rarr;</span>
                  <span>Delay</span>
                  <span class="text-[#555]">&rarr;</span>
                  <span class="text-[#bc8c74]">Dual DB</span>
                </div>

                <p class="text-[11px] text-[#8a8986] leading-relaxed">
                  Decoupled repository seam with MongoDB In-Memory embedded zero-config runtime and DynamoDB integration.
                </p>
              </div>

              <!-- Quick Jump Links -->
              <div class="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] space-y-2 text-xs">
                <div class="flex items-center gap-1.5 font-mono text-[11px] text-[#8a8986]">
                  <span class="text-[#e6e6e5] font-semibold">Quick References</span>
                </div>

                <div class="space-y-1.5 pt-1 text-[11px]">
                  <a
                    href="https://github.com/Ethan4582/MPloyChek"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-between text-[#8a8986] hover:text-[#ffffff] transition-colors"
                  >
                    <span>GitHub Repository</span>
                    <span>&nearr;</span>
                  </a>
                  <a
                    routerLink="/creator"
                    class="flex items-center justify-between text-[#8a8986] hover:text-[#ffffff] transition-colors"
                  >
                    <span>Creator Profile</span>
                    <span>&rarr;</span>
                  </a>
                  <button
                    type="button"
                    (click)="downloadRawSpec()"
                    class="w-full text-left flex items-center justify-between text-[#bc8c74] hover:underline cursor-pointer pt-1"
                  >
                    <span>Download Markdown (.md)</span>
                    <span>&darr;</span>
                  </button>
                </div>
              </div>

            </aside>

          </div>
        </div>

      </div>

    </div>

    <!-- Mobile Slide-out Drawer for TOC -->
    @if (isMobileTocOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end xl:hidden"
        (click)="toggleMobileToc()"
      >
        <div
          class="w-80 max-w-[85vw] h-full bg-[#1e1e1e] border-l border-[#2e2e2e] shadow-2xl p-5 flex flex-col justify-between"
          (click)="$event.stopPropagation()"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
              <span class="text-xs font-semibold uppercase tracking-wider text-[#e6e6e5]">Table of Contents</span>
              <button
                type="button"
                (click)="toggleMobileToc()"
                class="p-1 rounded-md text-[#787774] hover:text-[#ffffff] hover:bg-[#2a2a2a] transition-colors"
              >
                ✕
              </button>
            </div>

            <nav class="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
              @for (item of tocList(); track item.id) {
                <button
                  type="button"
                  (click)="scrollTo(item.id); toggleMobileToc()"
                  class="w-full text-left py-2 px-2.5 rounded-md text-xs transition-colors truncate block"
                  [class.pl-5]="item.level === 3"
                  [ngClass]="activeHeadingId() === item.id 
                    ? 'text-[#ffffff] bg-[#282828] font-medium border-l-2 border-[#bc8c74]' 
                    : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#252525] border-l-2 border-transparent'"
                >
                  {{ item.title }}
                </button>
              }
            </nav>
          </div>

          <div class="pt-4 border-t border-[#2d2d2d]">
            <button
              type="button"
              (click)="downloadRawSpec()"
              class="w-full notion-btn py-2 text-xs flex items-center justify-center gap-2 text-[#bc8c74]"
            >
              <span>Download Raw Markdown</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class DocsComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);

  rawMarkdown = signal<string>('');
  renderedHtml = signal<string>('');
  tocList = signal<TocItem[]>([]);
  activeHeadingId = signal<string>('');
  isLoading = signal<boolean>(true);
  isMobileTocOpen = signal<boolean>(false);

  private intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.fetchSystemDesign();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  toggleMobileToc(): void {
    this.isMobileTocOpen.update((v) => !v);
  }

  fetchSystemDesign(): void {
    this.isLoading.set(true);

    // Primary: fetch static asset /system-design.md
    this.http.get('/system-design.md', { responseType: 'text' }).subscribe({
      next: (markdown) => {
        if (markdown && !markdown.trim().startsWith('<!DOCTYPE html>')) {
          this.rawMarkdown.set(markdown);
          this.parseAndRender(markdown);
          this.isLoading.set(false);

          setTimeout(() => {
            this.setupIntersectionObserver();
          }, 150);
        } else {
          this.fetchFromApi();
        }
      },
      error: () => {
        this.fetchFromApi();
      },
    });
  }

  private fetchFromApi(): void {
    this.http.get<{ success: boolean; data: { markdown: string } }>('/api/docs/system-design').subscribe({
      next: (res) => {
        if (res.success && res.data?.markdown) {
          this.rawMarkdown.set(res.data.markdown);
          this.parseAndRender(res.data.markdown);
          this.isLoading.set(false);

          setTimeout(() => {
            this.setupIntersectionObserver();
          }, 150);
        } else {
          this.showFallbackDoc();
        }
      },
      error: () => {
        this.showFallbackDoc();
      },
    });
  }

  private showFallbackDoc(): void {
    const fallback = `# MPloyChek: System Design Specification

> Role-based employment verification platform that isolates sensitive records through database-level query projections, abstract repository seams, and non-blocking asynchronous latency simulation.

---

## Problem Statement

Organizations handling employee verification must give administrators and standard employees access to the same portal while enforcing strict boundaries around data visibility. Standard employees require access only to their own verification status. Sensitive attributes such as compensation grades, risk scores, and internal audit notes must never reach non-administrative users.

When access control relies on frontend filtering, the backend transmits full records over the network and leaves confidential data exposed in browser inspection tools. The system must enforce authorization and data redaction at the database layer before payloads serialize.

---

## Dual-Database Architecture Seam

The data tier is abstracted behind a generic repository interface, allowing the application to run against MongoDB, AWS DynamoDB, or an embedded zero-configuration in-memory database runtime seamlessly.

---

## Role-Based Access Control (RBAC)

- **General User**: Query projections exclude sensitive fields (\`salaryGrade\`, \`riskScore\`, \`auditNotes\`).
- **Admin**: Full visibility across all organizational employee records and user administration capabilities.

---

## Parameterized Delay Simulation

Simulates real-world network latency using the \`?delay=<ms>\` parameter across all API endpoints without blocking the Node.js event loop.`;

    this.rawMarkdown.set(fallback);
    this.parseAndRender(fallback);
    this.isLoading.set(false);
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 150);
  }

  private parseAndRender(rawText: string): void {
    const headings: TocItem[] = [];

    const renderer = new marked.Renderer();

    renderer.heading = ({ text, depth }) => {
      if (depth === 2 || depth === 3) {
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const id = cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        headings.push({
          id,
          title: cleanText,
          level: depth,
        });

        return `<h${depth} id="${id}" class="group flex items-center justify-between scroll-mt-24 border-b border-[#292929] pb-1.5 mt-8 mb-3 font-semibold text-[#ffffff]">
          <span>${text}</span>
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-[#787774] hover:text-[#bc8c74] text-xs font-mono transition-opacity ml-2">#</a>
        </h${depth}>`;
      }

      return `<h${depth} class="mt-6 mb-3 font-bold text-[#ffffff]">${text}</h${depth}>`;
    };

    renderer.table = ({ header, rows }) => {
      return `
        <div class="overflow-x-auto my-5 rounded-lg border border-[#2c2c2c] bg-[#1d1d1d]">
          <table class="min-w-full divide-y divide-[#2a2a2a] text-xs font-mono">
            <thead class="bg-[#242424] text-[#bc8c74]">${header}</thead>
            <tbody class="divide-y divide-[#262626] text-[#b0afab]">${rows}</tbody>
          </table>
        </div>
      `;
    };

    renderer.code = ({ text, lang }) => {
      const language = lang || 'text';
      return `
        <div class="my-4 rounded-lg overflow-hidden border border-[#2d2d2d] bg-[#141414]">
          <div class="px-3 py-1.5 bg-[#202020] border-b border-[#2a2a2a] flex items-center justify-between text-[11px] font-mono text-[#8a8986]">
            <span>${language}</span>
          </div>
          <pre class="p-3.5 overflow-x-auto text-xs text-[#e6e6e5] font-mono leading-relaxed"><code>${text}</code></pre>
        </div>
      `;
    };

    const parsedHtml = marked.parse(rawText, { renderer }) as string;
    this.renderedHtml.set(parsedHtml);
    this.tocList.set(headings);

    if (headings.length > 0) {
      this.activeHeadingId.set(headings[0].id);
    }
  }

  scrollTo(id: string): void {
    this.activeHeadingId.set(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const headingElements = document.querySelectorAll('h2[id], h3[id]');
    if (headingElements.length === 0) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeHeadingId.set(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headingElements.forEach((el) => {
      this.intersectionObserver?.observe(el);
    });
  }

  downloadRawSpec(): void {
    const blob = new Blob([this.rawMarkdown()], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MPloyChek-System-Design.md';
    link.click();
    URL.revokeObjectURL(url);
  }
}
