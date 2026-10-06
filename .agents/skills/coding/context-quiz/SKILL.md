---
name: context-quiz
description: Generate a short quiz grounded in recent git commits and diffs to test understanding of recent codebase changes.
disable-model-invocation: true
---

# Context Quiz

Generates a thorough quiz that tests whether the user still holds full project context —
architecture, decisions, data flow, implementation details, and reasoning. Not just recent
diffs. The whole picture.

## Step 1: Gather context

Read everything available, in priority order:
- `memory.context.md` — project memory and decisions
- `plan/plan.md` — original plan and stages
- `system-design.md` — architecture
- `interview.md` — existing Q&A (don't duplicate these)
- Git history: `git log --oneline -20`, `git diff HEAD~5 --stat`, recent diffs scoped to changed files
- Directory structure and key source files

Use all of it. Questions should span the full project, not just recent commits.

## Step 2: Generate the quiz

**Question count:** 15–40 depending on project size and context depth. More context = more questions. Don't pad, don't cap artificially.

**Question types:**
- Multiple-choice (3-4 options) — for concrete facts, architecture choices, tech decisions
- Short-answer — for reasoning, trade-offs, data flow, "why X over Y"
- Scenario — "if X changes, what breaks and why?" (use sparingly, only for complex projects)

**Coverage — draw from all of these, weighted by what the project actually has:**
- Architecture and component relationships
- Data flow end-to-end
- Key technical decisions and the reasoning behind them
- Database schema, indexes, ORM choices
- API design and contracts
- State management and server/client boundaries
- Hard problems solved and how
- Trade-offs made and what was given up
- What would break if X changed

**Each question must be specific to this project.** No generic questions ("what is a server component?"). Always tie to real names, real files, real decisions.

**Hints:** every question gets a short hint — one line that nudges without giving it away. E.g. "Think about where the session token is validated" or "Check what the ORM schema says about this relation."

## Step 3: Write to quiz.md

Do not present the quiz in chat. Write it to `quiz.md` in the project root in this exact format:

```markdown
# Context Quiz

## Q1: [question title]
**Question:** [full question text]

**Hint:** [one-line nudge]

**Your answer:**
_fill this in_

**Correct answer:** 
_graded_

---

## Q2: ...
```

Leave "Correct answer" as `_graded_` — the user fills "Your answer", then asks for grading.

Tell the user: "`quiz.md` is ready. Fill in your answers under each question, then ask me to grade it."

## Step 4: Grading (when user asks to grade)

Read `quiz.md`. For each question:
- Keep the user's answer visible exactly as written
- Fill in the correct answer below it
- Add a one-line note only if the user's answer was partially right or missed something specific

End with a short summary — strong areas vs. gaps worth revisiting. No score, no percentage.

Rewrite `quiz.md` with all answers filled in so the user has a single file showing questions, hints, their answer, and the correct answer side by side.
