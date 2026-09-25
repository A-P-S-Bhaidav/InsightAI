import { test, expect } from '@playwright/test';

test.describe('InsightAI Core Workflows', () => {
  
  test('Dashboard loads correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if the dashboard is rendered by looking for stat cards
    await expect(page.locator('text=Total Tasks')).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
    await expect(page.locator('text=Data Points')).toBeVisible();
    await expect(page.locator('text=Avg Quality')).toBeVisible();
  });

  test('User can navigate to New Task page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click the "New Task" button in the sidebar or header
    await page.click('a[href="/tasks/new"]');
    
    // Verify we are on the new task page
    await expect(page).toHaveURL(/.*\/tasks\/new/);
    await expect(page.locator('text=Task Title *')).toBeVisible();
  });

  test('User can interact with Settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Verify tabs are present
    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'API Keys' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Usage' })).toBeVisible();
    
    // Switch to API Keys tab
    await page.getByRole('button', { name: 'API Keys' }).click({ force: true });
    await expect(page.getByText('Create API Key')).toBeVisible();
  });
  
});
