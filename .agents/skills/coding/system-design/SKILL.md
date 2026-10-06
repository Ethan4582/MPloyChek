---
name: system-design
description: Produce a production-grade system-design.md architecture document formatted for GitHub repositories.
disable-model-invocation: true
---

# SKILL: Technical System Design Document (GitHub)

## Purpose
Produce a production-grade `system-design.md` file that a senior engineer
would write and commit to a GitHub repository. The document must be
technically precise, self-contained, and structured so any engineer
can understand the problem, constraints, and architectural decisions
without needing additional context.

---

## Document Structure Pattern

Follow this exact order. Every section is required unless marked optional.

```
1. Title & One-Line Summary
2. Problem Statement
3. Goals & Non-Goals
4. Functional Requirements
5. Non-Functional Requirements
6. Scale & Capacity Estimation
7. High-Level Design (HLD)
8. Low-Level Design (LLD)
9. Data Models & Schema
10. API Design (optional)
11. Key Architectural Decisions
12. Reliability & Failure Handling
13. Diagram Prompts
14. Open Questions (optional)
15. References (optional)
```

---

## Section Instructions

### 1. Title & One-Line Summary
```markdown
# [System Name] — System Design

> One sentence describing what the system does and the core
  challenge it solves.
```

### 2. Problem Statement
- 2–4 sentences. State the problem in plain language.
- Describe who is affected and what breaks without this system.
- No solution language here. Problem only.

### 3. Goals & Non-Goals
```markdown
## Goals
- What this design must achieve.

## Non-Goals
- What is explicitly out of scope.
- Be specific. "User experience" is not enough —
  say "frontend rendering and client-side pagination
  are out of scope."
```

### 4. Functional Requirements
List what the system must do. Use plain action sentences.
```markdown
## Functional Requirements
- The system must accept a tracking event per song play.
- The system must return the top 10 songs globally, by country,
  and by user for the last 7 / 30 / 365 days.
- Leaderboards must refresh at least once per hour.
```

### 5. Non-Functional Requirements
```markdown
## Non-Functional Requirements
- Availability: 99.9% uptime
- Latency: leaderboard reads < 200ms p99
- Consistency: eventual — up to 1 hour lag is acceptable
- Durability: no event loss; at-least-once delivery
- Scalability: must handle 300K events/sec at peak
```

### 6. Scale & Capacity Estimation
Always include this. Show the working, not just the result.
```markdown
## Scale & Capacity Estimation

| Parameter        | Value                        |
|------------------|------------------------------|
| Active users     | 40M daily                    |
| Events/user/day  | 36 song plays                |
| Peak events/sec  | ~300,000                     |
| Events/day       | 3.6 billion                  |
| Read QPS         | 200 baseline / 1,000 peak    |
| Data retention   | 1 year raw events            |

**Working:**
40M users × 36 plays = 1.44B events/day
Peak factor 3× → 1.44B × 3 / 86,400 ≈ 50K/sec sustained
Burst to 300K/sec during peak hours
```

### 7. High-Level Design (HLD)
- Describe the system in 3–5 sentences.
- Show the main components and how data flows between them.
- Use a simple inline flow:

```markdown
## High-Level Design

Client → API → Queue → Stream Processor → Data Lake
                                        → Aggregation Layer → Serve DB
```

Then describe each component in 1–2 sentences. No implementation
detail yet. Save that for LLD.

### 8. Low-Level Design (LLD)
Go deep here. For each major component include:
- What it does
- How it is partitioned or scaled
- What it reads from and writes to
- Key trade-offs made

```markdown
## Low-Level Design

### Tracking API
Receives play events. Validates schema. Writes to the queue.
Stateless — horizontally scalable behind a load balancer.
Does not process events inline to avoid latency spikes at peak.

### Queue (Event Buffer)
Decouples ingestion from processing. Absorbs burst traffic.
Partitioned by song_id for ordering guarantees per song.
Retention: 7 days. Replication factor: 3.

### Stream Processor
Reads from the queue in micro-batches (5-minute windows).
Writes raw events to the data lake partitioned by date.
Does not aggregate — that is the ETL layer's responsibility.

### ETL Pipeline
Runs hourly. Reads from the data lake. Enriches events with
song and user metadata via joins. Writes enriched events to
the aggregation layer.

### Aggregation Layer
Computes top-10 rankings across all time windows and dimensions
(global / country / user). Writes results to the serve database.
Incremental updates preferred over full recomputes where possible.

### Serve Database
Read-optimised. Stores pre-computed leaderboard results.
Queries: top_songs(window, dimension, dimension_value).
Indexed on (window, dimension). Replicated for read scale.
```

### 9. Data Models & Schema
Show actual field-level schemas. Use code blocks.
```markdown
## Data Models

### Raw Event
```json
{
  "song_id":    "string",
  "user_id":    "string",
  "album_id":   "string",
  "timestamp":  "ISO8601",
  "country":    "string"
}
```

### Enriched Event
Adds: song_name, artist_name, album_name, genre,
      user_age, user_gender, city, day, month, year, hour

### Leaderboard Row
```
(window, dimension, dimension_value, rank, song_id,
 song_name, artist_name, play_count)
```
```

### 10. API Design (optional)
Include only if the system exposes an API.
```markdown
## API Design

GET /leaderboard?window=7d&dimension=country&value=US
→ Returns top 10 songs for the US in the last 7 days.

Response:
{
  "window": "7d",
  "dimension": "country",
  "value": "US",
  "results": [{ "rank": 1, "song_id": "...", "play_count": ... }]
}
```

### 11. Key Architectural Decisions
This is the most important section for reviewers.
For each decision use this format:

```markdown
## Key Architectural Decisions

### Why a queue between the API and the processor?
At 300K events/sec peak, inline processing would increase API
latency and risk data loss under load. The queue absorbs bursts,
decouples ingestion from processing, and allows independent scaling
of each layer.

### Why daily HDFS partitions instead of hourly?
Hourly partitions produce too many small files, degrading throughput.
Daily files are large enough for efficient batch reads. Data older
than a day is rarely queried at hourly granularity.

### Why pre-compute leaderboards instead of querying on demand?
Read QPS is low (200–1,000). Pre-computation on a 1-hour cycle
shifts cost to the write path and keeps read latency under 200ms
regardless of dataset size.
```

### 12. Reliability & Failure Handling
Address each major component's failure mode.
```markdown
## Reliability & Failure Handling

| Component        | Failure Mode         | Mitigation                        |
|------------------|----------------------|-----------------------------------|
| Tracking API     | Instance failure     | Load balancer + auto-restart      |
| Queue            | Broker failure       | Replication factor 3; no data loss|
| Stream processor | Job failure          | Checkpoint + replay from queue    |
| ETL pipeline     | Run failure          | Idempotent reruns; alerting       |
| Serve database   | Primary failure      | Read replica promotion            |

**Cross-region:** Active-passive. Failover RTO < 15 minutes.
Data replicated asynchronously. RPO < 1 hour (matches leaderboard
refresh window — no data loss visible to users).
```

### 13. Diagram Prompts
For every major flow, include a ready-to-use diagram prompt.
Use this format:

```markdown
## Diagram Prompts

### Write Path
> Draw a simple left-to-right system architecture diagram in
> Excalidraw style. White background. Dark lines and rounded boxes.
> Generous spacing. Label every box with its name and a short
> description. Label every arrow with the data or action it carries.
>
> Components (left to right):
> Client → Tracking API → Event Queue → Stream Processor →
> Data Lake → ETL Pipeline → Aggregation Layer → Serve DB
>
> Highlight the Event Queue as the critical decoupling point
> using a distinct border or subtle fill.
> Keep the diagram clean enough to fit on one screen.

### Read Path
> Draw a simple top-to-bottom diagram in Excalidraw style.
> Show a user request entering a Leaderboard API, which reads
> from a Serve DB, then returns a ranked list response.
> Label the query parameters on the request arrow and the
> response structure on the return arrow.
```

### 14. Open Questions (optional)
```markdown
## Open Questions
- Should enrichment happen in the stream processor or the ETL layer?
- What is the acceptable staleness for the user-level leaderboard?
- Do we need a real-time leaderboard path for peak events (e.g. new
  releases)?
```

### 15. References (optional)
```markdown
## References
- Internal: link to data model spec, capacity planning sheet
- Reading: relevant papers, blog posts, or prior designs consulted
```

---

## Writing Rules

- Write in plain English. Avoid passive voice where possible.
- Every claim must be supported by the scale numbers or a stated
  requirement. No vague statements like "this scales well."
- Trade-offs must be explicit. Say what is gained and what is lost.
- Schemas use code blocks. Prose uses prose. Never mix them.
- Tables for comparisons, failure modes, and parameter summaries.
- No marketing language. No "seamless", "robust", "best-in-class."
- Diagrams are prompts, not embedded images — GitHub renders
  the prompt text cleanly and the team generates the image separately.

---

## Closing Checklist

Before committing, verify:
- [ ] Scale estimation shows working, not just conclusions
- [ ] Every major component has a failure mode addressed
- [ ] Every architectural decision has an explicit trade-off
- [ ] Schemas are field-level, not conceptual
- [ ] At least one diagram prompt is included
- [ ] Non-goals are specific, not generic
- [ ] No section is missing from the structure pattern
