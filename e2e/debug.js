import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  console.log("URL after goto:", page.url());
  
  const loginButton = page.locator('button:has-text("Mag-login gamit ang Google")');
  await loginButton.click();
  
  await page.waitForTimeout(4000);
  console.log("URL after clicking login:", page.url());
  
  const html = await page.content();
  if (html.includes("Accept") || html.includes("Sign in")) {
      console.log("Found OAuth Mock page");
      const acceptButton = page.locator('button').first();
      await acceptButton.click();
      await page.waitForTimeout(4000);
      console.log("URL after accepting mock oauth:", page.url());
  } else {
      console.log("Mock page not found. Content:");
      console.log(html.substring(0, 1000));
  }
  
  const bodyText = await page.locator('body').innerText();
  console.log("Body text:");
  console.log(bodyText);
  
  await browser.close();
})();
