---
description: "Implement the POST /orders endpoint per the OpenAPI spec and Prisma schema"
agent: "agent"
---

Implement the `POST /orders` REST endpoint for this project.

## Contract
- OpenAPI spec: [openapi.yaml](../../openapi.yaml)
- Prisma schema: [prisma/schema.prisma](../../prisma/schema.prisma)

## Behaviour
- Creating an order records the customer, the ordered items, and a computed total amount.
- The total amount is the sum of each item's unit price multiplied by its quantity, where the unit price is taken from the product at the time of ordering.
- Each item's quantity is deducted from the product's available stock.
- A product can only be ordered while sufficient stock is available; otherwise the request is rejected.
- If the customer or any product does not exist, the request is rejected as not found.
- Malformed or incomplete requests are rejected before any data is touched.

## Data integrity
- Stock updates and order creation must execute atomically.

## Constraints
- Place all source code inside `src/`.
- Do NOT modify existing files.
