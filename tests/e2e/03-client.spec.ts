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
import { readFileSync, writeFileSync, existsSync } from 'fs';

const TENANT_USER_FILE = '.e2e-tenant-user.json';
const OIDC_CONFIG_FILE = '.e2e-oidc.json';

test.describe('C. Client Lifecycle', () => {
    // No storageState, we login explicitly
    // test.use({ storageState: TEST_STATE_FILE });

    test('UI-04: Register OIDC Client', async ({ page }) => {
        // 0. Login as Tenant Admin
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        // Debug: Monitor login response
        page.on('response', async response => {
            if (response.url().includes('/auth/login') && response.status() !== 200) {
                console.log(`Login Failed: ${response.status()} ${response.statusText()}`);
                console.log(await response.text());
            }
        });

        await page.goto('/admin/login');
        await page.getByLabel('Email').fill(user.email);
        await page.getByLabel('Password').fill(user.password);
        await page.getByRole('button', { name: 'Login' }).click();

        // Wait for login to complete and redirect (session cookie set)
        // Router usually redirects to /platform or /tenant/:id based on user role
        // We just wait for meaningful URL change away from /login
        await page.waitForURL(url => !url.href.includes('/login'));

        // Explicitly navigate to tenant dashboard to avoid redirection ambiguity
        await page.goto(`/admin/tenant/${user.tenantId}/overview`);
        await expect(page.getByRole('heading', { name: "Workspace Overview" })).toBeVisible();

        // 1. Navigate to Clients
        // We are already in tenant context. Sidebar should have "OAuth Clients".
        await page.getByRole('link', { name: 'OAuth Clients' }).click();


        // 2. Register Client
        await page.getByRole('button', { name: 'Register Client' }).click();

        // 3. Fill Form
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByLabel('Client Name').fill('Demo App');
        await page.getByLabel('Redirect URI').fill('http://localhost:8082/callback');

        // 4. Submit
        await page.getByRole('button', { name: 'Register Client' }).last().click();

        // 5. Capture Credentials (they appear in a dialog or just in the list?)
        // Usually a "Client Config" dialog appears after creation with the secret.
        // Based on typical OIDC implementations, secret is shown ONCE.
        // Let's look for "Client Secret" text.
        await expect(page.getByText('Client Secret', { exact: true })).toBeVisible();

        const clientId = await page.getByLabel('Client ID').inputValue();
        // Secret might be in a readonly input or just text.
        // Try label 'Client Secret'
        const clientSecret = await page.getByLabel('Client Secret').inputValue(); // or .innerText() checking visibility

        console.log(`Captured OIDC Credentials: ${clientId} / ${clientSecret.substring(0, 4)}...`);

        // Save to file for the OIDC Flow test
        writeFileSync(OIDC_CONFIG_FILE, JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret
        }));

        // Close dialog
        await page.getByRole('button', { name: 'Close' }).last().click();
    });
});
