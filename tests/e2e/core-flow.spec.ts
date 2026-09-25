import { test, expect } from '@playwright/test';

test.describe('InsightAI Core Workflows', () => {
  
  test('Dashboard loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the dashboard header is visible
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
    
    // Check if the main stat cards are rendered
    await expect(page.locator('text=Active Tasks')).toBeVisible();
    await expect(page.locator('text=Total Data Points')).toBeVisible();
    await expect(page.locator('text=Avg Quality Score')).toBeVisible();
  });

  test('User can navigate to New Task page', async ({ page }) => {
    await page.goto('/');
    
    // Click the "New Task" button in the sidebar or header
    await page.click('a[href="/tasks/new"]');
    
    // Verify we are on the new task page
    await expect(page).toHaveURL(/.*\/tasks\/new/);
    await expect(page.locator('h1', { hasText: 'Create Smart Task' })).toBeVisible();
  });

  test('User can interact with Settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Verify tabs are present
    await expect(page.locator('button', { hasText: 'Profile' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'API Keys' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Usage' })).toBeVisible();
    
    // Switch to API Keys tab
    await page.click('button:has-text("API Keys")');
    await expect(page.locator('h3', { hasText: 'Create API Key' })).toBeVisible();
  });
  
});
