# System Boundaries

This document defines what this repository owns and explicitly does NOT own.

## Repository Identity

**Repository**: `opentrusty-control-panel`  
**Purpose**: Static Admin Control Panel (SPA)  
**Domain**: `console.opentrusty.org`

## What This Repository Owns

- Human-facing administrative interface
- React + TypeScript UI components
- Tailwind CSS styling
- Vite build pipeline
- Client-side routing
- API client for Management API

## What This Repository Does NOT Own

| Component | Owner | Why |
|-----------|-------|-----|
| Authentication logic | `opentrusty` | Sessions are backend cookies |
| OAuth2/OIDC flows | `opentrusty` | Protocol is core responsibility |
| Token generation | `opentrusty` | Security-critical operation |
| Session management | `opentrusty` | Server-side state |
| User credentials | `opentrusty` | Never touched by UI |
| Database | `opentrusty` | All access via API |

## Dependencies

### This Repo Depends On
- `opentrusty` core for:
  - Management API (`api.opentrusty.org`)
  - Session cookies issued by Auth (`auth.opentrusty.org`)

### Nothing Depends On This Repo
- The Control Panel is a replaceable UI shell
- Could be replaced by CLI, mobile app, or third-party client

## Forbidden Cross-Overs

| Action | Status |
|--------|--------|
| Importing Go code | ❌ FORBIDDEN |
| Calling auth endpoints | ❌ FORBIDDEN |
| Storing secrets | ❌ FORBIDDEN |
| Implementing auth logic | ❌ FORBIDDEN |
| Bypassing API | ❌ FORBIDDEN |
