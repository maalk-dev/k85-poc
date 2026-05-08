# Architecture Contract

This file is the architecture contract for AI-generated application code in
this repository.

The target architecture is a three-layer REST API with an API layer, a service
layer, and a repository layer.

## Repository Baseline

The repository contains technical infrastructure, not an existing application
implementation. At the baseline, `src/` is effectively empty.

Use only these project files as source of truth for behavior and data shape:

- `openapi.yaml` for the external HTTP contract.
- `prisma/schema.prisma` for the persistence model.
- `.agents/prompts/implement-create-order.prompt.md` for the implementation
  prompt.
- `package.json` for available runtime and development dependencies.

Do not invent existing helper APIs, framework wrappers, or application
conventions that are not already present. If a helper is useful, create it in
the appropriate layer described below.

## Stack

Use the existing stack and dependencies:

- TypeScript in strict mode.
- Express for HTTP routing.
- Prisma with PostgreSQL for persistence.
- Zod for request validation.
- Biome for formatting and linting.

Do not add runtime dependencies unless explicitly instructed.

## Target Structure

Place generated application code under `src/`.

Use this structure for the three-layer architecture and supporting code:

```text
src/
  routes/          API layer: HTTP routes, validation boundary, DTO responses
  services/        Service layer: business rules and orchestration
  repositories/    Repository layer: Prisma data access
  schemas/         Zod schemas and DTO types aligned with openapi.yaml
  middleware/      Express middleware, including validation and error handling
  lib/             Small shared helpers and typed application errors
```

The exact file names may follow the implemented resource, but use kebab-case
file names and named exports.

## Repository Ownership

Separate repository files by aggregate ownership.

- A repository file should own persistence operations for one primary Prisma
  model and any relations that are naturally owned by that aggregate.
- A repository must not become a catch-all data access module for unrelated
  models.
- When a service needs data from multiple aggregates, import and coordinate
  multiple repository modules from the service layer.
- Name repository files after the aggregate they own, for example
  `order-repository.ts`, `customer-repository.ts`, or `product-repository.ts`.

## Principle 1: Layer Separation

Each layer has one responsibility:

- Routes handle HTTP concerns only: request input, status codes, response
  DTOs, and Express wiring.
- Services handle business rules, invariants, orchestration, and transactions.
- Repositories handle persistence only and should be thin wrappers around
  Prisma queries.

Cross-cutting validation, error handling, and small utilities belong in
`src/schemas/**`, `src/middleware/**`, or `src/lib/**`.

## Principle 2: Downward Dependencies Only

Dependencies flow downward:

```text
routes -> services -> repositories -> Prisma
```

Allowed dependencies:

- `src/routes/**` may import from `src/services/**`, `src/schemas/**`,
  `src/middleware/**`, and `src/lib/**`.
- `src/services/**` may import from `src/repositories/**` and `src/lib/**`.
- `src/repositories/**` may import Prisma types/client access and small
  repository-safe helpers.
- `src/middleware/**`, `src/schemas/**`, and `src/lib/**` must not import
  from routes, services, or repositories unless the dependency is clearly a
  lower-level shared utility.

Forbidden dependencies:

- Routes must not import repositories or Prisma directly.
- Services must not import Express types or route modules.
- Repositories must not import routes, services, or Express.
- Avoid cyclic imports and imports that skip the intended layer boundary.

## Principle 3: Isolated Business Logic

Business logic belongs in services.

Routes must not compute domain values, branch on domain state, or perform data
access. A route should validate input, call one service operation, map the
result to the OpenAPI response DTO, and send the response.

Repositories must not contain business rules. They should query or persist
data requested by services without deciding HTTP behavior or domain policy.

Operations that require atomicity, such as creating an order and updating
stock, must be orchestrated by the service layer using a transaction-safe
repository pattern or a transaction helper created for that purpose.

## Principle 4: Separate External and Internal Models

Keep API DTOs separate from Prisma entities.

- Request and response DTOs must be represented by Zod schemas/types aligned
  with `openapi.yaml`.
- Do not return Prisma model objects directly from route responses.
- Do not reuse Prisma model types as API DTOs.
- Convert Prisma `Decimal` values to strings for monetary fields in API
  responses, matching `openapi.yaml`.
- Convert `Date` values to ISO-8601 strings before returning responses.

The service layer should be the place where persistence results are translated
into application results that the route can map to response DTOs.

## Principle 5: Centralized Error Handling

Use typed application/domain errors internally and translate them to HTTP
responses in one Express error-handling middleware.

- Services and validation middleware may throw application/domain errors.
- Services must not know about HTTP status codes or Express responses.
- Route handlers must not catch errors only to build HTTP error responses.
- Unknown errors must become a generic `500` response.
- Error response bodies must match `openapi.yaml` and must not expose stack
  traces, SQL fragments, Prisma internals, or other implementation details.

## Principle 6: Validated Input

Validate all incoming request bodies, route params, and query values before
they reach service logic.

- Use Zod schemas under `src/schemas/**`.
- Keep shape/type/bounds validation in schemas.
- Keep domain validation, such as stock availability or entity existence, in
  services.
- Validation failures should flow through the centralized error handling path.

## Quick Checks

Before considering generated code complete, check that:

- `pnpm build` passes.
- `pnpm lint` passes or any remaining lint issue is explained.
- Source code under `src/` follows the layer dependency rules above.

## Forbidden Patterns

Do not generate code with these patterns:

- Importing Prisma or repositories directly in route files.
- Importing Express or route files in service or repository files.
- Calling Prisma directly from route files.
- Returning Prisma model objects directly from `res.json(...)`.
- Computing totals, checking stock, or applying business rules in route files
  or repository files.
- Sending validation error responses directly from validation logic instead of
  using the centralized error handling path.
- Exposing stack traces, Prisma error codes, SQL fragments, or internal field
  names in API error responses.
- Adding new runtime dependencies without explicit instruction.
- Using default exports for generated application modules.
