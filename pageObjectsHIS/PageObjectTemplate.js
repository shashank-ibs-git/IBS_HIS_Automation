/**
 * Page Object Template - Copy and customize this template for new page objects
 * 
 * Instructions:
 * 1. Replace "PageObjectTemplate" with your actual page/component name (e.g., LoginPage, CheckoutPage)
 * 2. Replace "page-identifier" with the actual page identifier/URL pattern
 * 3. Update selectors in the constructor to match your page elements
 * 4. Implement the action methods based on your page functionality
 * 5. Add validation methods as needed
 * 6. Update JSDoc comments with actual descriptions
 * 
 * Naming conventions:
 * - Class: PascalCase (e.g., SearchResultsPage)
 * - Properties: camelCase (e.g., submitButton, userNameField)
 * - Methods: camelCase, use verbs (e.g., clickSubmit, fillUserName, getUserName)
 * - Private methods: prefix with underscore (e.g., _waitForPageLoad)
 */

class PageObjectTemplate {
  /**
   * Constructor - Define all locators here
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
    
    // === LOCATORS ===
    // Group related elements together with comments
    
    // Header elements
    this.headerLogo = page.locator('[data-testid="header-logo"]');
    this.navigationMenu = page.locator('.nav-menu');
    this.userProfileDropdown = page.locator('[data-testid="user-profile"]');
    
    // Main content elements
    this.pageTitle = page.locator('h1, .page-title');
    this.mainContent = page.locator('main, .main-content');
    this.loadingSpinner = page.locator('.spinner, .loading');
    
    // Form elements (if applicable)
    this.form = page.locator('form');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button[type="button"]:has-text("Cancel")');
    
    // Status/message elements
    this.successMessage = page.locator('.success, .alert-success');
    this.errorMessage = page.locator('.error, .alert-error');
    this.warningMessage = page.locator('.warning, .alert-warning');
    
    // Example dynamic selectors (use sparingly)
    // this.dynamicButton = (buttonText) => page.locator(`button:has-text("${buttonText}")`);
    // this.tableRow = (rowIndex) => page.locator(`table tbody tr:nth-child(${rowIndex})`);
  }

  // === NAVIGATION METHODS ===
  
  /**
   * Navigate to this page
   * @param {Object} options - Navigation options
   * @param {boolean} options.waitForLoad - Whether to wait for page load (default: true)
   * @returns {Promise<void>}
   */
  async goto(options = { waitForLoad: true }) {
    await this.page.goto('/page-identifier'); // Replace with actual URL
    if (options.waitForLoad) {
      await this._waitForPageLoad();
    }
  }

  /**
   * Check if currently on this page
   * @returns {Promise<boolean>}
   */
  async isOnPage() {
    try {
      // Replace with actual page identification logic
      await this.page.waitForURL('**/page-identifier', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // === ACTION METHODS ===
  
  /**
   * Click submit button and wait for response
   * @returns {Promise<void>}
   */
  async clickSubmit() {
    await this.submitButton.click();
    await this._waitForResponse();
  }

  /**
   * Click cancel button
   * @returns {Promise<void>}
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Fill form fields with provided data
   * @param {Object} data - Form data object
   * @param {string} data.fieldName - Example field
   * @returns {Promise<void>}
   */
  async fillForm(data) {
    // Example implementation - customize based on your form fields
    if (data.fieldName) {
      await this.page.fill('[name="fieldName"]', data.fieldName);
    }
    // Add more fields as needed
  }

  // === GETTER METHODS ===
  
  /**
   * Get page title text
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.pageTitle.textContent();
  }

  /**
   * Get current status message
   * @returns {Promise<{type: string, message: string}|null>}
   */
  async getStatusMessage() {
    try {
      if (await this.successMessage.isVisible()) {
        return {
          type: 'success',
          message: await this.successMessage.textContent()
        };
      }
      if (await this.errorMessage.isVisible()) {
        return {
          type: 'error',
          message: await this.errorMessage.textContent()
        };
      }
      if (await this.warningMessage.isVisible()) {
        return {
          type: 'warning',
          message: await this.warningMessage.textContent()
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Extract data from the page
   * @returns {Promise<Object>}
   */
  async getPageData() {
    // Example implementation - customize based on your page
    return {
      title: await this.getPageTitle(),
      status: await this.getStatusMessage(),
      // Add more data extraction as needed
    };
  }

  // === VALIDATION METHODS ===
  
  /**
   * Validate that the page loaded correctly
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   * @returns {Promise<boolean>}
   */
  async validatePageLoaded(timeout = 30000) {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout });
      await this._waitForLoadingToComplete();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if form is valid and can be submitted
   * @returns {Promise<boolean>}
   */
  async isFormValid() {
    try {
      const isEnabled = await this.submitButton.isEnabled();
      const hasErrors = await this.errorMessage.isVisible();
      return isEnabled && !hasErrors;
    } catch {
      return false;
    }
  }

  // === WAIT METHODS ===
  
  /**
   * Wait for the page to fully load
   * @private
   * @returns {Promise<void>}
   */
  async _waitForPageLoad() {
    // Wait for network idle and key elements
    await this.page.waitForLoadState('networkidle');
    await this.pageTitle.waitFor({ state: 'visible' });
    await this._waitForLoadingToComplete();
  }

  /**
   * Wait for loading spinners to disappear
   * @private
   * @returns {Promise<void>}
   */
  async _waitForLoadingToComplete() {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // Spinner might not be present, continue
    }
  }

  /**
   * Wait for response after action (e.g., form submission)
   * @private
   * @returns {Promise<void>}
   */
  async _waitForResponse() {
    // Wait for either success or error message to appear
    await this.page.waitForFunction(() => {
      const success = document.querySelector('.success, .alert-success');
      const error = document.querySelector('.error, .alert-error');
      return success || error;
    }, { timeout: 15000 });
  }

  // === UTILITY METHODS ===
  
  /**
   * Take screenshot of this page
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for specific element to be ready for interaction
   * @param {import('playwright').Locator} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForElementReady(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.waitFor({ state: 'attached', timeout });
    // Wait for element to be enabled if it's an input/button
    try {
      // Check if element is interactive
      const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
      if (['input', 'button', 'select', 'textarea'].includes(tagName)) {
        // Wait for element to be enabled
        await this.page.waitForFunction(
          (element) => !element.hasAttribute('disabled'),
          await locator.elementHandle(),
          { timeout: 5000 }
        );
      }
    } catch {
      // Element might not be interactive, continue
    }
  }

  /**
   * Scroll element into view
   * @param {import('playwright').Locator} locator - Element to scroll to
   * @returns {Promise<void>}
   */
  async scrollToElement(locator) {
    await locator.scrollIntoViewIfNeeded();
  }
}

module.exports = PageObjectTemplate;

// === USAGE EXAMPLE ===
/*

// 1. Copy this file and rename it (e.g., LoginPage.js)
// 2. Replace class name and customize:

class LoginPage {
  constructor(page) {
    this.page = page;
    
    // Customize selectors for your page
    this.emailField = page.locator('#email');
    this.passwordField = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
    await this._waitForPageLoad();
  }

  async login(email, password) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    await this._waitForResponse();
  }

  // ... implement other methods
}

// 3. Add to your POManager:
class POManager {
  constructor(page) {
    this.page = page;
  }

  getLoginPage() {
    return new LoginPage(this.page);
  }
}

// 4. Use in your tests:
this.loginPage = this.poManager.getLoginPage();
await this.loginPage.goto();
await this.loginPage.login('user@example.com', 'password');

*/