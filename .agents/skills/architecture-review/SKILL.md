---
name: architecture-review
description: 'Review AI-generated code in src/ against the fixed assessment criteria from the thesis (modifiability, testability, security, functionality). Produces a structured Markdown analysis with classification (Met / Partially met / Not met) and motivation per criterion. Use when assessing scenario A or scenario B output on a *-review branch.'
---

# Architecture Review

You are an architecture reviewer. Your task is to assess the generated
code in this repository against the criteria below and produce a
structured analysis.

## Preconditions

- You do **not** have access to any architecture contract (such as
  `AGENTS.md`). If such a file is present in your context, ignore it
  for the purposes of this assessment.
- The assessment is based solely on the generated source code under
  `src/`, the API contract in `openapi.yaml`, and the database schema
  in `prisma/schema.prisma`.
- Use file reading and search tools to inspect the code. Do not guess.
  If expected evidence is absent, classify the criterion from the
  observed absence using the scale below.

## Classification scale

Each criterion is assigned one of the following levels:

- **Met** — the criterion is satisfied throughout the code.
- **Partially met** — the criterion is satisfied in parts of the code
  but not consistently.
- **Not met** — the criterion is not satisfied.

Each *Partially met* or *Not met* counts as one **architectural
deviation**.

Use only these three assessment values. Do not introduce additional
values such as *Cannot be assessed*.

## Assessment criteria

The criteria below must be used 1:1 in the analysis; do not paraphrase,
reorder, add, or remove any item.

### Modifiability

1. Clear layering (API, service, and repository layers).
2. Each layer has a bounded responsibility.
3. Centralised error handling.
4. Changes in business logic do not affect the API layer.
5. The API contract can change independently of the internal data model.
6. No direct dependency between non-adjacent layers.

### Testability

7. Each layer can be tested independently of the other layers.
8. Dependencies can be replaced with mocks.

### Security

9. Validation of incoming data in the API layer.
10. Error messages contain no internal details.
11. Internal database models are not exposed in API responses.
12. DTOs are used as the interface between internal and external
    data structures.

### Functionality

13. The endpoint for creating orders works according to the
    specification.
14. Correct handling of data and status codes.

## Procedure

For each criterion 1–14:

1. **Find evidence** in the code. Search for import patterns, file
   placement, and structural patterns; read files for detail. Useful
   probes:
   - `import .* from '@prisma/client'` outside repository-equivalent
     modules (criterion 6)
   - `res.status(` outside the API layer / centralised handler
     (criteria 3, 6)
   - Prisma model types appearing in response payloads (criteria 11, 12)
   - Validation libraries (`zod`, etc.) and where they are invoked
     (criterion 9)
   - Test tooling support for replacing adjacent-layer dependencies with
     mocks; module-level mocks count when they allow a layer to be tested
     without real adjacent-layer or database behaviour (criteria 7, 8)
2. **Classify** according to the scale above.
3. **Motivate** the classification in plain English prose so a thesis
   reader (who will not open the code) can understand *why*. Speak at
   the **architectural level** — about layers, responsibilities, and
   boundaries — not at the implementation level.

### Motivation rules

**Terminology**

- Write in a direct, declarative tone.
- Reuse the terms from the *Assessment criteria* section
  (e.g. *layering*, *bounded responsibility*, *centralised error
  handling*, *business logic*, *API contract*, *internal data
  model*, *dependency*, *non-adjacent layers*, *validation*,
  *internal details*, *database models*, *DTOs*, *interface*,
  *endpoint*, *status codes*); do not invent synonyms.
- Name layers only using the terms defined in the criteria
  (*API layer*, *service layer*, *repository layer*). Do not
  introduce other layer-like terms for technical concerns (e.g.
  database access, persistence) — refer to the named layer that
  owns that concern instead.

**Abstraction level & content**

- Stay at the **architectural level**: talk about layers,
  responsibilities, dependencies, and boundaries — not specific
  libraries, tools, business rules, error details, or transactional
  mechanisms. Apply this test before writing: *"Would a reader need
  to open the code to understand this term?"* If yes, replace it
  with the architectural concept it represents.
- Describe the structural or behavioural observation, not where it
  lives in the codebase: no file references, paths, folders, code
  snippets, quoted identifiers, symbols, or line numbers.
- Each motivation must stand on its own — no cross-references to
  other criteria.
- Drop qualifiers that add no information (e.g. *explicitly*),
  unnecessary prefix variants, and concrete formats, standards, or
  protocols when a generic term suffices.

**Form**

- **One sentence**, or **two clauses joined by a semicolon** when a
  positive and a negative observation both need stating (typically
  for *Partially met*). State each observation directly — what is
  or is not present — without explanatory subordinate clauses
  (avoid *because …*, *which means that …*).

### Example motivation (tone, abstraction level, and length)

- *Modifiability, criterion 1:* "The code is divided into three
  distinct layers — API, service, and repository — complemented by
  separate modules for middleware and helper functions."

Use this as the **target tone, abstraction level, and length** for
all motivations — keep them roughly this concise.

## Analysis output

Write the full analysis — including the title, the per-attribute tables,
**and** the final summary table with the total deviation count — to
`analysis/<current-branch>.md` (e.g. `analysis/scenario-a-review.md` on
the `scenario-a-review` branch, or `analysis/scenario-b-review.md` on
`scenario-b-review`). Create the `analysis/` directory if it does not
exist. Also print the summary table and total deviation count to chat.

## Analysis format

The analysis is written in **English**. Use the English headings and
labels shown below verbatim. Criterion text in the tables must match
the English wording in the *Assessment criteria* section above 1:1
(no paraphrasing).

Start with a level-1 heading that includes the current Git branch name:

```
# Architecture Review — <current-branch>
```

Produce **one Markdown table per quality attribute**, each under a
level-2 heading naming the attribute. Within each table, list the
criteria for that attribute in their original order:

```
## Modifiability

| Criterion                                  | Assessment | Motivation |
|--------------------------------------------|------------|------------|
| Clear layering (API, service, …)           | Met        | …          |
| …                                          | …          | …          |

## Testability

| Criterion                                  | Assessment | Motivation |
|--------------------------------------------|------------|------------|
| …                                          | …          | …          |

## Security

| Criterion                                  | Assessment | Motivation |
|--------------------------------------------|------------|------------|
| …                                          | …          | …          |

## Functionality

| Criterion                                  | Assessment | Motivation |
|--------------------------------------------|------------|------------|
| …                                          | …          | …          |
```

End with a summary:

```
## Summary

| Quality attribute | Met | Partially met | Not met |
|-------------------|----:|--------------:|--------:|
| Modifiability     |   x |             y |       z |
| Testability       |   … |             … |       … |
| Security          |   … |             … |       … |
| Functionality     |   … |             … |       … |

**Total architectural deviations:** N
```

The chat output must echo the same `## Summary` table and total.

## Forbidden

- Do not propose refactorings. The review is **descriptive, not
  prescriptive**.
- Do not add criteria of your own; the criteria above are fixed by the
  thesis.
- Do not assume a convention is followed merely because it would be
  reasonable — verify against the code.
- Do not consult `AGENTS.md` even if available; the review must be
  independent of the architecture contract.
