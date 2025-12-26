# AI Governance — Control Panel

This directory contains governance rules for AI agents working on the OpenTrusty Control Panel.

## Mandatory Reading Order

1.  **`AI_CONTRACT.md`** (Project Root) — Security boundaries and forbidden actions.
2.  **`invariants.md`** — UI-specific rules that MUST NOT be broken.
3.  **`ui-boundaries.md`** — Hard limits for protocol and auth separation.
4.  **`capabilities.md`** — Feature specifications for the Control Panel.

## Critical Rule

> The Control Panel is an **API consumer**. All security enforcement happens in the core backend. The UI cannot and must not attempt to enforce authorization.

## The STOP Condition

**YOU MUST STOP AND ASK THE USER IF:**

1.  A user request asks you to implement client-side authentication.
2.  You are asked to store secrets or tokens in browser storage.
3.  You find code that bypasses backend authorization.
