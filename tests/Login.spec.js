import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper: create a fresh account of a given role through the signup page,
// then log out, so each login test has a known, working set of credentials.
async function createAccount(page, { role = 'student', email, password = '123456' }) {
  await page.goto(`${BASE_URL}/signup`);

  if (role === 'employer') {
    await page.getByLabel('Employer').check();
  }

  await page.locator('input[type="text"]').first().fill('Login Test User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  if (role === 'employer') {
    // accountType defaults to "individual" -> ID Number field
    await page.locator('input[type="text"]').nth(1).fill('991234567V');
  }

  await page.getByRole('button', { name: /sign up/i }).click();

  // Wait for the redirect that confirms signup succeeded, then log out
  await page.waitForURL(/\/(dashboard|community)/);
  await page.evaluate(() => localStorage.clear());
}

test.describe('Login page', () => {
  test('page loads with email and password fields and a submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    await expect(page.getByPlaceholder('you@university.edu')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('student logs in and is redirected to /dashboard', async ({ page }) => {
    const email = `student_login_${Date.now()}@test.com`;
    await createAccount(page, { role: 'student', email });

    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@university.edu').fill(email);
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('employer logs in and is redirected to /community', async ({ page }) => {
    const email = `employer_login_${Date.now()}@test.com`;
    await createAccount(page, { role: 'employer', email });

    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@university.edu').fill(email);
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(`${BASE_URL}/community`);
  });

  test('shows error message for a non-existent email', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@university.edu').fill('doesnotexist@test.com');
    await page.getByPlaceholder('••••••••').fill('somepassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // authController.login returns "Invalid email or password."
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();

    // Should stay on the login page, not redirect anywhere
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('shows error message for a wrong password on an existing account', async ({ page }) => {
    const email = `wrongpass_${Date.now()}@test.com`;
    await createAccount(page, { role: 'student', email });

    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@university.edu').fill(email);
    await page.getByPlaceholder('••••••••').fill('wrong-password-here');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('does not submit with empty fields (HTML5 required validation)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByRole('button', { name: /sign in/i }).click();

    // Browser-native "required" validation blocks submission,
    // so we should still be on /login with no error banner from the server
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByText(/invalid email or password/i)).not.toBeVisible();
  });

  test('button shows loading state while submitting', async ({ page }) => {
    const email = `loading_state_${Date.now()}@test.com`;
    await createAccount(page, { role: 'student', email });

    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@university.edu').fill(email);
    await page.getByPlaceholder('••••••••').fill('123456');

    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Button text flips to "Signing in..." and is disabled while the request is in flight
    await expect(page.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  test('"create a new account" link navigates to /signup', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('link', { name: /create a new account/i }).click();

    await expect(page).toHaveURL(`${BASE_URL}/signup`);
  });
});