import { test, expect } from '@playwright/test';
import { WelcomePage } from './pages/WelcomePage';

test.describe('Google Auth and Household Creation', () => {
  test('User can login via mock Google and create a household', async ({ page }) => {
    const welcomePage = new WelcomePage(page);
    
    // 1. Go to the app & redirect to welcome
    await welcomePage.goto();
    
    // 2 & 3. Login with mock provider
    await welcomePage.loginWithMockGoogle();
    
    // 4 & 5. Create household
    await welcomePage.createHousehold('Playwright Test', 'Tester');
    
    // 6. Proceed to feed
    await welcomePage.proceedToFeed();
    
    // 7. Verify dashboard elements
    await expect(page.getByText('Salo')).toBeVisible();
    await expect(page.getByText('Mag-post sa inyong pamilya...')).toBeVisible();
  });
});
