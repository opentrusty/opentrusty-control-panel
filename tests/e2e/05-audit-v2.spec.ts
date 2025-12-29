import { test, expect } from '@playwright/test';

const TEST_STATE_FILE = '.e2e-state.json';

test.describe('E. Observability & Audit', () => {
    test.use({ storageState: TEST_STATE_FILE });

    test('UI-08: Audit Log Verification', async ({ page }) => {
        // 1. Navigate to Audit Logs (Platform Level)
        // Check if sidebar has "Audit Logs"
        const auditLink = page.getByRole('link', { name: 'Audit Logs' });

        // If not in sidebar, check under Settings or Tenants?
        // Based on previous knowledge, maybe it's under 'Activity' or just not implemented in sidebar yet?
        // Runbooks imply "Return to Console... Navigate to Audit Logs".
        // I will try /admin/audit or check for link.
        if (await auditLink.isVisible()) {
            await auditLink.click();
        } else {
            // Pick first tenant to view audit logs
            await page.goto('/admin/platform/tenants');
            await expect(page.getByRole('row').nth(1)).toBeVisible({ timeout: 10000 });
            const rowCount = await page.getByRole('row').count();
            expect(rowCount).toBeGreaterThan(1);
            const row = page.getByRole('row').nth(1);
            const tenantId = await row.locator('td').nth(1).innerText();
            await page.goto(`/admin/tenant/${tenantId}/audit`);
        }

        // 2. Verify recent logs
        // We expect a login event (from 01-bootstrap or 04-oidc-flow)
        // and a "client_created" event.
        await expect(page.getByRole('cell', { name: /client_created/i }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: /login_success/i }).first()).toBeVisible();
    });
});
