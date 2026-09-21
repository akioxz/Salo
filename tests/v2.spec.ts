import { test, expect } from '@playwright/test';

test.describe('V2 Features: Covered Loop & Padala', () => {
  test('should allow creating a Need, and then covering it with an Expense', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=Salo')).toBeVisible();

    // 1. Create a Need
    await page.locator('button[aria-label="Create Post"]').click();
    
    // Select Need (it's default, but let's click it)
    await page.locator('button', { hasText: 'need' }).click();
    
    const needAmount = "1500";
    const needDesc = `Need med maintenance ${Date.now()}`;
    
    await page.locator('input[placeholder="Amount (₱)"]').fill(needAmount);
    await page.locator('textarea').fill(needDesc);
    
    await page.locator('button', { hasText: /^Post to Feed$/ }).click();
    await expect(page.locator('h2:has-text("Create Post")')).not.toBeVisible();

    // Verify Need is in feed
    const needContainer = page.locator('article', { hasText: needDesc }).first();
    await expect(needContainer).toBeVisible();
    await expect(needContainer.locator(`text=₱1,500`)).toBeVisible();

    // 2. Create an Expense to Cover the Need
    await page.locator('button[aria-label="Create Post"]').click();
    
    // Select Expense
    await page.locator('button', { hasText: 'expense' }).click();
    
    const expAmount = "1500";
    const expDesc = `Bought the meds ${Date.now()}`;
    
    await page.locator('input[placeholder="Amount (₱)"]').fill(expAmount);
    
    // Select the Need we just created from the dropdown
    const selectBox = page.locator('select');
    await selectBox.selectOption({ label: `${needDesc} (₱${needAmount})` });
    
    await page.locator('textarea').fill(expDesc);
    await page.locator('button', { hasText: /^Post to Feed$/ }).click();
    await expect(page.locator('h2:has-text("Create Post")')).not.toBeVisible();

    // 3. Verify the Expense is in feed
    const expContainer = page.locator('article', { hasText: expDesc }).first();
    await expect(expContainer).toBeVisible();

    // 4. Verify the Original Need now has the "Covered na!" badge
    const updatedNeedContainer = page.locator('article', { hasText: needDesc }).first();
    await expect(updatedNeedContainer.locator('text=Covered na!')).toBeVisible();
  });

  test('should allow creating a Padala post', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.locator('button[aria-label="Create Post"]').click();
    
    // Select Padala
    await page.locator('button', { hasText: 'padala' }).click();
    
    const padalaAmount = "20000";
    const padalaDesc = `Bonus month padala ${Date.now()}`;
    
    await page.locator('input[placeholder="Amount (₱)"]').fill(padalaAmount);
    await page.locator('textarea').fill(padalaDesc);
    
    await page.locator('button', { hasText: /^Post to Feed$/ }).click();
    await expect(page.locator('h2:has-text("Create Post")')).not.toBeVisible();

    // Verify Padala is in feed with correct styling
    const padalaContainer = page.locator('article', { hasText: padalaDesc }).first();
    await expect(padalaContainer).toBeVisible();
    
    // Check if + sign exists for padala amounts
    await expect(padalaContainer.locator(`text=+₱20,000`)).toBeVisible();
  });
});
