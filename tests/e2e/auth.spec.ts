import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/admin/login');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/OpenTrusty/);
});

test('login page elements present', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});
