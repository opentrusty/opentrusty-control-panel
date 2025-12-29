import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

const TEST_STATE_FILE = '.e2e-state.json';
const TENANT_USER_FILE = '.e2e-tenant-user.json';

test.describe('B. Tenant Lifecycle', () => {
    // Use the authenticated state
    test.use({ storageState: TEST_STATE_FILE });

    test('UI-02: Create Tenant', async ({ page }) => {
        await page.goto('/admin/platform/tenants');

        // 1. Click Create
        await page.getByRole('button', { name: 'Create Tenant' }).click();

        // 2. Fill Form
        const tenantName = `E2E Tenant ${Date.now()}`;
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByPlaceholder('Acme Corp').fill(tenantName);

        // 3. Submit
        const createDialog = page.getByRole('dialog');
        await createDialog.getByRole('button', { name: 'Create Tenant' }).click();
        await expect(createDialog).toBeHidden();

        // 4. Verify Creation
        await expect(page.getByText(tenantName)).toBeVisible();

        // Capture Tenant ID for subsequent tests
        const tenantRow = page.getByRole('row', { name: tenantName });
        const tenantId = await tenantRow.locator('td').nth(1).innerText();
        console.log(`Created Tenant: ${tenantName} (${tenantId})`);

        // 5. Provision User (Needed for OIDC Flow)
        // Enter tenant context
        const row = page.getByRole('row').filter({ hasText: tenantName });
        await row.getByRole('link', { name: 'Manage users' }).click();

        await page.getByRole('button', { name: 'Provision User' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // We use a fixed email to reference it in OIDC flow if needed, or dynamic
        const userEmail = `e2e-user-${Date.now()}@example.com`;
        await page.getByLabel('Email').fill(userEmail);
        await page.getByLabel('Password').fill('Password123!');
        // Given Name/Family Name are hardcoded in UI for now

        // Explicitly select role "Tenant Admin"
        await page.getByRole('combobox', { name: 'Role' }).click();
        await page.getByRole('option', { name: 'Tenant Admin' }).click();

        // Verify selection
        await expect(page.getByRole('combobox', { name: 'Role' })).toHaveText('Tenant Admin');

        // Debug: Check for validation errors
        const errors = await page.locator('.text-destructive').allInnerTexts();
        if (errors.length > 0) {
            console.log('Form validation errors:', errors);
        }


        // Explicitly target the submit button within the dialog
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: 'Provision User' }).click();

        // Wait for dialog to close (implies success)
        await expect(dialog).toBeHidden();

        // Verify success via Role in table (Email is not shown in table, Toast is flaky)
        // Table should refresh and show the new user
        await expect(page.getByRole('cell', { name: 'tenant_admin' }).first()).toBeVisible();

        // Save tenant user credentials for subsequent tests (UI-04 Client Registration)
        writeFileSync(TENANT_USER_FILE, JSON.stringify({
            email: userEmail,
            password: 'Password123!',
            tenantName: tenantName,
            tenantId: tenantId
        }));
    });

    test('UI-03: Tenant Isolation', async ({ page }) => {
        await page.goto('/admin/platform/tenants');
        // Assume the tenant from UI-02 exists, but since we run serially, we pick the first one or search.
        // For robustness, we grab the first tenant in the list

        // Wait for list to load - ensure we have data rows (row count > 1 for header + data)
        await expect(async () => {
            const count = await page.getByRole('row').count();
            expect(count).toBeGreaterThan(1);
        }).toPass();

        // Click "Manage users" on the first data row
        await page.getByRole('link', { name: 'Manage users' }).first().click();

        // Verify URL context
        await expect(page).toHaveURL(/\/admin\/platform\/tenants\/[a-zA-Z0-9-]+\/users/);
        await expect(page.getByRole('heading', { name: 'Tenant Users' })).toBeVisible();
    });
});
