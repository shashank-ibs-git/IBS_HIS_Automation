const { expect } = require('@playwright/test');

class PaymentPage {
  constructor(page) {
    this.page = page;
    // Breadcrumb header on confirm input or payment page (retain existing selector if reused)
    this.confirmInputBreadcrumbHeader = page.locator('(//ol//p)[2]');
    // Payment amount (total)
    this.totalAmountLocator = page.locator('dl.amount dd.totalAmount');
    // Card payment radio & label (radio may be visually hidden; clicking label is safer)
    this.cardPaymentRadio = page.locator('input#opp[name="method"]');
    this.cardPaymentLabel = page.locator('label[for="opp"]');
    // Proceed button: snapshot shows <button class="next-btn js-temporary-disabled">決済へ進む...</button>
    this.proceedToPaymentButton = page.locator('button.next-btn');
    this.DEFAULT_TIMEOUT = 10000;
  }

  async getTotalAmount() {
    await this.totalAmountLocator.waitFor({ state: 'visible' });
    return await this.totalAmountLocator.innerText();
  }

  async selectCardPaymentIfNotChecked(timeout = this.DEFAULT_TIMEOUT) {
    // Wait for label (visible element) rather than hidden radio
    await this.cardPaymentLabel.waitFor({ state: 'visible', timeout });
    const already = await this.cardPaymentRadio.isChecked();
    if (already) return;
    await this.cardPaymentLabel.click();
  }

  async waitForProceedEnabled(timeout = this.DEFAULT_TIMEOUT) {
    await this.proceedToPaymentButton.waitFor({ state: 'visible', timeout });
    // Use page.waitForFunction with a selector string to avoid serialization issues
    await this.page.waitForFunction(() => {
      const btn = document.querySelector('button.next-btn');
      return btn && !btn.classList.contains('js-temporary-disabled');
    }, { timeout });
    await expect(this.proceedToPaymentButton).toBeEnabled({ timeout });
  }

  async proceedToEnterPayment(timeout = this.DEFAULT_TIMEOUT) {
    //await this.waitForProceedEnabled(timeout);
    await this.proceedToPaymentButton.waitFor({ state: 'visible', timeout });
    await this.proceedToPaymentButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { PaymentPage };