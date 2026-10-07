import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, WorkspaceHeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex bg-[#191919] text-[#e6e6e5] w-full">
      
      <!-- Render Sidebar if authenticated -->
      @if (authService.isAuthenticated()) {
        <app-sidebar></app-sidebar>
      }

      <!-- Main Content Area -->
      <div
        class="flex-1 flex flex-col min-w-0 transition-all duration-200"
        [class.md:pl-64]="authService.isAuthenticated()"
      >
        <!-- Top Workspace Header with Breadcrumb -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'System Architecture & Engineering Thought Process' }]"
          actionLabel="Raw Spec"
          actionIcon="📄"
          (actionClicked)="downloadRawSpec()"
          [showRefresh]="true"
          (refreshClicked)="loadMarkdown()"
        ></app-workspace-header>

        <!-- Docs Layout Container -->
        <div class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          
          <!-- Sticky Mini Table of Contents (Desktop Sidebar) -->
          <aside class="hidden lg:block w-64 shrink-0">
            <div class="sticky top-20 p-4 rounded-xl bg-[#202020] border border-[#2f2f2f] space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
                <span class="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono">
                  Table of Contents
                </span>
                <span class="text-[10px] text-[#7da0ca] font-mono">{{ tocList().length }} Sections</span>
              </div>

              <nav class="space-y-1 text-xs max-h-[70vh] overflow-y-auto pr-1">
                @for (item of tocList(); track item.id) {
                  <button
                    type="button"
                    (click)="scrollTo(item.id)"
                    class="w-full text-left py-1 px-2 rounded transition-colors truncate block select-none"
                    [ngClass]="
                      activeHeadingId() === item.id
                        ? 'bg-[#2f2f2f] text-[#bc8c74] font-medium border-l-2 border-[#bc8c74]'
                        : 'text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#252525]'
                    "
                    [class.pl-4]="item.level === 3"
                    [title]="item.title"
                  >
                    {{ item.title }}
                  </button>
                }
              </nav>

              <div class="pt-2 border-t border-[#2d2d2d] text-[10px] text-[#6b6b68] flex items-center justify-between">
                <span>Auto-synced with system-design.md</span>
              </div>
            </div>
          </aside>

          <!-- Main Document Content -->
          <main class="flex-1 min-w-0">
            
            <!-- Mobile TOC Accordion -->
            <div class="lg:hidden mb-6 p-3 rounded-lg bg-[#202020] border border-[#2f2f2f]">
              <button
                type="button"
                (click)="toggleMobileToc()"
                class="w-full flex items-center justify-between text-xs font-medium text-[#e6e6e5]"
              >
                <span class="flex items-center gap-2">
                  <span>📑</span>
                  <span>Table of Contents ({{ tocList().length }} Sections)</span>
                </span>
                <span>{{ isMobileTocOpen() ? '▲' : '▼' }}</span>
              </button>

              @if (isMobileTocOpen()) {
                <div class="mt-3 pt-3 border-t border-[#2d2d2d] space-y-1 max-h-56 overflow-y-auto">
                  @for (item of tocList(); track item.id) {
                    <button
                      type="button"
                      (click)="scrollTo(item.id); isMobileTocOpen.set(false)"
                      class="w-full text-left py-1 px-2 text-xs rounded text-[#9b9a97] hover:text-[#ffffff] hover:bg-[#282828] truncate block"
                    >
                      {{ item.title }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Loading State -->
            @if (isLoading()) {
              <div class="p-12 text-center space-y-3">
                <div class="inline-block animate-spin text-2xl">⏳</div>
                <p class="text-xs text-[#9b9a97]">Rendering System Architecture Markdown...</p>
              </div>
            } @else {
              <!-- Rendered Markdown HTML -->
              <article
                class="markdown-body text-[#e6e6e5] text-sm leading-relaxed"
                [innerHTML]="renderedHtml()"
              ></article>
            }

          </main>

        </div>

      </div>

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
        color: #b5b4b0;
        font-size: 0.875rem;
      }
      ::ng-deep .markdown-body blockquote {
        padding: 0.65rem 1rem;
        margin: 1rem 0;
        background-color: #222222;
        border-left: 3px solid #bc8c74;
        border-radius: 0 0.5rem 0.5rem 0;
        color: #d1cfc9;
        font-size: 0.875rem;
      }
      ::ng-deep .markdown-body pre {
        background-color: #171717;
        border: 1px solid #2e2e2e;
        border-radius: 0.5rem;
        padding: 1rem;
        overflow-x: auto;
        margin: 1rem 0;
        font-family: monospace;
        font-size: 0.8125rem;
        color: #e0e0e0;
      }
      ::ng-deep .markdown-body code {
        background-color: #262626;
        padding: 0.15rem 0.35rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.8125rem;
        color: #bc8c74;
      }
      ::ng-deep .markdown-body pre code {
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
export class DocsComponent implements OnInit {
  private http = inject(HttpClient);
  authService = inject(AuthService);

  isLoading = signal<boolean>(true);
  rawMarkdown = signal<string>('');
  renderedHtml = signal<string>('');
  tocList = signal<TocItem[]>([]);
  activeHeadingId = signal<string>('');
  isMobileTocOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadMarkdown();
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
    const toc: TocItem[] = [];
    
    // Custom marked renderer to generate anchors on headings
    const renderer = new marked.Renderer();
    renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
      const cleanText = text.replace(/<[^>]*>/g, '');
      const id = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (depth === 2 || depth === 3) {
        toc.push({ id, title: cleanText, level: depth });
      }

      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    marked.setOptions({ renderer });
    const html = marked.parse(md) as string;
    this.renderedHtml.set(html);
    this.tocList.set(toc);

    if (toc.length > 0) {
      this.activeHeadingId.set(toc[0].id);
    }
  }

  scrollTo(id: string): void {
    this.activeHeadingId.set(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleMobileToc(): void {
    this.isMobileTocOpen.update((v) => !v);
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
