# UI Boundaries

Hard limits for the Control Panel UI. Violations are contract breaches.

## 1. Protocol Prohibition

This repository MUST NOT contain:

| Category | Examples |
|----------|----------|
| Auth protocols | OAuth2 flows, OIDC token handling, SAML |
| Credential handling | Password hashing, secret storage, key management |
| Session logic | Session creation, validation, or revocation |
| Token operations | JWT signing, verification, or refresh logic |

## 2. Communication Model

The UI communicates with the core system as follows:

```
┌─────────────────────┐
│  Control Panel UI   │
│  (This Repository)  │
└─────────┬───────────┘
          │ HTTP/REST (cookies attached by browser)
          ▼
┌─────────────────────┐
│  Management API     │
│  (opentrusty core)  │
└─────────────────────┘
```

-   **Session cookies**: Issued by core, attached automatically by browser
-   **API calls**: ONLY to documented Management API endpoints
-   **No direct auth**: UI never sees passwords or tokens

## 3. Source of Truth

| Concern | Source of Truth | UI Role |
|---------|-----------------|---------|
| User identity | Core backend | Display only |
| Permissions | Core backend | Discover via API |
| Tenant data | Core backend | Read/write via API |
| Session state | Core backend | React to 401/403 |

**The UI is NEVER a source of truth.**

## 4. Authorization Model

-   **UI visibility ≠ authorization**
-   All buttons, menus, and actions are gated by API responses
-   AI MUST NOT assume a user can perform an action because UI shows it
-   AI MUST handle 403 gracefully for any action

## 5. Feature Development Rule

**If a feature requires:**
-   Protocol changes (OAuth2, OIDC flows)
-   Auth behavior changes (login, logout, session)
-   New authorization scopes or roles

**Then AI MUST:**
1.  Stop and inform the user
2.  Direct implementation to `opentrusty` core repository first
3.  Only add UI after core API is available
