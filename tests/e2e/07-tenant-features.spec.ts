import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';

const TENANT_USER_FILE = '.e2e-tenant-user.json';

test.describe('G. Tenant Features', () => {
    // Login as tenant user for these tests
    test.beforeEach(async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto('/admin/login');
        await page.getByLabel('Email').fill(user.email);
        await page.getByLabel('Password').fill(user.password);
        await page.getByRole('button', { name: 'Login' }).click();
        await page.waitForURL(url => !url.href.includes('/login'));
    });

    test('UI-14: Tenant Overview displays dynamic data', async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto(`/admin/tenant/${user.tenantId}/overview`);

        // Verify page title
        await expect(page.getByRole('heading', { name: /Workspace Overview/i })).toBeVisible();

        // Verify metrics cards
        // Use scoped selectors to avoid matching sidebar links
        const main = page.getByRole('main');
        await expect(main.getByText('OAuth Clients')).toBeVisible();
        await expect(main.getByText('Total Users')).toBeVisible();
        await expect(main.getByText('Tenant ID')).toBeVisible();

        // Verify OIDC Endpoints section
        await expect(page.getByText('OIDC Endpoints')).toBeVisible();
        await expect(page.getByText(/DISCOVERY URL/i)).toBeVisible();
    });

    test('UI-15: Client Wizard accessible from overview', async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto(`/admin/tenant/${user.tenantId}/clients/new`);

        // Verify wizard page
        await expect(page.getByRole('heading', { name: /Register Client/i })).toBeVisible();

        // Verify wizard form elements
        await expect(page.getByText('Application Name')).toBeVisible();
        await expect(page.getByText('Application Type')).toBeVisible();
        await expect(page.getByText('Web Application')).toBeVisible();
        await expect(page.getByText('SPA / Mobile App')).toBeVisible();
    });

    test('UI-16: Branding placeholder displayed', async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto(`/admin/tenant/${user.tenantId}/branding`);

        // Verify branding placeholder
        await expect(page.locator('body')).toContainText(/(Branding|Coming Soon|future release)/i);
    });

    test('UI-17: Tenant Users list accessible', async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto(`/admin/tenant/${user.tenantId}/users`);

        // Verify users page
        await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible();

        // Verify table exists
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('UI-18: Tenant Sidebar navigation works', async ({ page }) => {
        if (!existsSync(TENANT_USER_FILE)) {
            test.skip();
            return;
        }
        const user = JSON.parse(readFileSync(TENANT_USER_FILE, 'utf-8'));

        await page.goto(`/admin/tenant/${user.tenantId}/overview`);

        // Test sidebar navigation - use exact match to avoid 'Manage Users' button
        await page.getByRole('link', { name: 'Users', exact: true }).click();
        await expect(page).toHaveURL(/\/users/);

        await page.getByRole('link', { name: 'OAuth Clients', exact: true }).click();
        await expect(page).toHaveURL(/\/clients/);

        await page.getByRole('link', { name: 'Audit Logs', exact: true }).click();
        await expect(page).toHaveURL(/\/audit/);

        await page.getByRole('link', { name: 'Branding', exact: true }).click();
        await expect(page).toHaveURL(/\/branding/);

        await page.getByRole('link', { name: 'Overview', exact: true }).click();
        await expect(page).toHaveURL(/\/overview/);
    });
});
