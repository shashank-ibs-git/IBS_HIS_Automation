class EnterPaymentPage {
  constructor(page) {
    this.page = page;
    this.finalAmountLocator = page.locator("//dl[@class='amount']/dd");
     this.cardNo = page.locator('#cardNo');                               // text
    this.expirationYear = page.locator('#expirationYear');               // select
    this.expirationMonth = page.locator('#expirationMonth');             // select
    this.numberOfPayments = page.locator('#numberOfPayments');           // select
    this.cardHolderName = page.locator('#cardHolderName');               // text
    this.securityCode = page.locator('#securityCode');                   // text
  }

  async getFinalAmount() {
    await this.finalAmountLocator.waitFor({ state: 'visible' });
    return await this.finalAmountLocator.innerText();
  }

   /**
   * Fills the credit card form.
   * All params are strings or numbers that can be stringified.
   * @param {{
   *   cardNo: string,
   *   expYear: string|number,
   *   expMonth: string|number,   // 1..12 (no leading zero needed)
   *   payments?: string|number,  // defaults to '1'
   *   holderName: string,
   *   cvc: string|number         // 4 digits
   * }} data
   */
  async fillCreditCard(data) {
    const {
      cardNo,
      expYear,
      expMonth,
      payments = '1',
      holderName,
      cvc
    } = data;

    // --- normalize & validate ---
    const normalizedCard = String(cardNo ?? '').replace(/\D/g, ''); // keep only 0-9
    if (!/^[0-9]{16}$/.test(normalizedCard)) {
      throw new Error('Card number must be exactly 16 single-byte digits (0-9).');
    }

    const monthStr = String(expMonth);
    if (!/^(?:[1-9]|1[0-2])$/.test(monthStr)) {
      throw new Error('Expiration month must be 1–12.');
    }

    const cvcStr = String(cvc);
    if (!/^[0-9]{4}$/.test(cvcStr)) {
      throw new Error('Security code must be exactly 4 digits.');
    }

    const yearStr = String(expYear);
    // (Optional) sanity check: ensure option exists later

    // --- fill form (waits are included where useful) ---
    await this.cardNo.waitFor({ state: 'visible' });
    await this.cardNo.fill(normalizedCard);

    // Select year/month by value (values match visible text)
    await this.expirationYear.selectOption(yearStr);

    // Some sites use "01..12" but yours is "1..12"; we use normalized month
    await this.expirationMonth.selectOption(monthStr);

    // Payments: use provided value if present in options, otherwise pick first real option (index 1)
    if (payments !== undefined && payments !== null) {
      const payVal = String(payments);
      if (await this.numberOfPayments.locator(`option[value="${payVal}"]`).count()) {
        await this.numberOfPayments.selectOption(payVal);
      } else {
        await this.numberOfPayments.selectOption({ index: 1 }); // skip the empty option at index 0
      }
    } else {
      await this.numberOfPayments.selectOption({ index: 1 });
    }

    // Holder name: force uppercase to match UI behavior
    await this.cardHolderName.fill(String(holderName ?? '').toUpperCase());

    await this.securityCode.fill(cvcStr);
  }
}


module.exports = { EnterPaymentPage };