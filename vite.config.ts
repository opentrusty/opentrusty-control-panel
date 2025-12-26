import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/admin/",
  server: {
    proxy: {
      // Auth Routes -> Auth Plane (8080)
      // Must come before /api to take precedence
      '^/api/v1/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // OAuth2 Routes -> Auth Plane (8080)
      '^/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // OIDC Discovery -> Auth Plane (8080)
      '^/.well-known': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // API Routes -> Admin Plane (8081)
      // Handles everything else under /api
      '^/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    }
  }
})
