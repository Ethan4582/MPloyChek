---
name: project-interview-prep
description: Generate project-grounded technical or behavioral interview questions to rehearse explaining a codebase.
disable-model-invocation: true
---

# Project Interview Prep

Generates interview-style questions grounded in a real project so the user can rehearse
explaining it — either the technical depth (architecture, trade-offs, implementation) or
the non-technical story (purpose, value, decisions, outcomes, STAR-style delivery).

## Step 1: Pick the mode

If the user hasn't already said which, ask once, briefly:
- **Technical** — architecture, implementation, trade-offs, debugging, design reasoning
- **Non-Technical** — behavioral/business framing, STAR-style storytelling

## Step 2: Gather full project context

Don't generate questions from assumptions — read the actual project:

```bash
git log --oneline -30                # history of what was built and when
git diff <early-commit>..HEAD --stat # overall scope/shape of the work
find . -iname "README*" -o -iname "*.md" | grep -v node_modules
```

Also read, if present: README, architecture docs, ADRs/`docs/decisions`, design docs, plan
or roadmap files, config files (reveal real stack choices), and the directory structure
itself (reveals module boundaries and patterns). For a large repo, prioritize breadth over
reading every file: skim structure and docs first, then go deep on the 3-5 most significant
or complex modules/commits rather than reading everything uniformly.

Identify, concretely:
- What the project does and for whom (business/user value)
- Its architecture and major components
- Non-obvious technical decisions and the trade-offs behind them (especially anywhere an
  alternative was clearly considered or rejected — commit messages, comments, doc notes)
- Hard parts: bugs fixed, performance work, scaling/edge cases handled
- What changed over time and why

## Step 3: Judge complexity → pick question count

Scale within 10-50 based on what step 2 actually turned up, not a default:
- Small/simple project, shallow history: 10-15
- Moderate complexity, a few real design decisions: 16-30
- Large, architecturally rich, or long history with multiple notable decisions/pivots: 31-50

Don't pad to hit a number — every question must trace back to something real found in
step 2.

## Step 4: Generate the questions

Order roughly basic → advanced within the set so it warms up before going deep.

### Technical Mode

Question types: multiple-choice (3-4 options) for concrete facts/choices, short-answer for
reasoning and trade-offs. Cover a mix of:
- **Architecture** — why this structure/pattern, how components interact
- **Design decisions** — why this approach over the obvious alternative (name the
  alternative), what it cost/gained
- **Implementation depth** — how a specific tricky piece actually works
- **Trade-offs** — what was sacrificed for what (performance vs simplicity, etc.)
- **Debugging/hard problems** — a real bug or hard problem in the history, what caused it,
  how it was found and fixed
- **Reasoning under constraints** — what would change if a requirement changed (time,
  scale, team size)

Critical: anchor to *this* project's specific choices. Bad: "What is the virtual DOM?"
Good: "This project uses [specific state approach] for [specific feature] instead of
[specific alternative] — what problem was that solving?" If a question could be answered
without ever having looked at this codebase, rewrite or cut it.

### Non-Technical Mode

Behavioral, architectural-at-a-high-level, and project-narrative questions aimed at
interview delivery. Cover a mix of:
- **Purpose/value** — what problem it solves, for whom, why it mattered
- **Your role & decisions** — what you decided and why, in plain language
- **Challenges** — a real obstacle from the history, framed for STAR (Situation, Task,
  Action, Result)
- **Trade-offs in plain language** — what was given up for what, and why that was the
  right call
- **Outcomes/impact** — what changed as a result, how it'd be measured
- **Growth/reflection** — what they'd do differently now, what they learned

Where a question maps naturally to STAR, label it inline, e.g.:
"(STAR) Tell me about a time a technical decision you made was challenged or turned out
wrong. What happened?"

Keep these conversational — no jargon dumps — since the point is rehearsing how to *say*
this out loud to a non-technical or mixed interviewer.

## Step 5: Present

List all questions numbered, MCQ options lettered, mode labeled at the top. Don't reveal
answers yet. Tell the user to answer however's easiest (typed answers, or talk through it
out loud and paste in).

## Step 6: Review

Once the user responds:
- Technical: confirm correct answers briefly; for gaps, give the correct/expected answer
  and point to where in the project that reasoning lives (file, commit, doc)
- Non-Technical: don't grade right/wrong — give feedback on clarity, completeness, and
  whether the STAR structure lands; suggest a tighter phrasing if an answer rambles or
  buries the outcome
- Close with a short summary of strong areas vs. ones worth rehearsing again

## Notes

- If context is thin (tiny project, no history, no docs), say so and generate toward the
  low end (10-15), or ask what additional context/files to look at.
- Don't run both modes at once unless the user explicitly asks for a combined set — ask
  which one first if unclear.
