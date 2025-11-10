class SearchResultsPage {

    constructor(page) {
        this.page = page;
        this.headerSearchForm = page.locator("//h2[@class='p-result-heading' and contains(text(),'往路')]");
        this.outboundFlights = page.locator("section.search-result-desktop .p-result-card-wrap");
        this.carrierFlightSelector = (carrier) => page.locator(`//div[@id='result-card01']//span[text()='${carrier}']//ancestor::div[@class='p-result-card__outline']//button/span[text()='選択する']`);
        this.returnFlightSection = page.locator("//div[@class='p-search-body']//h2[contains(text(),'復路')]");
        this.flightIteraryModel = page.locator("//div[contains(@class,'c-modal__window-bottom')]");
        this.returnFlightDetailsSelector = (carrier) => page.locator(`//div[@id='result-card01']//span[text()='${carrier}']//ancestor::div[@class='p-result-card__outline']//button/span[text()='フライト詳細']`);
        this.priceAtReturnDetailsSection = page.locator(".p-flight-aside__price").first();
        this.clickViewPlanSelector = (carrier) => page.locator(`//div[@id='result-card01']//span[text()='${carrier}']//ancestor::div[@class='p-result-card__outline']//button/span[text()=' プランを見る']`);
        this.flightPlanAccordionSelector = page.locator(".flight-plan-accordion-open");
        this.bookingGridTable = page.locator("div.p-plan-baggage");
        this.bookingGridTableRows = page.locator("div.p-plan-baggage > table.p-plan-baggage__item");
        this.bookWithThisPlanBtn = page.getByRole('button', { name: 'このプランで予約' }).first();
        this.noResultsLocator = page.locator(".p-no-results__text");
        this.flightDetailsUnavailableLocator = page.locator(".c-input__error.p-input__error");
        this.DEFAULT_TIMEOUT = 60000;
    }

async getSearchResultsStatus(timeout = this.DEFAULT_TIMEOUT) {
  try {
    return await Promise.race([
      this.headerSearchForm.waitFor({ state: 'visible', timeout }).then(() => 'results'),
      this.noResultsLocator.waitFor({ state: 'visible', timeout }).then(() => 'no-results'),
    ]);
  } catch {
    return 'unknown';
  }
}

    async selectOutboundFlight(carrier) {
        const flightOption = this.carrierFlightSelector(carrier).first();
        await flightOption.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
        await flightOption.click();
    }

    async selectReturnFlightDetails(carrier) {
        const flightOption = this.returnFlightDetailsSelector(carrier).first();
        await flightOption.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
        await flightOption.click();
        await this.flightIteraryModel.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });

    }

    async getPriceAtReturnDetailsSection(){
        await this.priceAtReturnDetailsSection.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
        const price = await this.priceAtReturnDetailsSection.textContent();
        return price;
    }

    async flightDetailsAndSchedule(){

        await this.flightIteraryModel.waitFor({ state: 'visible', timeout: this.DEFAULT_TIMEOUT });
        //const departureDate = await this.flightIteraryModel.locator("//p[@class='p-flight-timeline__day']").first().innerText();
        //const arrivalDate = await this.flightIteraryModel.locator("//p[@class='p-flight-timeline__day']").nth(1).innerText();
        const price = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//dt[@class='p-flight-footer__price']").textContent();
        const departureAirport = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//p[@class='p-flight-timeline__airport']").first().textContent();
        const departureAirportName = departureAirport.replace(/[（\(\[].*$/, '').trim();
        const arrivalAirport = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//p[@class='p-flight-timeline__airport']").last().textContent();
        const arrivalAirportName = arrivalAirport.replace(/[（\(\[].*$/, '').trim();
        return {
            //departureDate,
            //arrivalDate,
            price,
            departureAirportName,
            arrivalAirportName
        };

    }

    async closeFlightDetailsModal() {
        const closeBtn = this.flightIteraryModel.locator("//button//span[contains(text(),'閉じる')]");
        await closeBtn.click();
        await this.flightIteraryModel.waitFor({ state: 'hidden', timeout: this.DEFAULT_TIMEOUT });
    }

    async clickViewPlan(carrier) {
        const viewPlanBtn = this.clickViewPlanSelector(carrier).first();
        await viewPlanBtn.click();
    }

 async getPlanTablesCount() {
  const planTables = this.bookingGridTableRows;
  return await planTables.count();
}

async waitForBookWithPlanOutcome(timeoutMs = 15000, maxRetries = 2) {
  const initialUrl = this.page.url();
  const SUCCESS_URL_REGEX = /\/input$/i; // success must end with /input
  const pollInterval = 250; // ms
  const banner = this.flightDetailsUnavailableLocator;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Choose plan button by attempt index (first attempt -> first plan, second attempt -> second plan, etc.)
    const planButtons = this.page.getByRole('button', { name: 'このプランで予約' });
    const btnCount = await planButtons.count();
    const targetBtn = attempt < btnCount ? planButtons.nth(attempt) : planButtons.first();

    await targetBtn.click();
    await this.waitForSpinnerToDisappear().catch(() => {});

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (SUCCESS_URL_REGEX.test(this.page.url())) return 'success';
      if (await banner.isVisible()) {
        let msg = '';
        try { msg = (await banner.innerText())?.trim(); } catch { /* ignore */ }
        // If we have remaining retries, break out to retry another plan.
        if (attempt + 1 < maxRetries) {
          // Small pause before retrying
          await this.page.waitForTimeout(500);
          break; // proceed to next attempt
        }
        throw new Error(`Flight booking failed after ${attempt + 1} attempt(s) (error banner): ${msg || 'Unknown error'} : Flight details are currently unavailable.`);
      }
      await this.page.waitForTimeout(pollInterval);
    }

    // Post-loop success check before next attempt
    if (SUCCESS_URL_REGEX.test(this.page.url())) return 'success';
  }

  // Final evaluation after retries exhausted
  if (SUCCESS_URL_REGEX.test(this.page.url())) return 'success';
  if (await banner.isVisible()) {
    let msg = '';
    try { msg = (await banner.innerText())?.trim(); } catch { /* ignore */ }
    throw new Error(`Flight booking failed (final) (error banner): ${msg || 'Unknown error'} : Flight details are currently unavailable.`);
  }
  const current = this.page.url();
  if (current !== initialUrl) {
    throw new Error(`Flight booking failed: navigated to unexpected URL ${current}`);
  }
  throw new Error('Flight booking failed: no success URL, no error banner within timeout after retries');
}

  // Localized spinner wait (decoupled from external Utilities injection)
  async waitForSpinnerToDisappear(timeout = 60000) {
    const spinner = this.page.locator("//div[@class='his-desktop']//div[@class='spinner']");
    try {
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch {
      try { await spinner.waitFor({ state: 'detached', timeout }); } catch {/* ignore */}
    }
  }


















}


module.exports = { SearchResultsPage };