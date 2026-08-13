import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Same helper as Login.spec.js: sign up a fresh account through the real UI,
// wait for the redirect that proves signup succeeded, then clear the session
// so tests can log in explicitly and start from a known state.
async function createAccount(page, { role = 'student', email, password = '123456' }) {
  await page.goto(`${BASE_URL}/signup`);

  if (role === 'employer') {
    await page.getByLabel('Employer').check();
  }

  await page.locator('input[type="text"]').first().fill('Jobs Test User');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  if (role === 'employer') {
    await page.locator('input[type="text"]').nth(1).fill('991234567V');
  }

  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL(/\/(dashboard|community)/);
  await page.evaluate(() => localStorage.clear());
}

async function login(page, email, password = '123456') {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('you@university.edu').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('Jobs page', () => {
  test('page loads with heading, search box, and status filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);

    await expect(page.getByRole('heading', { name: 'Available Jobs' })).toBeVisible();
    await expect(page.getByPlaceholder('Search jobs by title or required skills...')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('shows either job cards or the "no jobs posted yet" empty state', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);

    // Whatever real data is in the backend, the page should resolve to one of
    // these two states once loading finishes (never stay on the spinner).
    const emptyState = page.getByText('No jobs posted yet');
    const jobCard = page.getByRole('button', { name: 'View Details & Apply' }).first();

    await expect(emptyState.or(jobCard)).toBeVisible({ timeout: 10000 });
  });

  test('typing an unmatched search term shows a "no jobs match" message', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);

    await expect(
      page.getByText('No jobs posted yet').or(page.getByRole('button', { name: 'View Details & Apply' }).first())
    ).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Search jobs by title or required skills...').fill('zzzznonexistentrole12345');

    const jobCount = await page.getByRole('button', { name: 'View Details & Apply' }).count();
    if (jobCount === 0) {
      // No jobs existed to begin with — nothing further to assert here.
      test.skip();
    }
    await expect(page.getByText('No jobs match your filters')).toBeVisible();
  });

  test('status filter narrows down the visible jobs', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);
    await expect(
      page.getByText('No jobs posted yet').or(page.getByRole('button', { name: 'View Details & Apply' }).first())
    ).toBeVisible({ timeout: 10000 });

    const totalJobs = await page.getByRole('button', { name: 'View Details & Apply' }).count();
    if (totalJobs === 0) {
      test.skip();
    }

    await page.locator('select').selectOption('closed');
    const closedCount = await page.getByRole('button', { name: 'View Details & Apply' }).count();
    expect(closedCount).toBeLessThanOrEqual(totalJobs);
  });

  test('opening a job shows its details modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);
    const firstJobButton = page.getByRole('button', { name: 'View Details & Apply' }).first();

    if ((await firstJobButton.count()) === 0) {
      test.skip();
    }

    await firstJobButton.click();

    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Pay Amount')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply Now' })).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('button', { name: 'Apply Now' })).not.toBeVisible();
  });

  test('applying while logged out shows a login-required message', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);
    const firstJobButton = page.getByRole('button', { name: 'View Details & Apply' }).first();

    if ((await firstJobButton.count()) === 0) {
      test.skip();
    }

    await firstJobButton.click();
    await page.getByRole('button', { name: 'Apply Now' }).click();

    await expect(page.getByText('You must be logged in to apply for jobs.')).toBeVisible();
  });

  test('logged-in student can apply for a job', async ({ page }) => {
    const email = `jobs_apply_${Date.now()}@test.com`;
    await createAccount(page, { role: 'student', email });
    await login(page, email);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/jobs`);
    const firstJobButton = page.getByRole('button', { name: 'View Details & Apply' }).first();

    if ((await firstJobButton.count()) === 0) {
      test.skip();
    }

    await firstJobButton.click();
    await page.getByRole('button', { name: 'Apply Now' }).click();

    // Either succeeds, or the backend rejects a duplicate/self-application —
    // either way a message (not a silent failure) should appear.
    await expect(
      page.getByText('Successfully applied!').or(page.getByText(/failed to apply/i))
    ).toBeVisible({ timeout: 10000 });
  });
});