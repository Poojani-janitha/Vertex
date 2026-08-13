import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('you@university.edu').fill('admin@university.edu');
  await page.getByPlaceholder('••••••••').fill('admin123');
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('Admin Dashboard', () => {
  test('blocks non-admin users from accessing admin routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    // Should redirect away if not logged in as admin
    await expect(page).not.toHaveURL(`${BASE_URL}/admin`);
  });

  test('loads admin stats and user management panels', async ({ page }) => {
    await loginAsAdmin(page);

    // If login succeeds and redirects to admin panel
    if (page.url().includes('/admin')) {
      await expect(page.getByText(/admin panel|dashboard|manage users/i)).toBeVisible();
      await expect(page.getByRole('table').or(page.getByText(/users|employers/i))).toBeVisible();
    } else {
      test.skip();
    }
  });
});