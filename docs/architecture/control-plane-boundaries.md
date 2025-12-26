# Control Plane Boundaries

This document defines the architectural boundaries for the Control Panel.

## Repository Identity

**Repository**: `opentrusty-control-panel`  
**Purpose**: Static Admin Control Panel (SPA)  
**Domain**: `console.opentrusty.org`

## What This Repository Owns

- Human-facing administrative interface
- React + TypeScript + Tailwind CSS codebase
- Client-side routing and state management
- API client for Management API consumption
- Admin UX flows (tenant creation, user management, OAuth client wizard)

## What This Repository Does NOT Own

| Component | Owner | Interaction |
|-----------|-------|-------------|
| Authentication logic | `opentrusty` | Uses session cookies |
| Token handling | `opentrusty` | Never sees tokens |
| User credentials | `opentrusty` | Never handles passwords |
| Session management | `opentrusty` | Cookie-based, server-enforced |
| Database access | `opentrusty` | All data via API |
| Business logic | `opentrusty` | UI only renders and submits |

## Dependencies

### This Repo Depends On
- `opentrusty` Management API (`api.*`)
- Session cookies issued by `opentrusty` Auth (`auth.*`)

### Other Repos Depend On This Repo
- None (UI is a leaf dependency)

## Communication Model

```
┌─────────────────────────────────────────┐
│  Browser                                │
│  ┌───────────────────────────────────┐  │
│  │  Control Panel SPA                │  │
│  │  (This Repository)                │  │
│  └───────────────┬───────────────────┘  │
│                  │                      │
│                  │ Cookie attached      │
│                  ▼ automatically        │
└──────────────────┼──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  api.opentrusty.org                     │
│  (opentrusty Management API)            │
└─────────────────────────────────────────┘
```

## Environment Configuration

The Control Panel MUST use environment-based API configuration:

```typescript
// src/config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
};
```

Build-time environment variables:
- `VITE_API_BASE_URL` — Management API base URL (e.g., `https://api.opentrusty.org`)

## Security Requirements

| Requirement | Status |
|-------------|--------|
| No token storage in browser | ✅ Required |
| No credential handling | ✅ Required |
| Cookie-based session only | ✅ Required |
| All data via API | ✅ Required |
| Handle 401 → redirect to login | ✅ Required |
| Handle 403 → show access denied | ✅ Required |

## Forbidden Actions

| Action | Status |
|--------|--------|
| Implementing OAuth flows | ❌ FORBIDDEN |
| Storing secrets in localStorage | ❌ FORBIDDEN |
| Storing tokens in sessionStorage | ❌ FORBIDDEN |
| Bypassing API authorization | ❌ FORBIDDEN |
| Embedding backend code | ❌ FORBIDDEN |
| Direct database access | ❌ FORBIDDEN |
