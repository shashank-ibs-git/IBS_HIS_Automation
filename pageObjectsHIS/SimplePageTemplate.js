/**
 * Simple Page Object Template
 * Copy this for quick page object creation from codegen output
 * 
 * Usage:
 * 1. Replace "SimplePage" with your page name
 * 2. Replace selectors with actual locators from codegen
 * 3. Add methods based on actions you need
 */

class SimplePage {
  constructor(page) {
    this.page = page;
    
    // === SELECTORS (paste from codegen) ===
    this.elementName = page.locator('selector-from-codegen');
    this.button = page.locator('button');
    this.input = page.locator('input');
    
    // === COMMON ELEMENTS ===
    this.loadingSpinner = page.locator('.spinner, .loading');
    this.errorMessage = page.locator('.error, .alert-error');
  }

  // === NAVIGATION ===
  async goto() {
    await this.page.goto('/your-url');
    await this.waitForLoad();
  }

  // === ACTIONS (add methods based on what you need to do) ===
  async clickButton() {
    await this.button.click();
  }

  async fillInput(text) {
    await this.input.fill(text);
  }

  // === GETTERS ===
  async getText() {
    return await this.elementName.textContent();
  }

  // === VALIDATION ===
  async isLoaded() {
    return await this.elementName.isVisible();
  }

  // === UTILITIES ===
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // No spinner present
    }
  }
}

module.exports = SimplePage;

/* 
QUICK CODEGEN WORKFLOW:
1. Run: npx playwright codegen https://your-url
2. Copy generated selectors
3. Paste into this template
4. Add methods for the actions you recorded
5. Save as YourPageName.js

EXAMPLE:
// From codegen:
page.locator('#username').fill('test');
page.locator('#password').fill('password');
page.locator('button[type="submit"]').click();

// Becomes:
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }
  
  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }
}
*/