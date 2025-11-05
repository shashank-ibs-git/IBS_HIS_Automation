const { TopPage } = require("./TopPage");
const { SearchResultsPage } = require("./SearchResultsPage");
const { PassengerInfoPage } = require("./PassengerInfoPage");
const {LoginFlightBaseModule} = require("./LoginFlightBaseModule");
const {AdditionalServicePage} = require("./AdditionalServicePage");
const {ConfirmInputPage} = require("./ConfirmInputPage");
const {PaymentPage} = require("./PaymentPage");
const {EnterPaymentPage} = require("./EnterPaymentPage");
const {ReservationCompletePage} = require("./ReservationCompletePage");


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
    this.enterPaymentPage = new EnterPaymentPage(page);
    this.reservationCompletePage = new ReservationCompletePage(page);

    // Optional instrumentation only if STACK_VERBOSE=1 (default off for cleaner stacks)
    if (process.env.STACK_VERBOSE === '1') {
      const instrument = (obj, label) => {
        const proto = Object.getPrototypeOf(obj);
        if (!proto) return;
        for (const key of Object.getOwnPropertyNames(proto)) {
          if (key === 'constructor') continue;
          const original = obj[key];
          if (typeof original !== 'function') continue;
          obj[key] = async function (...args) {
            try {
              return await original.apply(this, args);
            } catch (err) {
              const callStack = new Error().stack?.split(/\r?\n/).slice(2, 6).map(l => l.trim()).join(' | ');
              const augmented = new Error(
                `${err.message}\n[POContext] ${label}.${key}\n[Chain] ${callStack}`
              );
              augmented.stack = err.stack;
              throw augmented;
            }
          };
        }
      };
      instrument(this.topPage, 'TopPage');
      instrument(this.searchResultsPage, 'SearchResultsPage');
      instrument(this.passengerInfoPage, 'PassengerInfoPage');
      instrument(this.loginFlightBaseModule, 'LoginFlightBaseModule');
      instrument(this.additionalServicePage, 'AdditionalServicePage');
      instrument(this.confirmInputPage, 'ConfirmInputPage');
      instrument(this.paymentPage, 'PaymentPage');
      instrument(this.enterPaymentPage, 'EnterPaymentPage');
      instrument(this.reservationCompletePage, 'ReservationCompletePage');
    }
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
  getEnterPaymentPage() {
    return this.enterPaymentPage;
  }
  getReservationCompletePage() {
    return this.reservationCompletePage;
  }

}


module.exports = { POManager };
