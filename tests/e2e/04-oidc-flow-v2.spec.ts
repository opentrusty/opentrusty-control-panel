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

import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const OIDC_CONFIG_FILE = '.e2e-oidc.json';
const TENANT_USER_FILE = '.e2e-tenant-user.json';
const DEMO_APP_PORT = 8082;

let demoAppProcess: ChildProcess;

test.describe('D. OIDC Login Flow', () => {

    test.beforeAll(async () => {
        // 1. Load Credentials
        if (!existsSync(OIDC_CONFIG_FILE)) {
            throw new Error(`OIDC config file not found: ${OIDC_CONFIG_FILE}. Run 03-client.spec.ts first.`);
        }
        const config = JSON.parse(readFileSync(OIDC_CONFIG_FILE, 'utf-8'));

        // 2. Start Demo App with dynamic credentials
        // Use ../opentrusty-demo-app because we are in opentrusty-control-panel
        const demoAppPath = path.resolve('../opentrusty-demo-app');

        console.log(`Starting Demo App at ${demoAppPath} on port ${DEMO_APP_PORT}...`);

        // Kill any existing on 8082 (rough cleanup)
        try {
            require('child_process').execSync(`lsof -t -i:${DEMO_APP_PORT} | xargs kill -9 || true`);
        } catch (e) { }

        demoAppProcess = spawn('go', ['run', '.'], {
            cwd: demoAppPath,
            env: {
                PATH: process.env.PATH,
                HOME: process.env.HOME,
                PORT: String(DEMO_APP_PORT),
                AUTH_URL: 'http://localhost:8080',
                CLIENT_ID: config.client_id,
                CLIENT_SECRET: config.client_secret,
                REDIRECT_URI: `http://localhost:${DEMO_APP_PORT}/callback`
            },
            stdio: 'inherit'
        });

        // Wait for it to be ready
        await new Promise(resolve => setTimeout(resolve, 3000));
    });

    test.afterAll(() => {
        if (demoAppProcess) {
            demoAppProcess.kill();
        }
    });

    // Use a fresh browser context for the User (not Admin)
    test('UI-05/06/07: Full OIDC Flow', async ({ browser }) => {
        // Skip if prerequisite files don't exist
        if (!existsSync(OIDC_CONFIG_FILE) || !existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }

        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));
        const context = await browser.newContext();
        const page = await context.newPage();

        // Step 1: Open Demo App
        await page.goto(`http://localhost:${DEMO_APP_PORT}`);
        await expect(page.getByRole('heading', { name: 'OpenTrusty Demo App' })).toBeVisible({ timeout: 15000 });

        // Step 2: Initiate Auth
        page.on('request', request => {
            if (request.url().includes('/oauth2/authorize')) {
                console.log(`DEBUG: intercepted authorize request: ${request.url()}`);
            }
        });
        await page.click('text=Login with OpenTrusty');

        // Step 3: Verify Redirect to Login on Auth Plane (localhost:8080)
        // Since we are unauthenticated, we should land on /login
        await expect(page).toHaveURL(/localhost:8080\/login/, { timeout: 10000 });

        // Step 4: Login
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Step 5: Verify Redirect to Consent or callback
        // Should go through /oauth2/authorize and land on /consent
        await expect(page).toHaveURL(/localhost:8080\/consent/, { timeout: 10000 });

        // Step 6: Approve Consent
        await page.getByRole('button', { name: /Approve/i }).click();

        // Step 7: Verify Redirect back to Demo App with callback
        await expect(page).toHaveURL(new RegExp(`localhost:${DEMO_APP_PORT}`), { timeout: 15000 });

        // Step 8: Verify we got tokens
        await expect(page.locator('body')).toContainText(/Login Successful/i, { timeout: 10000 });
        await expect(page.locator('body')).toContainText(/access_token/i, { timeout: 10000 });
    });
});
