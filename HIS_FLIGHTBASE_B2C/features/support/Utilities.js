
/**
 * Utilities - small helper functions used across steps/hooks.
 * @class
 */
// Declare ambient properties to silence type complaints in JS runtime injections
/* eslint-disable no-undef */
/** @typedef {{__reqsTracked?:boolean,__pending?:number,__moInstalled?:boolean,__mutationFlag?:number}} WindowWithTracking */

class Utilities {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for the site spinner to disappear (either hidden or detached).
   * @param {number} [timeout=60000]
   */
  async waitForSpinnerToDisappear(timeout = 60000) {
    const spinner = this.page.locator("//div[@class='his-desktop']//div[@class='spinner']");
    //console.log('⏳ Waiting for spinner to disappear...');

    const start = Date.now();
    try {
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      await spinner.waitFor({ state: 'detached', timeout });
    }
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    //console.log(`✅ Spinner disappeared after ${duration}s`);
  }

  async waitForPaymentSpinnerToDisappear(timeout = 60000) {
    const spinner = this.page.locator("#spinner");
    //console.log('⏳ Waiting for payment spinner to disappear...');

    const start = Date.now();
    try {
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      await spinner.waitFor({ state: 'detached', timeout });
    }
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    //console.log(`✅ Spinner disappeared after ${duration}s`);
  }

  // Wait until the page is "stable": basic load + optional network idle + short pause
  async waitForPageStability({ pauseMs = 500, timeout = 25000 } = {}) {
    const page = this.page;
    try { await page.waitForLoadState('domcontentloaded', { timeout }); } catch {}
    try { await page.waitForLoadState('networkidle', { timeout }); } catch {}
    await page.waitForTimeout(pauseMs);
  }
}



module.exports = { Utilities };
