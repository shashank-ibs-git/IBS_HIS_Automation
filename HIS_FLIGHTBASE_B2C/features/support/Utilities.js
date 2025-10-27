
class Utilities {
  constructor(page) {
    this.page = page;
  }

  // ✅ waits for spinner to disappear (hidden or removed)
  async waitForSpinnerToDisappear(timeout = 60000) {
    const spinner = this.page.locator("//div[@class='his-desktop']//div[@class='spinner']");
    console.log('⏳ Waiting for spinner to disappear...');

    const start = Date.now();
    try {
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      await spinner.waitFor({ state: 'detached', timeout });
    }
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✅ Spinner disappeared after ${duration}s`);
  }
}

module.exports = { Utilities };
