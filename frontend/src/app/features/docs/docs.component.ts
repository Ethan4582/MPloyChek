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
        <!-- Workspace Header -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'System Design & Architecture' }]"
          actionLabel="Download Spec"
          (actionClicked)="downloadRawSpec()"
        ></app-workspace-header>

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
                <div class="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#8a8986] font-mono">
                  <div>Author: <span class="text-[#e6e6e5]">Ashirwad Singh</span></div>
                  <div>&bull;</div>
                  <div>Source: <span class="text-[#bc8c74]">system-design.md</span></div>
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
                  <span class="w-1.5 h-1.5 rounded-full bg-[#5cb87a]"></span>
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

                <div class="pt-2 border-t border-[#262626] space-y-1.5 text-[11px] text-[#9b9a97]">
                  <div class="flex justify-between">
                    <span>Frontend</span>
                    <span class="text-[#ffffff] font-mono">Angular 19 Signals</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Backend</span>
                    <span class="text-[#ffffff] font-mono">Node.js / Express</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Database</span>
                    <span class="text-[#bc8c74] font-mono">MongoDB / DynamoDB</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Telemetry</span>
                    <span class="text-[#5cb87a] font-mono">Real-Time ?delay=</span>
                  </div>
                </div>
              </div>

            </aside>

          </div>

        </div>

      </div>

      <!-- Mobile TOC Slide-Over Modal -->
      @if (isMobileTocOpen()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end" (click)="toggleMobileToc()">
          <div
            class="w-full max-w-xs h-full bg-[#1e1e1e] border-l border-[#2e2e2e] shadow-2xl p-5 overflow-y-auto"
            (click)="$event.stopPropagation()"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-[#2c2c2c]">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#bc8c74]"></span>
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#e6e6e5]">Table of Contents</span>
                </div>
                <button
                  type="button"
                  (click)="toggleMobileToc()"
                  class="p-1 rounded-md text-[#888885] hover:text-[#ffffff] hover:bg-[#2a2a2a]"
                >
                  ✕
                </button>
              </div>

              <nav class="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
                @for (item of tocList(); track item.id) {
                  <button
                    type="button"
                    (click)="scrollTo(item.id); toggleMobileToc()"
                    class="w-full text-left py-1.5 px-2 rounded-md text-xs transition-colors truncate block cursor-pointer"
                    [class.pl-4]="item.level === 3"
                    [ngClass]="activeHeadingId() === item.id 
                      ? 'text-[#ffffff] bg-[#292929] font-medium border-l-2 border-[#bc8c74]' 
                      : 'text-[#8a8986] hover:text-[#e6e6e5] border-l-2 border-transparent'"
                  >
                    {{ item.title }}
                  </button>
                }
              </nav>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [
    `
      ::ng-deep .markdown-body h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.025em;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #2a2a2a;
      }
      ::ng-deep .markdown-body h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #f0ede6;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        padding-bottom: 0.35rem;
        border-bottom: 1px solid #262626;
        scroll-margin-top: 5rem;
      }
      ::ng-deep .markdown-body h3 {
        font-size: 1.05rem;
        font-weight: 600;
        color: #e6e6e5;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        scroll-margin-top: 5rem;
      }
      ::ng-deep .markdown-body p {
        margin-bottom: 1rem;
        line-height: 1.7;
        color: #b5b4b0;
      }
      ::ng-deep .markdown-body code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.8125rem;
        background-color: #242424;
        color: #bc8c74;
        padding: 0.15rem 0.35rem;
        border-radius: 0.25rem;
        border: 1px solid #303030;
      }
      ::ng-deep .markdown-body pre {
        background-color: #171717;
        border: 1px solid #282828;
        border-radius: 0.5rem;
        padding: 1rem;
        overflow-x: auto;
        margin: 1.25rem 0;
      }
      ::ng-deep .markdown-body pre code {
        border: 0;
        background-color: transparent;
        padding: 0;
        color: inherit;
      }
      ::ng-deep .markdown-body table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.25rem 0;
        font-size: 0.8125rem;
        border: 1px solid #2c2c2c;
        border-radius: 0.5rem;
        overflow: hidden;
      }
      ::ng-deep .markdown-body th {
        background-color: #222222;
        padding: 0.5rem 0.75rem;
        border: 1px solid #2c2c2c;
        color: #e6e6e5;
        font-weight: 600;
        text-align: left;
      }
      ::ng-deep .markdown-body td {
        padding: 0.5rem 0.75rem;
        border: 1px solid #282828;
        color: #a8a7a3;
      }
      ::ng-deep .markdown-body tr:hover td {
        background-color: #1f1f1f;
      }
      ::ng-deep .markdown-body hr {
        border: 0;
        height: 1px;
        background-color: #292929;
        margin: 2rem 0;
      }
      ::ng-deep .markdown-body ul,
      ::ng-deep .markdown-body ol {
        margin: 0.75rem 0 1rem 1.5rem;
        color: #b5b4b0;
      }
      ::ng-deep .markdown-body li {
        margin-bottom: 0.35rem;
      }
    `,
  ],
})
export class DocsComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);

  isLoading = signal<boolean>(true);
  rawMarkdown = signal<string>('');
  renderedHtml = signal<string>('');
  tocList = signal<TocItem[]>([]);
  activeHeadingId = signal<string>('');
  isMobileTocOpen = signal<boolean>(false);

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.loadMarkdown();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleMobileToc(): void {
    this.isMobileTocOpen.update((v) => !v);
  }

  loadMarkdown(): void {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: { markdown: string } }>('/api/docs/system-design').subscribe({
      next: (res) => {
        if (res.success && res.data?.markdown) {
          this.rawMarkdown.set(res.data.markdown);
          this.parseAndRender(res.data.markdown);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.renderedHtml.set('<p class="text-red-400">Failed to load system-design.md from backend.</p>');
      },
    });
  }

  private parseAndRender(md: string): void {
    const html = marked.parse(md) as string;
    this.renderedHtml.set(html);

    // After DOM update, assign IDs to headings and set up scroll spy
    setTimeout(() => {
      this.attachHeadingsAndInitSpy();
    }, 100);
  }

  private attachHeadingsAndInitSpy(): void {
    const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
    const toc: TocItem[] = [];
    const usedSlugs = new Set<string>();

    headings.forEach((heading) => {
      const text = (heading.textContent || '').trim();
      let slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!slug) slug = 'section';
      let uniqueSlug = slug;
      let counter = 1;
      while (usedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter++}`;
      }
      usedSlugs.add(uniqueSlug);

      heading.id = uniqueSlug;
      toc.push({
        id: uniqueSlug,
        title: text,
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });

    this.tocList.set(toc);
    if (toc.length > 0 && !this.activeHeadingId()) {
      this.activeHeadingId.set(toc[0].id);
    }

    this.setupScrollSpy();
  }

  private setupScrollSpy(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible && visible.target.id) {
          this.activeHeadingId.set(visible.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );

    const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
    headings.forEach((h) => this.observer?.observe(h));
  }

  scrollTo(id: string): void {
    this.activeHeadingId.set(id);
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  downloadRawSpec(): void {
    const blob = new Blob([this.rawMarkdown()], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-design.md';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
