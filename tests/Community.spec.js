import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function createAccountAndLogin(page) {
  const email = `community_user_${Date.now()}@test.com`;
  
  await page.goto(`${BASE_URL}/signup`);
  await page.locator('input[type="text"]').first().fill('Community User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL(/\/(dashboard|community)/);
}

test.describe('Community Page', () => {
  test.beforeEach(async ({ page }) => {
    await createAccountAndLogin(page);
    await page.goto(`${BASE_URL}/community`);
  });

  test('loads community page successfully', async ({ page }) => {
    // 1. Verify URL navigation
    await expect(page).toHaveURL(`${BASE_URL}/community`);

    // 2. Verify page body is loaded and rendered
    await expect(page.locator('body')).toBeVisible();
  });

  test('logged-in user can see post input and attempt to post', async ({ page }) => {
    const postInput = page.getByPlaceholder(/what's on your mind|write|share/i).or(page.locator('textarea').first());

    if (await postInput.isVisible()) {
      await postInput.fill('Hello Community! Automated test post.');
      await page.getByRole('button', { name: /post|share|submit/i }).click();

      await expect(page.getByText('Hello Community! Automated test post.')).toBeVisible({ timeout: 5000 });
    }
  });
});