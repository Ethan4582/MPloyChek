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
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full overflow-x-hidden">
      
      <!-- Collapsible Vertical Sidebar (Shown when logged in) -->
      @if (authService.isAuthenticated()) {
        <app-sidebar></app-sidebar>
      }

      <!-- Main Content Layout Container -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-60]=\"authService.isAuthenticated() && sidebarService.isOpen()\"
        [class.md:pl-0]=\"!authService.isAuthenticated() || !sidebarService.isOpen()\"
      >
        <!-- Workspace Header (Shown when authenticated) -->
        @if (authService.isAuthenticated()) {
          <app-workspace-header
            [breadcrumbs]=\"[{ label: 'System Design & Architecture' }]\"
            actionLabel=\"Download Spec\"
            (actionClicked)=\"downloadRawSpec()\"
          ></app-workspace-header>
        }

        <!-- Main Blog / Documentation Two-Column View -->
        <div class=\"w-full px-4 sm:px-6 lg:px-8 py-8\">
          
          <!-- Outer Flex Container: Markdown Content (Left) + Sticky TOC (Right) -->
          <div class=\"flex items-start justify-center gap-10 max-w-7xl mx-auto\">
            
            <!-- Left / Center: Main Article Content -->
            <main class=\"flex-1 max-w-4xl min-w-0 space-y-6\">
              
              <!-- Document Title & Meta Header -->
              <div class=\"space-y-2 pb-5 border-b border-[#2a2a2a]\">
                <h1 class=\"text-2xl sm:text-3xl font-bold text-[#ffffff] tracking-tight\">
                  System Design Specification
                </h1>
                
                <p class=\"text-xs sm:text-sm text-[#9b9a97] leading-relaxed\">
                  Technical architecture, dual-database seam, field-level query projection RBAC, and parameterized non-blocking delay engineering.
                </p>

                <!-- Document Author Strip -->
                <div class=\"flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#8a8986] font-mono\">
                  <div class=\"flex flex-wrap items-center gap-3\">
                    @if (!authService.isAuthenticated()) {
                      <a routerLink=\"/\" class=\"text-[#8a8986] hover:text-[#ffffff] transition-colors flex items-center gap-1 font-sans\">
                        <span>&larr;</span>
                        <span>Home</span>
                      </a>
                      <div>&bull;</div>
                    }
                    <div>Author: <span class=\"text-[#e6e6e5]\">Ashirwad Singh</span></div>
                    <div>&bull;</div>
                    <div>Source: <span class=\"text-[#bc8c74]\">system-design.md</span></div>
                  </div>

                  @if (!authService.isAuthenticated()) {
                    <button
                      type=\"button\"
                      (click)=\"downloadRawSpec()\"
                      class=\"notion-btn text-xs py-1 px-2.5 flex items-center gap-1.5 text-[#e6e6e5] cursor-pointer\"
                    >
                      <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
                        <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />
                        <polyline points=\"7 10 12 15 17 10\" />
                        <line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\" />
                      </svg>
                      <span>Download Spec</span>
                    </button>
                  }
                </div>

                <!-- Mobile Floating TOC Button (Small Screens Only) -->
                <div class=\"block xl:hidden pt-2\">
                  <button
                    type=\"button\"
                    (click)=\"toggleMobileToc()\"
                    class=\"notion-btn text-xs py-1.5 px-3 flex items-center gap-2 text-[#bc8c74]\"
                  >
                    <svg class=\"w-3.5 h-3.5\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">
                      <line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"></line>
                      <line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"></line>
                      <line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"></line>
                    </svg>
                    <span>Jump to Section ({{ tocList().length }})</span>
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              @if (isLoading()) {
                <div class=\"py-24 text-center space-y-3\">
                  <div class=\"inline-block animate-spin text-2xl\">⏳</div>
                  <div class=\"text-sm text-[#8a8986]\">Rendering system architecture documentation...</div>
                </div>
              } @else {
                <!-- Rendered Markdown Body -->
                <article
                  class=\"markdown-body text-xs sm:text-sm leading-relaxed text-[#c7c6c1]\"
                  [innerHTML]=\"renderedHtml()\"
                ></article>
              }

            </main>

            <!-- Right: Sticky Desktop Table of Contents (Single Clean Card, No Duplicate Scrollbars) -->
            <aside class=\"hidden xl:block w-72 shrink-0 sticky top-20 select-none\">
              
              <div class=\"p-4 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-3 shadow-xs\">
                
                <div class=\"flex items-center justify-between pb-2 border-b border-[#2b2b2b]\">
                  <span class=\"text-[11px] font-semibold uppercase tracking-wider text-[#e6e6e5]\">
                    On This Page
                  </span>
                  <span class=\"text-[10px] font-mono text-[#8a8986]\">{{ tocList().length }} Sections</span>
                </div>

                <!-- Scrollable TOC Navigation Links with completely hidden scrollbars -->
                <nav class=\"space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar pr-0.5\">
                  @for (item of tocList(); track item.id) {
                    <button
                      type=\"button\"
                      (click)=\"scrollTo(item.id)\"
                      class=\"w-full text-left py-1.5 px-2 rounded-md text-[11px] transition-all truncate block cursor-pointer\"
                      [class.pl-4]=\"item.level === 3\"
                      [ngClass]=\"activeHeadingId() === item.id 
                        ? 'text-[#ffffff] bg-[#292929] font-medium border-l-2 border-[#bc8c74]' 
                        : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#242424] border-l-2 border-transparent'\"
                      [title]=\"item.title\"
                    >
                      {{ item.title }}
                    </button>
                  }
                </nav>
              </div>

            </aside>

          </div>
        </div>

      </div>

    </div>

    <!-- Mobile Slide-out Drawer for TOC -->
    @if (isMobileTocOpen()) {
      <div
        class=\"fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end xl:hidden\"
        (click)=\"toggleMobileToc()\"
      >
        <div
          class=\"w-80 max-w-[85vw] h-full bg-[#1e1e1e] border-l border-[#2e2e2e] shadow-2xl p-5 flex flex-col justify-between\"
          (click)=\"$event.stopPropagation()\"
        >
          <div class=\"space-y-4\">
            <div class=\"flex items-center justify-between pb-3 border-b border-[#2d2d2d]\">
              <span class=\"text-xs font-semibold uppercase tracking-wider text-[#e6e6e5]\">Table of Contents</span>
              <button
                type=\"button\"
                (click)=\"toggleMobileToc()\"
                class=\"p-1 rounded-md text-[#787774] hover:text-[#ffffff] hover:bg-[#2a2a2a] transition-colors cursor-pointer\"
              >
                ✕
              </button>
            </div>

            <nav class=\"space-y-1 max-h-[75vh] overflow-y-auto no-scrollbar pr-1\">
              @for (item of tocList(); track item.id) {
                <button
                  type=\"button\"
                  (click)=\"scrollTo(item.id); toggleMobileToc()\"
                  class=\"w-full text-left py-2 px-2.5 rounded-md text-xs transition-colors truncate block cursor-pointer\"
                  [class.pl-5]=\"item.level === 3\"
                  [ngClass]=\"activeHeadingId() === item.id 
                    ? 'text-[#ffffff] bg-[#282828] font-medium border-l-2 border-[#bc8c74]' 
                    : 'text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#252525] border-l-2 border-transparent'\"
                >
                  {{ item.title }}
                </button>
              }
            </nav>
          </div>

          <div class=\"pt-4 border-t border-[#2d2d2d]\">
            <button
              type=\"button\"
              (click)=\"downloadRawSpec()\"
              class=\"w-full notion-btn py-2 text-xs flex items-center justify-center gap-2 text-[#bc8c74] cursor-pointer\"
            >
              <span>Download Raw Markdown</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      ::ng-deep .markdown-body h2 {
        font-size: 1.15rem;
        font-weight: 600;
        color: #ffffff;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        padding-bottom: 0.35rem;
        border-bottom: 1px solid #262626;
        scroll-margin-top: 5rem;
      }
      ::ng-deep .markdown-body h3 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #e6e6e5;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        scroll-margin-top: 5rem;
      }
      ::ng-deep .markdown-body p {
        margin-bottom: 0.85rem;
        line-height: 1.7;
        color: #a8a7a3;
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
      }
      ::ng-deep .markdown-body th {
        background-color: #222222;
        padding: 0.5rem 0.75rem;
        border: 1px solid #2c2c2c;
        color: #bc8c74;
        font-weight: 600;
        text-align: left;
      }
      ::ng-deep .markdown-body td {
        padding: 0.5rem 0.75rem;
        border: 1px solid #262626;
        color: #a8a7a3;
      }
      ::ng-deep .markdown-body tr:hover td {
        background-color: #1f1f1f;
      }
      ::ng-deep .markdown-body hr {
        border: 0;
        height: 1px;
        background-color: #262626;
        margin: 1.75rem 0;
      }
      ::ng-deep .markdown-body ul,
      ::ng-deep .markdown-body ol {
        margin: 0.5rem 0 1rem 1.25rem;
        color: #a8a7a3;
      }
      ::ng-deep .markdown-body li {
        margin-bottom: 0.35rem;
        line-height: 1.6;
      }
      ::ng-deep .markdown-body blockquote {
        margin: 1rem 0;
        padding: 0.75rem 1rem;
        background-color: #202020;
        border-left: 2px solid #bc8c74;
        border-radius: 0 0.5rem 0.5rem 0;
        color: #d1cfc9;
      }
    `,
  ],
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

    this.http.get('/system-design.md', { responseType: 'text' }).subscribe({
      next: (markdown) => {
        if (markdown && markdown.length > 50) {
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
    const fallback = `## Problem statement\n\nOrganizations require role-segregated access to employment verification records. Standard employees must only view their own records, while administrators require organization-wide visibility.\n\nClient-side filtering is insecure because full records remain inspectable in network payloads. The platform enforces field-level query redaction at the database layer, executes zero-config with embedded storage, and supports non-blocking simulated latency for async state validation.`;

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
      if (depth === 1) {
        // Suppress duplicate H1 document title inside markdown body
        return '';
      }

      if (depth === 2 || depth === 3) {
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const id = cleanText
          .toLowerCase()
          .replace(/[^\\w\\s-]/g, '')
          .replace(/\\s+/g, '-');

        headings.push({
          id,
          title: cleanText,
          level: depth,
        });

        if (depth === 2) {
          return `<h2 id=\"${id}\" class=\"group flex items-center justify-between scroll-mt-24 border-b border-[#262626] pb-2 mt-8 mb-3 text-base font-semibold text-[#ffffff]\">
            <span>${text}</span>
            <a href=\"#${id}\" class=\"opacity-0 group-hover:opacity-100 text-[#787774] hover:text-[#bc8c74] text-xs font-mono transition-opacity ml-2\">#</a>
          </h2>`;
        }

        return `<h3 id=\"${id}\" class=\"scroll-mt-24 mt-6 mb-2 text-xs font-semibold text-[#e6e6e5]\">
          ${text}
        </h3>`;
      }

      return `<h${depth} class=\"mt-5 mb-2 font-bold text-[#ffffff]\">${text}</h${depth}>`;
    };

    renderer.blockquote = ({ text }) => {
      return `<blockquote class=\"my-4 p-3.5 rounded-lg bg-[#202020] border-l-2 border-[#bc8c74] text-xs text-[#cfceca] leading-relaxed\">${text}</blockquote>`;
    };

    renderer.table = ({ header, rows }) => {
      return `
        <div class=\"overflow-x-auto no-scrollbar my-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]\">
          <table class=\"min-w-full divide-y divide-[#262626] text-xs font-mono\">
            <thead class=\"bg-[#222222] text-[#bc8c74]\">${header}</thead>
            <tbody class=\"divide-y divide-[#242424] text-[#a8a7a3]\">${rows}</tbody>
          </table>
        </div>
      `;
    };

    renderer.code = ({ text, lang }) => {
      const language = lang || 'text';
      return `
        <div class=\"my-4 rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#141414]\">
          <div class=\"px-3.5 py-1.5 bg-[#1e1e1e] border-b border-[#262626] flex items-center justify-between text-[11px] font-mono text-[#8a8986]\">
            <span>${language}</span>
          </div>
          <pre class=\"p-3.5 overflow-x-auto no-scrollbar text-xs text-[#e6e6e5] font-mono leading-relaxed\"><code>${text}</code></pre>
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
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
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
