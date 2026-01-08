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
import { writeFileSync } from 'fs';

const TEST_STATE_FILE = '.e2e-state.json';

test.describe('A. Platform Bootstrap', () => {
    test('UI-01: Initial Admin Login', async ({ page }) => {
        // 1. Navigate to Console
        await page.goto('/admin/login');

        // 2. Check for Login Page
        // Use getByText to be robust against tag changes (h1 vs h2 vs div)
        await expect(page.getByText('Control Plane Login')).toBeVisible({ timeout: 10000 });

        // 3. Enter Credentials
        // Read from environment variables for portability
        const email = process.env.BOOTSTRAP_EMAIL || 'admin@platform.local';
        const password = process.env.BOOTSTRAP_PASSWORD || 'adminadmin';
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);

        // 4. Submit
        await page.getByRole('button', { name: /Login/i }).click();

        // 5. Verify Dashboard
        // Wait for navigation and dashboard element
        await expect(page).toHaveURL(/\/admin\/?(?!login)/);
        await expect(page.getByRole('link', { name: 'Tenants' })).toBeVisible();

        // Save state (storage state) for subsequent tests
        await page.context().storageState({ path: TEST_STATE_FILE });
    });
});
