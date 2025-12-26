# Integration Contract

This document defines the integration responsibilities for the Control Panel.

## Component Role

The Control Panel is an **API consumer** only.

```
┌─────────────────────────────────────┐
│  auth.opentrusty.org                │
│  (Login, Session Cookie)            │
└────────────────┬────────────────────┘
                 │ Browser redirects for login
                 ▼
┌─────────────────────────────────────┐
│  console.opentrusty.org             │
│  (This Repository - SPA)            │
└────────────────┬────────────────────┘
                 │ REST API calls with cookie
                 ▼
┌─────────────────────────────────────┐
│  api.opentrusty.org                 │
│  (Management API)                   │
└─────────────────────────────────────┘
```

## Responsibility Matrix

| Action | Console | Auth | API |
|--------|---------|------|-----|
| Render admin UI | ✅ | ❌ | ❌ |
| Login user | ❌ | ✅ | ❌ |
| Issue session cookie | ❌ | ✅ | ❌ |
| Validate session | ❌ | ❌ | ✅ |
| Create tenant | ❌ | ❌ | ✅ |
| Display tenant list | ✅ | ❌ | ❌ |

## Explicit Forbidden Cross-Overs

| Cross-Over | Status | Rationale |
|------------|--------|-----------|
| Console calling auth endpoints | ❌ FORBIDDEN | Console uses cookies, not OAuth |
| Console storing tokens | ❌ FORBIDDEN | Session is server-side |
| Console implementing auth | ❌ FORBIDDEN | Auth is core responsibility |
| Console bypassing API | ❌ FORBIDDEN | All data via API only |

## Error Handling Contract

| API Response | Console Action |
|--------------|----------------|
| 200 OK | Display data |
| 400 Bad Request | Show validation errors |
| 401 Unauthorized | Redirect to auth.*/login |
| 403 Forbidden | Show "Access Denied" |
| 404 Not Found | Show "Not Found" |
| 500 Server Error | Show "Server Error" |

## Session Flow

1. User navigates to `console.opentrusty.org`
2. Console calls `api.opentrusty.org/auth/me` to check session
3. If 401 → redirect to `auth.opentrusty.org/login?redirect=console`
4. After login → auth redirects back to console with valid cookie
5. Console calls API with cookie attached automatically
6. API validates session and returns data

## Contract Violations

Any of the following constitutes a contract violation:

1. Console calling `auth.*/oauth2/*` endpoints
2. Console parsing or storing JWT tokens
3. Console implementing password validation
4. Console accessing database directly
5. Console making auth decisions without API
