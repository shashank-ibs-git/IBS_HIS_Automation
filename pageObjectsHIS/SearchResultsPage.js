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
        this.bookWithThisPlanBtn = page.locator("//button/span[text()='このプランで予約']");

    }


    async selectOutboundFlight(carrier) {
        const flightOption = this.carrierFlightSelector(carrier).first();
        await flightOption.waitFor({ state: 'visible', timeout: 10000 });
        await flightOption.click();
    }

    async selectReturnFlightDetails(carrier) {
        const flightOption = this.returnFlightDetailsSelector(carrier).first();
        await flightOption.waitFor({ state: 'visible', timeout: 10000 });
        await flightOption.click();
        await this.flightIteraryModel.waitFor({ state: 'visible', timeout: 10000 });

    }

    async getPriceAtReturnDetailsSection(){
        await this.priceAtReturnDetailsSection.waitFor({ state: 'visible', timeout: 10000 });
        const price = await this.priceAtReturnDetailsSection.textContent();
        return price;
    }

    async flightDetailsAndSchedule(){

        await this.flightIteraryModel.waitFor({ state: 'visible', timeout: 10000 });
        //const departureDate = await this.flightIteraryModel.locator("//p[@class='p-flight-timeline__day']").first().innerText();
        //const arrivalDate = await this.flightIteraryModel.locator("//p[@class='p-flight-timeline__day']").nth(1).innerText();
        const price = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//dt[@class='p-flight-footer__price']").textContent();
        const departureAirport = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//p[@class='p-flight-timeline__airport']").first().textContent();
        const departureAirportName = departureAirport.split(' ')[0];
        const arrivalAirport = await this.page.locator("//div[contains(@class,'c-modal__window-bottom')]//p[@class='p-flight-timeline__airport']").last().textContent();
        const arrivalAirportName = arrivalAirport.split(' ')[0];
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
        await this.flightIteraryModel.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async clickViewPlan(carrier) {
        const viewPlanBtn = this.clickViewPlanSelector(carrier).first();
        await viewPlanBtn.click();
    }

 async getPlanTablesCount() {
  const planTables = this.bookingGridTableRows;
  return await planTables.count();
}

async clickBookWithThisPlan() {
  await this.bookWithThisPlanBtn.first().click();

}


















}


module.exports = { SearchResultsPage };