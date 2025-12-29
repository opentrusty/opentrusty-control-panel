import { test, expect } from '@playwright/test';

const TEST_STATE_FILE = '.e2e-state.json';

test.describe('F. Platform Features', () => {
    // Use the authenticated state from 01-bootstrap
    test.use({ storageState: TEST_STATE_FILE });

    test('UI-09: Platform Overview displays metrics', async ({ page }) => {
        await page.goto('/admin/platform/overview');

        // Verify page title
        await expect(page.getByRole('heading', { name: /Platform Control Center/i })).toBeVisible();

        // Verify metric cards are present
        await expect(page.getByText('Total Tenants')).toBeVisible();
        await expect(page.getByText('Total Users')).toBeVisible();
        await expect(page.getByText('OAuth Clients')).toBeVisible();
        await expect(page.getByText('System Status')).toBeVisible();

        // Verify Recent Activity section
        await expect(page.getByText('Recent Platform Activity')).toBeVisible();
    });

    test('UI-10: Platform Admin List accessible', async ({ page }) => {
        await page.goto('/admin/platform/admins');

        // Verify page loads (may show "Coming Soon" or actual list)
        await expect(page.locator('body')).toContainText(/(Platform Admins|Admin|Coming Soon)/i);
    });

    test('UI-11: System Settings displays OIDC endpoints', async ({ page }) => {
        await page.goto('/admin/platform/settings');

        // Verify page title
        await expect(page.getByRole('heading', { name: /System Settings/i })).toBeVisible();

        // Verify OIDC configuration is displayed
        await expect(page.getByText(/Issuer/i)).toBeVisible();
        await expect(page.getByText(/Discovery/i)).toBeVisible();
        await expect(page.getByText('JWKS Endpoint')).toBeVisible();
    });

    test('UI-12: Navigation links work correctly', async ({ page }) => {
        await page.goto('/admin/platform/tenants');

        // Test all sidebar navigation links
        await page.getByRole('link', { name: 'Platform Admins' }).click();
        await expect(page).toHaveURL(/\/platform\/admins/);

        await page.getByRole('link', { name: 'Audit Logs' }).click();
        await expect(page).toHaveURL(/\/platform\/audit/);

        await page.getByRole('link', { name: 'System Settings' }).click();
        await expect(page).toHaveURL(/\/platform\/settings/);

        await page.getByRole('link', { name: 'Tenants' }).click();
        await expect(page).toHaveURL(/\/platform\/tenants/);
    });

    test('UI-13: Platform Audit Logs display events', async ({ page }) => {
        await page.goto('/admin/platform/audit');

        // Verify page title
        await expect(page.getByRole('heading', { name: /Audit Logs/i })).toBeVisible();

        // Verify table structure exists
        await expect(page.getByRole('table')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: /Time/i })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: /Action/i })).toBeVisible();
    });
});
