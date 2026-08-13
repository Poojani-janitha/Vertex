import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Users directory page', () => {
  test('shows the user directory heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`);

    await expect(page.getByRole('heading', { name: /user directory/i })).toBeVisible();
  });

  test('lists at least one user after signing one up', async ({ page }) => {
    const email = `directorytest_${Date.now()}@test.com`;

    // Create a user so the directory has something in it
    await page.goto(`${BASE_URL}/signup`);
    await page.locator('input[type="text"]').first().fill('Directory Test User');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(/\/dashboard/);

    await page.goto(`${BASE_URL}/users`);
    await expect(page.getByText('Directory Test User')).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('shows "No users found" when the API returns an empty list', async ({ page }) => {
    await page.route('**/api/users', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto(`${BASE_URL}/users`);
    await expect(page.getByText(/no users found/i)).toBeVisible();
  });

  test('shows an error state if the API call fails', async ({ page }) => {
    await page.route('**/api/users', (route) => route.abort());

    await page.goto(`${BASE_URL}/users`);
    await expect(page.getByText(/error loading users/i)).toBeVisible();
  });
});
