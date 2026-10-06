import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const outDir = path.join(process.cwd(), 'portfolio-shots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ 
    viewport: { width: 1280, height: 900 }
  });

  console.log('1. Capturing Welcome Page...');
  await page.goto('http://localhost:3000/welcome', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, '1_Welcome.png'), fullPage: false });

  console.log('Logging in as Guest...');
  await page.getByText('Subukan bilang Guest').click();
  
  console.log('Completing Onboarding...');
  // It updates state on /welcome instead of navigating
  await page.getByText('Gumawa ng Tahanan').waitFor({ state: 'visible' });
  await page.getByText('Gumawa ng Tahanan').click();
  
  await page.getByPlaceholder(/Pangalan/i).fill('Guest User');
  await page.getByPlaceholder(/Role/i).fill('Portfolio Viewer');
  
  await page.getByRole('button', { name: /Gumawa ng Invite Link/i }).click();
  
  // Wait for the "showCode" step to appear
  await page.waitForTimeout(2000);
  
  console.log('Household created. Navigating to Feed...');
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  // Wait extra time for animations
  await page.waitForTimeout(2000);

  console.log('2. Capturing Home Feed...');
  await page.screenshot({ path: path.join(outDir, '2_Home_Feed.png'), fullPage: false });

  const navItems = page.locator('.sticky.bottom-0 .grid > div');

  console.log('3. Capturing Box Tab...');
  await navItems.nth(1).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '3_Balikbayan_Box.png'), fullPage: false });

  console.log('4. Capturing Analytics Tab...');
  await navItems.nth(3).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '4_Analytics.png'), fullPage: false });

  console.log('5. Capturing Create Post Modal...');
  await navItems.nth(0).click(); // Go back home
  await page.waitForTimeout(1000);
  await navItems.nth(2).click(); // Click Create (+)
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '5_Create_Post.png'), fullPage: false });

  console.log('6. Capturing Profile Modal...');
  // Click overlay to close create modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  await navItems.nth(4).click(); // Click Profile
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '6_Profile_Settings.png'), fullPage: false });

  console.log('Screenshots saved to /portfolio-shots');
  await browser.close();
})();
