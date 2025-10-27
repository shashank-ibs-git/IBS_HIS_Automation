const { TopPage } = require("./TopPage");
const { SearchResultsPage } = require("./SearchResultsPage");
const { PassengerInfoPage } = require("./PassengerInfoPage");
const {LoginFlightBaseModule} = require("./LoginFlightBaseModule");

//const { FlightBookingPageTb } = require("./FlightBookingPageTb");
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










  
  }


module.exports = { POManager };
