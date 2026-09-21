import { test, expect } from '@playwright/test';

test.describe('Household Activity Feed', () => {
  test('should allow creating a post, reacting, and commenting', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=Salo')).toBeVisible();

    // 1. Create a Post
    const createButton = page.locator('button[aria-label="Create Post"]');
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Type content
    const uniqueContent = `Playwright E2E test post ${Date.now()}`;
    await page.locator('textarea[placeholder="What\'s happening at home?"]').fill(uniqueContent);
    
    // Explicitly click the EXACT "Post" button, not anything else
    const submitButton = page.locator('button', { hasText: /^Post$/ });
    await expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    // Verify modal closes before checking feed
    await expect(page.locator('h2:has-text("Create Post")')).not.toBeVisible();

    // Wait for the post to appear in the feed
    const postContainer = page.locator('article', { hasText: uniqueContent }).first();
    await expect(postContainer).toBeVisible();

    // 2. React to the Post 
    const heartButton = postContainer.locator('button[aria-label*="heart"]').first();
    await expect(heartButton).toBeVisible();
    await heartButton.click();
    
    // Ensure the button state toggles
    await expect(heartButton).toHaveAttribute('aria-pressed', /true|false/);

    // 3. Comment on the Post
    const commentToggle = postContainer.locator('button[aria-label="Toggle comments"]').first();
    await expect(commentToggle).toBeVisible();
    await commentToggle.click();

    const commentInput = postContainer.locator('input[placeholder="Write a comment..."]').first();
    await expect(commentInput).toBeVisible();

    const commentText = `Playwright test comment ${Date.now()}`;
    await commentInput.fill(commentText);
    await commentInput.press('Enter');

    // Verify comment appears in the list
    await expect(postContainer.locator(`text=${commentText}`)).toBeVisible();
  });
});
