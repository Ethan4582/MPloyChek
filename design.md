# Design System & UI Specification

> **Agnostic UI / UX Specification**: Portable design tokens, dark palette, Notion-inspired minimalism, typography standards, and article documentation layout for Next.js, Tailwind CSS, or any web framework.

---

## 1. Color Palette & Semantic Tokens

The design is built on a high-contrast dark theme inspired by Notion and Linear. It uses warm neutral grays, avoids pure pitch black in foreground elements, and strictly avoids generic saturated colors (such as harsh blues or standard purples).

### Core Surface & Canvas Colors

| Token Name | HEX Code | Tailwind Class / Variable | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#191919` | `bg-[#191919]` | Root viewport background. Low eye-strain matte dark canvas. |
| **Surface / Card** | `#202020` | `bg-[#202020]` | Main content cards, modals, table rows, and sticky panels. |
| **Surface Elevated** | `#242424` | `bg-[#242424]` | Hover states, active dropdown items, elevated popovers. |
| **Sidebar / Drawer** | `#1b1b1b` | `bg-[#1b1b1b]` | Collapsible navigation sidebars, drawer menus. |
| **Code Block Canvas** | `#141414` | `bg-[#141414]` | Monospace code block bodies and preformatted text. |

### Border & Divider Tokens

| Token Name | HEX Code | Tailwind Class / Variable | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Border Subtle** | `#252525` | `border-[#252525]` | Table row dividers, inner item dividers. |
| **Border Default** | `#2a2a2a` | `border-[#2a2a2a]` | Default container borders, card outlines. |
| **Border Strong** | `#333333` | `border-[#333333]` | Interactive elements, active card states, button borders. |
| **Border Hover** | `#444444` | `border-[#444444]` | Hovered buttons, focused inputs. |

### Text & Typography Hierarchy

| Token Name | HEX Code | Tailwind Class / Variable | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `#ffffff` | `text-[#ffffff]` | Main headings (H1, H2), active menu text, metric numbers. |
| **Text Body** | `#e6e6e5` | `text-[#e6e6e5]` | Standard body paragraphs, readable documentation prose. |
| **Text Secondary** | `#9b9a97` | `text-[#9b9a97]` | Subheadings, section descriptions, table cell sub-labels. |
| **Text Muted / Mono**| `#8a8986` | `text-[#8a8986]` | Metadata, timestamps, breadcrumbs, tags, secondary labels. |
| **Text Placeholder** | `#5a5a58` | `text-[#5a5a58]` | Form placeholder text, inactive icons. |

### Accent Colors (No Saturated Purples)

| Role | Accent HEX | Background Tint | Border Tint | Semantic Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand / Bronze** | `#bc8c74` | `#332924` | `#48372f` | Primary branding, documentation callouts, admin badges, active TOC item indicator. |
| **Success / Verified** | `#5cb87a` | `#1f3328` | `#274433` | Verified status, live metrics indicator, 2xx HTTP codes. |
| **Info / Blue** | `#529cca` | `#1e2d3d` | `#273c52` | General User clearance, GET methods, documentation links. |
| **Warning / Amber** | `#d8a33f` | `#37321e` | `#4a4224` | Pending review status, warning badges. |
| **Danger / Red** | `#e05757` | `#3b2222` | `#522f2f` | Delete actions, flagged records, 5xx HTTP codes. |

---

## 2. Notion-Style UI Principles

1. **Subtle Elevation, Zero Heavy Shadows**:
   * Never use heavy drop shadows (`shadow-2xl` with high opacity).
   * Rely on thin `1px` borders (`#2a2a2a` to `#2f2f2f`) and distinct background surfaces (`#191919` vs `#202020`).
2. **Typography First**:
   * Font stack: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
   * Monospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` for IDs, badges, logs, and metrics.
3. **Ghost & Matte Interactive Elements**:
   * Default buttons use dark matte surfaces with crisp borders (`bg-[#252525] hover:bg-[#2e2e2e] border-[#2f2f2f]`).
   * Primary emphasis buttons invert contrast: solid white background with near-black text (`bg-[#ffffff] text-[#141414] font-semibold`).
4. **Desaturated Status Badges**:
   * Badges must never use high-saturation neon colors.
   * Format: Dark translucent container (`bg-[#1e2d3d]`) + matching soft text (`text-[#529cca]`) + matching 1px border (`border-[#273c52]`).
5. **Clean Scrollbars**:
   * Horizontal scrollbars on code and tables must be concealed with `.no-scrollbar` (`scrollbar-width: none`).
   * Vertical scrollbars use an ultra-thin 4px `#2a2a2a` track with `#3a3a3a` thumb on hover.

---

## 3. Article & Documentation Layout (Blog / Docs Template)

This layout pattern provides readability and sticky navigation across both desktop and mobile viewports.

### Architectural Layout Structure

```
+-----------------------------------------------------------------------------------------+
| Top Sticky Workspace Header (Breadcrumbs / Sidebar Toggle / Action / Profile)           |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|       +---------------------------------------------+     +---------------------+       |
|       | Main Article Content (Scrollable)           |     | On This Page (TOC)  |       |
|       |                                             |     | (Sticky Top-16)     |       |
|       | * Document Header & Author Strip            |     |                     |       |
|       | * Section H2 (with hover anchor link)       |     | * Problem Statement |       |
|       | * Clean Prose (line-height: 1.7)            |     | * High-Level Design |       |
|       | * Callout Blockquote (Bronze accent)        |     | * API Endpoints     |       |
|       | * Monospace Code Blocks with header label   |     | * Key Decisions     |       |
|       | * Contained Data Tables (Scrolls within)    |     +---------------------+       |
|       |                                             |                                   |
|       +---------------------------------------------+                                   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### Layout Specifications

1. **Outer Container**:
   * `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
   * Flex layout: `flex items-start justify-center gap-10`.
   * Crucial rule for sticky functionality: **Do not set `overflow: hidden` on parent layout wrappers**, as this disables browser `position: sticky`.

2. **Main Article Column (Center / Left)**:
   * Width: `flex-1 max-w-4xl min-w-0 space-y-6`.
   * `min-w-0` prevents wide code blocks or tables from blowing out the flex grid.

3. **Sticky Table of Contents (Right Column)**:
   * Width: `w-64` or `w-72 shrink-0`.
   * Classes: `hidden xl:block sticky top-16 self-start z-20 select-none`.
   * Container Card: `p-4 rounded-xl bg-[#202020] border border-[#2c2c2c] space-y-3`.
   * Navigation List:
     * Constrained height: `max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar`.
     * Active section item indicator: `text-[#ffffff] bg-[#292929] font-medium border-l-2 border-[#bc8c74]`.
     * Inactive item: `text-[#8a8986] hover:text-[#e6e6e5] hover:bg-[#242424] border-l-2 border-transparent`.
     * H3 sub-items: Indented with `pl-4`.

4. **Mobile Responsiveness**:
   * On viewports under `1280px` (`xl`), the right TOC column is hidden (`hidden xl:block`).
   * A compact button (`Jump to Section (N)`) renders at the top of the article.
   * Clicking the button opens a clean slide-out drawer from the right with the full TOC list.

---

## 4. Typography & Markdown Content Formatting Rules

When rendering technical articles, documentation, or blog posts, format components using these rules:

### Headings
* **H1 (Document Title)**: Rendered once in the header layout (`text-2xl sm:text-3xl font-bold text-[#ffffff] tracking-tight pb-3`). Body markdown H1 tags should be omitted to avoid duplicate headers.
* **H2 (Major Section)**:
  * Font size: `1.15rem` (`text-base sm:text-lg`), font-weight `600`, color `#ffffff`.
  * Spacing: `margin-top: 2rem; margin-bottom: 0.75rem; padding-bottom: 0.35rem`.
  * Border: `border-bottom: 1px solid #262626`.
  * Anchor link `#` visible on group hover (`opacity-0 group-hover:opacity-100 text-[#787774] hover:text-[#bc8c74]`).
  * Scroll target offset: `scroll-margin-top: 5rem`.
* **H3 (Sub-section)**:
  * Font size: `0.95rem`, font-weight `600`, color `#e6e6e5`.
  * Spacing: `margin-top: 1.5rem; margin-bottom: 0.5rem`.

### Paragraphs & Body Text
* Color: `#a8a7a3` to `#c7c6c1`.
* Line height: `1.7` (`leading-relaxed`).
* Spacing: `margin-bottom: 0.85rem`.
* Links: Inline text links use `color: #bc8c74` or `color: #529cca` with subtle hover underlines.

### Callout Blockquotes
* Background: `#202020`.
* Accent Border: `border-left: 2px solid #bc8c74`.
* Border radius: `rounded-r-lg`.
* Padding: `p-3.5 sm:p-4`.
* Text color: `#cfceca`, font size `0.875rem` (`text-xs sm:text-sm`).

### Code Blocks
* Wrapper Card: `rounded-lg border border-[#2a2a2a] bg-[#141414] overflow-hidden my-4`.
* Header Tab: `px-3.5 py-1.5 bg-[#1e1e1e] border-b border-[#262626] text-[11px] font-mono text-[#8a8986] flex justify-between`. Shows language tag (e.g., `typescript`, `json`).
* Code Area: `p-3.5 overflow-x-auto no-scrollbar font-mono text-xs text-[#e6e6e5] leading-relaxed`.
* Inline Code: `bg-[#242424] text-[#bc8c74] border border-[#303030] px-1 py-0.5 rounded text-[12px] font-mono`.

### Data Tables
* Container: `overflow-x-auto no-scrollbar my-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]`.
* Table Header (`th`): `bg-[#222222] text-[#bc8c74] font-semibold text-left p-2.5 sm:p-3 border-b border-[#2a2a2a]`.
* Table Body (`td`): `p-2.5 sm:p-3 border-b border-[#242424] text-[#a8a7a3] text-xs font-mono`.
* Row Hover: `hover:bg-[#1f1f1f] transition-colors`.

---

## 5. Next.js / Tailwind CSS Configuration Snippet

For using this system in Next.js with Tailwind CSS (`tailwind.config.ts`):

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#191919',
        surface: {
          DEFAULT: '#202020',
          elevated: '#242424',
          subtle: '#1b1b1b',
        },
        border: {
          subtle: '#252525',
          DEFAULT: '#2a2a2a',
          strong: '#333333',
        },
        text: {
          primary: '#ffffff',
          body: '#e6e6e5',
          secondary: '#9b9a97',
          muted: '#8a8986',
        },
        accent: {
          bronze: '#bc8c74',
          green: '#5cb87a',
          blue: '#529cca',
          amber: '#d8a33f',
          red: '#e05757',
        },
      },
    },
  },
};
export default config;
```
