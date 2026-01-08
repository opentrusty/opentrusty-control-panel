// Copyright 2026 The OpenTrusty Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
      // Proxy API requests to the Admin Plane (MANAGEMENT API)
      '^/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // Note: OIDC endpoints (/oauth2, /.well-known) are NOT proxied.
      // The Control Panel UI constructs links to the Auth Plane (port 8080) directly
      // or relies on backend config. This enforces plane separation.
    }
  }
})
