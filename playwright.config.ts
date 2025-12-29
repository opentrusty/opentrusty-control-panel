import { defineConfig, devices } from '@playwright/test';

/**
 * OpenTrusty E2E Testing Configuration
 * Enforces serial execution to maintain state across lifecycle tests.
 */
export default defineConfig({
    testDir: './tests/e2e',
    /* The output directory for test results such as screenshots and videos. */
    outputDir: './artifacts/tests/ui/results',
    /* Run tests in files in parallel? No, valid state depends on sequence. */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: 'artifacts/tests/ui/report' }],
        ['list']
    ],
    /* Shared settings for all the projects below. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:5173',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',

        /* Capture screenshot on failure */
        screenshot: 'only-on-failure',

        /* Record video on retry */
        video: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173/admin/',
        timeout: 120 * 1000,
        reuseExistingServer: true,
    },
});
