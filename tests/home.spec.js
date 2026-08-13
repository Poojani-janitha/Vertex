import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Home page', () => {
  test('shows hero heading and Browse Jobs button', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await expect(page.getByRole('heading', { name: /connecting students to/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /browse jobs/i })).toBeVisible();
  });

  test('"Browse Jobs" button navigates to /jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('link', { name: /browse jobs/i }).click();

    await expect(page).toHaveURL(`${BASE_URL}/jobs`);
  });
});

test.describe('Navbar', () => {
  test('shows Log in and Sign up links when logged out', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await expect(page.getByRole('link', { name: /^log in$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^sign up$/i })).toBeVisible();
  });

  test('main nav links go to the right pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.getByRole('link', { name: 'Jobs Board' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/jobs`);

    await page.getByRole('link', { name: 'Directory' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/users`);

    await page.getByRole('link', { name: 'Contact Us' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/contact`);
  });

  test('shows user name and Log out button after login, and logout clears session', async ({ page }) => {
    const email = `navtest_${Date.now()}@test.com`;

    // Sign up (Signup.jsx stores user in localStorage and redirects)
    await page.goto(`${BASE_URL}/signup`);
    await page.locator('input[type="text"]').first().fill('Nav Test User');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.waitForURL(/\/dashboard/);

    // Navbar should now show the logged-in state
    await page.goto(`${BASE_URL}/`);
    await expect(page.getByText(/logged in as/i)).toBeVisible();
    await expect(page.getByText('Nav Test User')).toBeVisible();

    // Log out
    await page.getByRole('button', { name: /log out/i }).click();

    // handleLogout navigates to "/" and clears localStorage
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.getByRole('link', { name: /^log in$/i })).toBeVisible();

    const storedUser = await page.evaluate(() => localStorage.getItem('user'));
    expect(storedUser).toBeNull();
  });
});
