# OpenTrusty Control Panel

Administrative UI for the OpenTrusty Identity Provider.

## Overview

The OpenTrusty Control Panel is the human-facing administrative interface for managing:

- **Platform Administration**: Tenant lifecycle, platform admins, system configuration
- **Tenant Administration**: Users, OAuth2 clients, audit logs

> ⚠️ **This is NOT an end-user portal.** Only platform admins and tenant admins access this UI.

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: OpenAPI-generated client

## Architecture

```
┌─────────────────────────────┐
│    Control Panel UI         │
│    (This Repository)        │
└─────────────┬───────────────┘
              │ HTTP/REST
              ▼
┌─────────────────────────────┐
│    OpenTrusty Admin         │
│    (opentrusty-admin repo)  │
│    - Management APIs        │
│    - Audit Querying         │
└─────────────┬───────────────┘
              │ 
              ▼
┌─────────────────────────────┐
│    OpenTrusty Core          │
│    (opentrusty-core repo)   │
│    - Domain Kernel          │
└─────────────────────────────┘
```

**The UI is a pure API consumer.** It does not contain:
- Authentication logic (sessions handled by backend cookies)
- Security enforcement (all authorization is server-side)
- Backend code or database access

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Running OpenTrusty backend

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment

Pre-built static builds of the Control Panel are available in the [GitHub Releases](https://github.com/opentrusty/opentrusty-control-panel/releases).

Detailed instructions are available in the [Canonical Deployment Guide](https://github.com/opentrusty/opentrusty-core/blob/main/DEPLOYMENT.md) and the `README.md` included in the release package.

## AI Governance


Before modifying code, read:

1. `AI_CONTRACT.md` — Security boundaries and forbidden actions
2. `docs/_ai/README.md` — Mandatory reading order
3. `docs/_ai/invariants.md` — UI-specific rules

## Related Repositories

- **opentrusty-core** — Domain & Security Kernel
- **opentrusty-auth** — Authentication Data Plane
- **opentrusty-admin** — Management Control Plane API
- **opentrusty-cli** — Operator Tooling

## License

Apache License, Version 2.0 - see [LICENSE](LICENSE)
