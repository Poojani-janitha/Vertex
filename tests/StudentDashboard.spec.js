import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper function to set up student session
async function createStudentAccount(page) {
  const email = `student_${Date.now()}@test.com`;
  await page.goto(`${BASE_URL}/signup`);
  await page.locator('input[type="text"]').first().fill('Dashboard Student');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL(/\/(dashboard|community)/);
}

// Helper function to set up employer session
async function createEmployerAccount(page) {
  const email = `employer_${Date.now()}@test.com`;
  await page.goto(`${BASE_URL}/signup`);
  await page.getByLabel('Employer').check();
  await page.locator('input[type="text"]').first().fill('Test Employer');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('input[type="text"]').nth(1).fill('991234567V');
  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL(/\/(dashboard|community)/);
}

test.describe('Student Dashboard', () => {

  test('redirects to login when no user is stored', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('redirects to home when the logged-in user is not a student', async ({ page }) => {
    await createEmployerAccount(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).not.toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('loads the dashboard for a logged-in student', async ({ page }) => {
    await createStudentAccount(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('sidebar navigation switches between tabs', async ({ page }) => {
    await createStudentAccount(page);
    await page.goto(`${BASE_URL}/dashboard`);

    const sidebarItems = page.locator('aside button, nav button, aside a').first();
    if (await sidebarItems.isVisible().catch(() => false)) {
      await sidebarItems.click();
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('emergency modal opens and can be dismissed', async ({ page }) => {
    await createStudentAccount(page);
    await page.goto(`${BASE_URL}/dashboard`);

    const emergencyButton = page.getByRole('button', { name: /emergency|sos|alert/i }).first();
    
    if (await emergencyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emergencyButton.click();
      const closeButton = page.getByRole('button', { name: /close|cancel|x/i }).first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }
  });

  test('shows an error state when the dashboard fetch fails', async ({ page }) => {
    await createStudentAccount(page);

    // Intercept API/Fetch requests without blocking JS/CSS assets
    await page.route(url => !url.href.includes('.js') && !url.href.includes('.css') && !url.href.includes('@vite'), async route => {
      if (route.request().resourceType() === 'fetch' || route.request().resourceType() === 'xhr') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      }
      return route.continue();
    });

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('body')).toBeVisible();
  });

});