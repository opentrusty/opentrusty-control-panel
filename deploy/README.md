# OpenTrusty Control Panel Deployment

This package contains the static build of the OpenTrusty Control Panel administration interface.

## Package Contents

- `dist/`: Static assets (HTML, JS, CSS).
- `Caddyfile.example`: Recommended Caddy configuration.
- `README.md`: Deployment guide.
- `LICENSE`: Apache 2.0 license.

## Deployment Strategy

The Control Panel is a React-based Single Page Application (SPA). It must be served by a web server like Nginx or Caddy.

### 1. Requirements
- A web server (e.g., Caddy)
- Connectivity to the OpenTrusty Admin Plane API (typically on port 8081)

### 2. Manual Deployment
1. Copy the `dist/` directory to your web server's root (e.g., `/var/www/opentrusty-control-panel`).
2. Configure your web server to serve `index.html` for all unknown routes (SPA routing).
3. Set up a reverse proxy for `/api/*` to point to your OpenTrusty Admin Plane.

### 3. Example using Caddy
See the included `Caddyfile.example`. You can use it as a starting point:

```bash
cp Caddyfile.example /etc/caddy/Caddyfile
# Edit /etc/caddy/Caddyfile to match your domain and API addresses
systemctl reload caddy
```

## Environment Configuration

The frontend is built with base URLs pointing to `/api` by default. Ensure your reverse proxy correctly maps `/api` to the Admin Plane's listener.
