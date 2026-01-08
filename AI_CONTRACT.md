# AI CONTRACT — OpenTrusty Control Panel

This file defines the contract for AI agents working on the Control Panel.
**ALL AI AGENTS MUST READ AND ADHERE TO THIS CONTRACT.**

## 1. Repository Scope

This repository is the **Administrative Control Panel UI**.

### Responsibilities
-   Human-facing administrative interface
-   Platform admin & tenant admin workflows
-   API consumer ONLY (no backend logic)

### Technology Stack
-   React + TypeScript
-   Tailwind CSS
-   Vite

## 2. Security Boundaries (CRITICAL)

### FORBIDDEN (AI Agents MUST NOT)
-   Implement authentication logic (sessions handled by backend cookies)
-   Store secrets, tokens, or credentials in browser storage
-   Bypass or duplicate backend authorization checks
-   Make assumptions about user authority (discover via API)
-   Call APIs without proper error handling for 401/403

### Required Behaviors
-   Treat all authority as server-enforced
-   React to 401/403 by redirecting to login
-   Never trust client-side state for security decisions

## 3. Interaction with Core

The Control Panel interacts with the OpenTrusty system **ONLY** via:
-   Documented HTTP APIs (provided by `opentrusty-admin`)
-   OpenAPI contracts

**PROHIBITED:**
-   Shared Go packages
-   Direct database access
-   Shared runtime coupling
-   Importing core repo code

## 4. Documentation Obligations

-   **Read First**: Read `docs/_ai/README.md` before modifying code.
-   **No Backend Assumptions**: Never assume how backend works internally.
-   **Boundary Awareness**: Read `docs/_ai/ui-boundaries.md` for hard limits.

## 5. Hard Protocol Boundaries

**AI MUST NOT implement in this repository:**
-   Authentication protocols (OAuth2, OIDC, SAML)
-   Password handling, hashing, or validation
-   Token generation, signing, or verification
-   Session management (sessions are backend cookies)
-   Authorization logic (enforcement is server-side)

**Any feature requiring protocol or auth behavior changes MUST be implemented in `opentrusty` core first.**

**Any feature requiring protocol or auth behavior changes MUST be implemented in `opentrusty` core first.**

## 6. Cross-Repo Contract Awareness

**AI MUST** be aware of the `docs/_ai/integration-contract.md` which binds this repository to `opentrusty`.

-   **Constraint**: You MUST NOT assume API features exist until they are merged in `opentrusty` core.
-   **Constraint**: You MUST consume the API exactly as defined in the Core's OpenAPI spec.

## 7. Replaceability Principle

**AI MUST treat this repository as a replaceable UI shell.**

-   The UI is a **consumer of API facts**, not a source of truth
-   The UI is **not allowed to bypass API authorization**
-   The UI could be replaced by CLI, mobile app, or third-party client
-   All business logic lives in the core; UI only renders and submits

> **Status**: ACTIVE
> **Last Updated**: 2025-12-26
