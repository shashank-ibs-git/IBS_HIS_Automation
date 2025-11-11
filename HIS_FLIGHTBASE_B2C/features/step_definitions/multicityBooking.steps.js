const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Reuse existing sanity step primitives (TopPage loading, header checks) by copying logic
// rather than importing from sanity.steps.js to avoid circular world state mutations.
// Assumes CustomWorld provides: poManager, utils, sharedData, page, ASSERT_TIMEOUT.

const ASSERT_TIMEOUT_FALLBACK = 10000;

// NOTE: Core Given/Then page validation steps are implemented in sanity.steps.js.
// To avoid ambiguity errors we do NOT re-declare them here.

// Table-driven multicity selection (matches feature file structure)
When('the user selects Multicity Trip with 3 flight segments', /** @this {CustomWorld} */ async function (dataTable) {
  const rows = dataTable.hashes();
  if (!rows.length) throw new Error('Multicity data table is empty.');
  const row = rows[0];
  this.multicityFlightSearch = {
    departure1: row.departure1,
    destination1: row.destination1,
    departure2: row.departure2,
    destination2: row.destination2,
    departure3: row.departure3,
    destination3: row.destination3
  };
  const f = this.multicityFlightSearch;
  await this.topPage.multicityTripSelection();
  // Ensure there are 3 segments (assuming UI starts with 2)
  await this.topPage.selectAddSegment(1);
  await this.topPage.multicityDepartureCity(1, f.departure1);
  await this.topPage.multicityDestinationCity(1, f.destination1);
  await this.topPage.multicityDepartureDate(1, 11, 2025, 16);
  await this.topPage.multicityDepartureCity(2, f.departure2);
  await this.topPage.multicityDestinationCity(2, f.destination2);
  await this.topPage.multicityDepartureDate(2, 11, 2025, 16);
  await this.topPage.multicityDepartureCity(3, f.departure3);
  await this.topPage.multicityDestinationCity(3, f.destination3);
  await this.topPage.multicityDepartureDate(3, 11, 2025, 16);
});

// Passenger counts & seat class selection separated for clarity.
When('the user selects seat class {string} with adult {int} child {int} infant {int}', /** @this {CustomWorld} */ async function (seatClass, adultCount, childCount, infantCount) {
  this.flightSearch = {
    ...(this.flightSearch || {}),
    seatClass,
    adultPassengerCount: adultCount,
    childPassengerCount: childCount,
    infantPassengerCount: infantCount
  };
  await this.topPage.clickPassengerSelection();
  await this.topPage.setAdultPassengerCount(adultCount);
  await this.topPage.setChildrenPassengerCount(childCount);
  await this.topPage.setInfantPassengerCount(infantCount);
  expect(await this.topPage.selectSeatClass(seatClass)).toBeTruthy();
  await this.topPage.confirmPassengerSelection();
});

// Alias regex version to catch any minor spacing or keyword variations (And/When) and prevent Undefined.
When(/the user selects seat class\s+(\S+)\s+with adult\s+(\d+)\s+child\s+(\d+)\s+infant\s+(\d+)/, /** @this {CustomWorld} */ async function (seatClass, adultStr, childStr, infantStr) {
  const adultCount = Number(adultStr);
  const childCount = Number(childStr);
  const infantCount = Number(infantStr);
  this.flightSearch = {
    ...(this.flightSearch || {}),
    seatClass,
    adultPassengerCount: adultCount,
    childPassengerCount: childCount,
    infantPassengerCount: infantCount
  };
  await this.topPage.clickPassengerSelection();
  await this.topPage.setAdultPassengerCount(adultCount);
  await this.topPage.setChildrenPassengerCount(childCount);
  await this.topPage.setInfantPassengerCount(infantCount);
  expect(await this.topPage.selectSeatClass(seatClass)).toBeTruthy();
  await this.topPage.confirmPassengerSelection();
});

When('the user clicks on Search for flights', /** @this {CustomWorld} */ async function () {
  await this.topPage.searchButton.click();
  //await this.page.context().browser().close()
});

Then('the search results for the 3-segment trip with selected passengers and seat class should be displayed', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  this.searchResultsPage = this.poManager.getSearchResultsPage();
  const status = await this.searchResultsPage.getSearchResultsStatus();
  expect(['results', 'no-results']).toContain(status);
  if (status === 'no-results') {
    throw new Error('No search results found for multicity trip.');
  }
  // FUTURE: Validate segment itinerary representation once search results page exposes multicity details.
  console.log('✅ Multicity search results displayed.');
});
