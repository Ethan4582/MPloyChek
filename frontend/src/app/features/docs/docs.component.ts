import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

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
        [class.md:pl-60]="authService.isAuthenticated() && sidebarService.isOpen()"
        [class.md:pl-0]="!authService.isAuthenticated() || !sidebarService.isOpen()"
      >
        <!-- Top Workspace Header with Breadcrumb -->
        <app-workspace-header
          [breadcrumbs]="[{ label: 'System Design & Architecture' }]"
          actionLabel="Raw Spec"
          actionIcon="📄"
          (actionClicked)="downloadRawSpec()"
          [showRefresh]="true"
          (refreshClicked)="loadMarkdown()"
        ></app-workspace-header>

        <!-- Docs Layout Container -->
        <div class="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <!-- Header Row with Title & Compact Top-Right Architecture/Table Preview -->
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-4 border-b border-[#262626]">
            <div>
              <h1 class="text-xl font-bold text-[#ffffff] tracking-tight">System Design Specification</h1>
              <p class="text-xs text-[#9b9a97] mt-0.5">
                Technical architecture, database query projections, and latency simulation.
              </p>
            </div>

            <!-- Compact Top-Right Architecture & Table Preview -->
            <div class="shrink-0 w-full lg:w-72 p-2.5 rounded-lg bg-[#202020] border border-[#2c2c2c] text-xs space-y-2 shadow-sm">
              <div class="flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-1.5 font-mono text-[#8a8986]">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#5cb87a]"></span>
                  <span class="text-[#e6e6e5] font-semibold">Dual-Mode Architecture</span>
                </div>
                <button
                  type="button"
                  (click)="toggleTocDropdown()"
                  class="text-[10px] font-mono text-[#bc8c74] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{{ tocList().length }} Sections</span>
                  <span>{{ isTocDropdownOpen() ? '▲' : '▼' }}</span>
                </button>
              </div>

              <!-- Compact Architecture Pipeline Preview -->
              <div class="flex items-center justify-between py-1 px-2 rounded bg-[#171717] border border-[#262626] font-mono text-[10px] text-[#9b9a97]">
                <span>SPA</span>
                <span class="text-[#555]">→</span>
                <span>Gateway</span>
                <span class="text-[#555]">→</span>
                <span>Delay</span>
                <span class="text-[#555]">→</span>
                <span class="text-[#bc8c74]">Dual DB</span>
              </div>

              <!-- Collapsible Section Outline -->
              @if (isTocDropdownOpen()) {
                <div class="pt-2 border-t border-[#2a2a2a] max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  @for (item of tocList(); track item.id) {
                    <button
                      type="button"
                      (click)="scrollTo(item.id)"
                      class="w-full text-left py-1 px-1.5 rounded text-[11px] text-[#8a8986] hover:text-[#ffffff] hover:bg-[#282828] truncate block transition-colors"
                      [class.pl-3]="item.level === 3"
                      [title]="item.title"
                    >
                      {{ item.title }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Main Document Content -->
          <main class="w-full min-w-0">
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
  sidebarService = inject(SidebarService);

  isLoading = signal<boolean>(true);
  rawMarkdown = signal<string>('');
  renderedHtml = signal<string>('');
  tocList = signal<TocItem[]>([]);
  activeHeadingId = signal<string>('');
  isTocDropdownOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadMarkdown();
  }

  toggleTocDropdown(): void {
    this.isTocDropdownOpen.update((v) => !v);
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
