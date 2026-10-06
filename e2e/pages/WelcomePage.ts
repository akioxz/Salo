import { Page, Locator, expect } from '@playwright/test';

export class WelcomePage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly mockSignInButton: Locator;
  readonly createHouseholdButton: Locator;
  readonly nameInput: Locator;
  readonly roleInput: Locator;
  readonly submitHouseholdButton: Locator;
  readonly copyLinkText: Locator;
  readonly goToFeedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: /Mag-login gamit ang Google/i });
    this.mockSignInButton = page.getByRole('button').first();
    this.createHouseholdButton = page.getByText('Gumawa ng Tahanan');
    this.nameInput = page.getByPlaceholder('Pangalan (Marco)');
    this.roleInput = page.getByPlaceholder('Role (Tatay)');
    this.submitHouseholdButton = page.getByRole('button', { name: /Gumawa ng Invite Link/i });
    this.copyLinkText = page.getByText(/Kopyahin ang Link/i);
    this.goToFeedButton = page.getByRole('button', { name: /Dumiretso sa Hapag-kainan/i });
  }

  async goto() {
    await this.page.goto('http://localhost:3000');
    await expect(this.page).toHaveURL(/.*\/welcome/);
  }

  async loginWithMockGoogle() {
    await expect(this.loginButton).toBeVisible();
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.mockSignInButton.click();
    await this.page.waitForURL(/.*\/welcome/);
  }

  async createHousehold(name: string, role: string) {
    await expect(this.createHouseholdButton).toBeVisible({ timeout: 10000 });
    await this.createHouseholdButton.click();
    
    await this.nameInput.fill(name);
    await this.roleInput.fill(role);
    
    await expect(this.submitHouseholdButton).toBeVisible();
    await this.submitHouseholdButton.click();
    
    await expect(this.copyLinkText).toBeVisible({ timeout: 10000 });
  }

  async proceedToFeed() {
    await expect(this.goToFeedButton).toBeVisible();
    await this.goToFeedButton.click();
    await this.page.waitForURL('http://localhost:3000/');
  }
}
