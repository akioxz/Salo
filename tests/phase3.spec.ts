import { test, expect } from '@playwright/test';

test.describe('Phase 3 Features: Voice Notes & Balikbayan Box', () => {
  test('should allow creating a post with voice note mock and toggling the Balikbayan Box', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('http://localhost:3000');
    
    // Wait for feed to load
    await expect(page.locator('text=Salo')).toBeVisible();

    // 2. Open Create Post modal
    await page.locator('button[aria-label="Create Post"]').click();
    await expect(page.locator('h2:has-text("Create Post")')).toBeVisible();

    // Check if AudioRecorder UI is visible
    await expect(page.locator('text="Hold to record \'Sabi Mo\'"')).toBeVisible();
    
    // Close modal
    await page.locator('button[aria-label="Close"]').click();
    await expect(page.locator('h2:has-text("Create Post")')).not.toBeVisible();

    // 3. Switch to Box Tab
    await page.locator('text=Box').click();
    await expect(page.locator('h2:has-text("Balikbayan Box")')).toBeVisible();

    // 4. Add an item to the box
    const uniqueItem = `Wish ${Date.now()}`;
    await page.locator('input[placeholder="E.g., Sapatos ni bunso"]').fill(uniqueItem);
    await page.locator('input[placeholder="₱"]').fill('1500');
    await page.locator('button:has-text("Add")').click();

    const itemRow = page.locator('div', { hasText: uniqueItem }).first();
    await expect(itemRow).toBeVisible();
  });
});
