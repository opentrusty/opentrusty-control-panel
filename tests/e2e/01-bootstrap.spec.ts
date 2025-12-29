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
        // NOTE: Using the known bootstrap credentials. In a real scenario, these might come from ENV.
        await page.getByLabel('Email').fill('admin@platform.local');
        // Using actual generated password from logs
        await page.getByLabel('Password').fill('Cw6ugqR1ZdTxKfYMt0iyrg!');

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
