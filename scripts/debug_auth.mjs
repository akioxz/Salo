import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  
  // Listen for failed requests
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });
  
  page.on('response', async response => {
    if (!response.ok()) {
      console.log('RESPONSE ERROR:', response.url(), response.status(), await response.text().catch(() => ''));
    }
  });

  console.log('Navigating to Vercel app...');
  await page.goto('https://salofam.vercel.app/welcome');
  
  console.log('Clicking Dry Run...');
  await page.getByText('Subukan bilang Guest').click();
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
