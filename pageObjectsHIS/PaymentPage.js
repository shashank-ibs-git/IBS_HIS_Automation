class PaymentPage {
  constructor(page) {
    this.page = page;
        this.confirmInputBreadcrumbHeader = page.locator("(//ol//p)[2]");
    this.proceedToPaymentButton = page.locator("#proceed-payment");
    this.totalAmountLocator = page.locator("dl.amount dd.totalAmount");
    this.cardPaymentRadio = page.locator("//span[text()='カード支払い']//parent::span//input[@type='radio']");

  }

async selectCardPaymentIfNotChecked() {
  // wait until it's ready to interact
  await this.cardPaymentRadio.waitFor({ state: 'visible' });
  // check only if not already selected
  const isChecked = await this.cardPaymentRadio.isChecked();
  if (!isChecked) {
    await this.cardPaymentRadio.check();
  }
}

    }

module.exports = { PaymentPage };