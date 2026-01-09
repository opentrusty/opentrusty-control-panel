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

const TENANT_USER_FILE = '.e2e-tenant-user.json';

test.describe('E. Observability & Audit', () => {
    test('UI-08: Audit Log Verification', async ({ page }) => {
        let tenantId: string;
        try {
            if (existsSync(TENANT_USER_FILE)) {
                const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));
                tenantId = user.tenantId;

                // 2. Login as Tenant Admin
                await page.goto('/admin/login');
                await page.getByLabel('Email').fill(user.email);
                await page.getByLabel('Password').fill(user.password);
                await page.getByRole('button', { name: 'Login' }).click();
                await page.waitForURL(url => !url.href.includes('/login'));
            } else {
                throw new Error('Tenant user file not found');
            }
        } catch (_e) {
            // Fallback to finding it in the UI (Platform Admin context)
            await page.goto('/admin/platform/tenants');
            await expect(page.getByRole('row').nth(1)).toBeVisible({ timeout: 15000 });
            const row = page.getByRole('row').nth(1);
            tenantId = (await row.locator('td').nth(1).innerText()).trim();
        }

        await page.goto(`/admin/tenant/${tenantId}/audit`);

        // Assert and Verify
        // We look for:
        // 1. login_success
        // 2. client_created
        await expect(page.getByRole('cell', { name: /client_created/i }).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('cell', { name: /login_success/i }).first()).toBeVisible({ timeout: 10000 });

        // Optional: Check table row count
        const rows = await page.getByRole('row').count();
        expect(rows).toBeGreaterThan(1);
    });
});
