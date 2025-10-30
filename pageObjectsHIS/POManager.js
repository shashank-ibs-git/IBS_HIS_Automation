const { TopPage } = require("./TopPage");
const { SearchResultsPage } = require("./SearchResultsPage");
const { PassengerInfoPage } = require("./PassengerInfoPage");
const {LoginFlightBaseModule} = require("./LoginFlightBaseModule");
const {AdditionalServicePage} = require("./AdditionalServicePage");
const {ConfirmInputPage} = require("./ConfirmInputPage");
const {PaymentPage} = require("./PaymentPage");

/**
 * @class POManager
 */

  class POManager {
      /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
    this.topPage = new TopPage(page);
    this.searchResultsPage = new SearchResultsPage(page);
    this.passengerInfoPage = new PassengerInfoPage(page);
    this.loginFlightBaseModule = new LoginFlightBaseModule(page);
    this.additionalServicePage = new AdditionalServicePage(page);
    this.confirmInputPage = new ConfirmInputPage(page);
    this.paymentPage = new PaymentPage(page);
  }

  getTopPage() {
    return this.topPage;
  }
  getSearchResultsPage() {
    return this.searchResultsPage;
  }
  getPassengerInfoPage() {
    return this.passengerInfoPage;
  }
  getLoginFlightBaseModule() {
    return this.loginFlightBaseModule;
  }
  getAdditionalServicePage() {
    return this.additionalServicePage;
  }
  getConfirmInputPage() {
    return this.confirmInputPage;
  }
  getPaymentPage() {
    return this.paymentPage;
  }


}


module.exports = { POManager };
