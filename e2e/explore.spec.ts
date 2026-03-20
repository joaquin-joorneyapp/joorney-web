import { test, expect } from '@playwright/test';

async function seedAuth(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    const user = {
      isAuthenticated: true,
      isAdmin: false,
      token: 'test-jwt-token',
      abilities: [],
      name: 'Test User',
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'test-jwt-token');
  });
}

test.describe('Explore page — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows the toggle button and can switch to map view', async ({ page }) => {
    await seedAuth(page);
    await page.goto('/explore');

    const listButton = page.getByRole('button', { name: 'list view' });
    const mapButton = page.getByRole('button', { name: 'map view' });

    await expect(listButton).toBeVisible();
    await expect(mapButton).toBeVisible();

    await mapButton.click();
    await expect(mapButton).toBeVisible();
  });

  test('shows the page title', async ({ page }) => {
    await seedAuth(page);
    await page.goto('/explore');

    await expect(page.getByText('Nearby Activities')).toBeVisible();
  });
});
