# UI Invariants

Non-negotiable rules for the Control Panel UI.
Any code change that violates these invariants is **forbidden**.

## 1. No Client-Side Security

-   **MUST NOT** store secrets, tokens, or credentials in localStorage/sessionStorage.
-   **MUST NOT** implement authentication logic (backend handles via HttpOnly cookies).
-   **MUST NOT** infer permissions from client-side state.

## 2. API-Driven Authority

-   **MUST** discover all authority via API responses.
-   **MUST** handle 401 (Unauthorized) by redirecting to login.
-   **MUST** handle 403 (Forbidden) by showing "access denied" message.
-   **MUST NOT** assume UI visibility equals authorization.

## 3. No Backend Coupling

-   **MUST NOT** import core repo packages.
-   **MUST NOT** share types except via OpenAPI-generated clients.
-   **MUST NOT** assume backend implementation details.

## 4. Error Handling

-   **MUST** gracefully handle API errors (400, 401, 403, 500).
-   **MUST** display user-friendly error messages.
-   **MUST NOT** expose raw API error details to users.

## 5. Data Integrity

-   **MUST** validate form inputs client-side for UX only (not security).
-   **MUST** rely on backend for all security validations.
-   **MUST NOT** modify API request payloads to bypass validations.
