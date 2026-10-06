---
name: devtools-meme
description: Adds a styled console.log easter-egg banner ("KYA DEKH RAHE HO?") with 3D stacked extrusion text shadows to Next.js/React projects.
---

# Devtools Meme Console Banner

Injects a styled terminal/console easter-egg banner into browser DevTools on application mount.

## 1. Create Component

Create [`src/components/DevtoolsMeme.tsx`](file:///src/components/DevtoolsMeme.tsx):

```tsx
"use client";

import { useEffect } from "react";

const MONO =
  "font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;";

export default function DevtoolsMeme() {
  useEffect(() => {
    console.log(
      "%cKYA DEKH RAHE HO?\n%c%s\n%c  inspector babu, welcome to the source.\n  koi secret nahi - bas bugs, chai aur thoda sa magic.\n  meme accha laga? feedback, roast ya shoutout - sab chalega.\n%c  → DM karo ya follow: x.com/ashirwadsingh_",
      `${MONO} font-size: 58px; line-height: 1.25; font-weight: 900; letter-spacing: 4px; color: #ffd21a; text-shadow: 0 1px 0 #f7b733, 0 2px 0 #f0a020, 0 3px 0 #ef8e1b, 0 4px 0 #d97a10, 0 5px 0 #c96a10, 0 6px 0 #b45309, 0 7px 0 #92400e, 0 8px 0 #78350f, 0 10px 14px rgba(201, 106, 16, 0.6), 0 14px 24px rgba(120, 53, 15, 0.45);`,
      `${MONO} font-size: 12px; line-height: 0.6; color: #ef8e1b;`,
      "─".repeat(70),
      `${MONO} font-size: 12px; line-height: 1.8; font-weight: 500; color: #d4d4d4;`,
      `${MONO} font-size: 12px; line-height: 1.8; font-weight: 700; color: #ffd21a;`
    );
  }, []);

  return null;
}
```

## 2. Mount in Root Layout

Mount the component in `src/app/layout.tsx`:

```tsx
import DevtoolsMeme from "@/components/DevtoolsMeme";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevtoolsMeme />
      </body>
    </html>
  );
}
```

## Guidelines & Rules

- Gradient effect is faked using stacked `text-shadow` layers (Gold → Amber → Bronze → Dark shadow).
- Monospace separator rule `─` ensures clean, seamless divider formatting in console.
- Component must run as `"use client"`, return `null`, and execute once via `useEffect(..., [])`.

## Color Palette Reference

| Layer | Color Code | Description |
|---|---|---|
| Headline Text | `#ffd21a` | Top gold highlight |
| Layer 1–2 | `#f7b733` / `#f0a020` | Light amber extrusion |
| Layer 3–5 | `#ef8e1b` / `#d97a10` / `#c96a10` | Mid orange depth |
| Layer 6–8 | `#b45309` / `#92400e` / `#78350f` | Dark bronze base |
| Body Text | `#d4d4d4` | Neutral gray body |
| Action Link | `#ffd21a` | Bold gold accent |