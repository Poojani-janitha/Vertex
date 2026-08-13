import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Contact page', () => {
  test('shows the contact form with all fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    await expect(page.getByRole('heading', { name: /get in touch/i })).toBeVisible();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('you@university.edu')).toBeVisible();
    await expect(page.getByPlaceholder(/inquiry \/ verification/i)).toBeVisible();
    await expect(page.getByPlaceholder(/describe your inquiry/i)).toBeVisible();
  });

  test('submitting the form shows a loading state then a success message', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    await page.getByPlaceholder('John Doe').fill('Kasun Perera');
    await page.getByPlaceholder('you@university.edu').fill('kasun@test.com');
    await page.getByPlaceholder(/inquiry \/ verification/i).fill('Employer verification delay');
    await page.getByPlaceholder(/describe your inquiry/i).fill('My employer account has been pending for 3 days.');

    const submitButton = page.getByRole('button', { name: /send message enquiry/i });
    await submitButton.click();

    // Contact.jsx fakes a 1200ms delay and flips the button text while "submitting"
    await expect(page.getByRole('button', { name: /submitting form/i })).toBeVisible();

    // After the simulated delay, a success banner appears and the form clears
    await expect(page.getByText(/thank you for contacting us/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('');
  });

  test('does not submit with required fields empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    await page.getByRole('button', { name: /send message enquiry/i }).click();

    // HTML5 "required" should block submission — no success message appears
    await expect(page.getByText(/thank you for contacting us/i)).not.toBeVisible();
  });
});
