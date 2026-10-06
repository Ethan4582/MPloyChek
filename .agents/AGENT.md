# AGENT.md

## Critical Rules
- Never rollback any commit
- Never run `pnpm build` unless required to complete the current task
- Never use `any` in TypeScript — production-grade types only
- Never hardcode SQL — always use ORM
- Never commit: `plan/`, `notes.md`, `interview.md`, `system-design.md`
- Never run `git commit` on behalf of the user — output the message only

## After Every Task
Always end with:
1. One-line summary of what was done
2. One commit message, single line, no bullets:
```
fix: handle existing document_id column gracefully
```

## Stack Defaults
> Only apply if `plan/plan.md` does not specify otherwise.

| Concern | Default |
|---|---|
| Frontend / Fullstack | Next.js + TypeScript |
| Other targets (extensions, scripts) | Best fit for the target |
| Separate backend | Only if fullstack is too complex |
| Package manager | Bun → pnpm |
| ORM | Prisma → Drizzle |
| Backend | Python FastAPI → Node.js / Hono |
| UI components | shadcn/ui (use as many as possible, write full components) |
| Go stack | Only if explicitly in plan.md |

## Source of Truth Files

**`plan/plan.md`** — read before starting any task. This is the first instruction. Defaults above are only used when it is silent on something.

**`interview.md`** — SDE-3 level interview Q&A about this project. Update only when a task produces a meaningful question worth keeping (e.g. "Why Prisma over Drizzle here?" not "What is an ORM?"). Short answers only. Grows with the project.

**`system-design.md`** — updated after architectural changes. Follow the system-design skill format.

## Code Standards
- Server-side first — data fetching, heavy logic, and DB access stay on the server
- No client-side DB calls, no connection pooling on the client
- Add DB indexes where relevant; write efficient queries — no over-fetching
- Frontend must feel fast: prefer server components, minimise client bundles, avoid unnecessary re-renders, lazy load where it makes sense
- Follow proper folder and component structure
- shadcn/ui first for all UI — write complete components
- Write code as if performance is a requirement, not an afterthought

## Testing
- Do not write or run tests after every change — only when a feature is fully implemented and ready to commit
- Write basic tests only: core logic, API routes, DB query functions — nothing exhaustive
- TypeScript/Next.js: Vitest via `pnpm vitest run`
- Python: pytest via `pytest`
- Never test against production DB — use a test DB or mock the ORM layer
- Follow the vitest skill for test structure and what to cover