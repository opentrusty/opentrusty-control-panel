# Control Panel Hosting

This document defines the deployment model for the static Control Panel UI.

## Artifact Nature

The Control Panel is a **pure static artifact** consisting of:
- `index.html`
- JavaScript bundles (`assets/index-*.js`)
- CSS stylesheets (`assets/index-*.css`)
- Static assets (images, fonts)

It requires **NO server-side processing**. It can be served by any static file server, CDN, or object storage.

## Hosting Options

### 1. Object Storage (S3 / GCS / R2) + CDN
Recommended for production.

- Upload `dist/` folder to bucket.
- Configure CDN (CloudFront/Cloudflare) to point to bucket.
- Set `Cache-Control`:
  - `index.html`: `no-cache`
  - `assets/*`: `public, max-age=31536000, immutable`

### 2. Nginx / Caddy
For self-hosted environments.

```nginx
server {
    server_name console.example.com;
    root /var/www/opentrusty-console;
    index index.html;

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Security Headers (Strict)

The host MUST serve strict security headers alongside the static files:

```http
Content-Security-Policy: default-src 'self'; connect-src 'self' https://api.example.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Configuration

The Control Panel uses **Build-Time Configuration**.

- **Environment Variable**: `VITE_API_BASE_URL`
- **Effect**: This value is baked into the JavaScript bundle at build time.

### Rebuilding for Different Environments
Since configuration is baked-in, you CANNOT promote the exact same binary artifact from Staging (pointing to `api.staging.com`) to Production (pointing to `api.prod.com`).

**You MUST rebuild the static assets for each environment.**

```bash
# Build for Staging
VITE_API_BASE_URL=https://api.staging.com npm run build

# Build for Production
VITE_API_BASE_URL=https://api.prod.com npm run build
```
