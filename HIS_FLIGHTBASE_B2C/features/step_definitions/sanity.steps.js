const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

let page;
const ASSERT_TIMEOUT = 10000;
const FlightCarrier = 'JQ';
const DEPARTURE_DATE = { month: '11', year: '2025', day: '11' };
const RETURN_DATE    = { month: '12', year: '2025', day: '15' };

Given('the user launches the Flight BASE application', async function () {
  await this.utils.waitForSpinnerToDisappear();
  await this.poManager.getTopPage().goto();
});

Then('the Top Page should display header, product tabs, and search form', async function () {
  await expect.soft(this.poManager.getTopPage().headerLogo).toBeVisible({timeout: ASSERT_TIMEOUT});
  await expect.soft(this.poManager.getTopPage().flightTab).toBeVisible({timeout: ASSERT_TIMEOUT});
  await expect.soft(this.poManager.getTopPage().flightHotelTab).toBeVisible({timeout: ASSERT_TIMEOUT});
  await expect.soft(this.poManager.getTopPage().hotelTab).toBeVisible({timeout: ASSERT_TIMEOUT});
  await expect.soft(this.poManager.getTopPage().localTourTab).toBeVisible({timeout: ASSERT_TIMEOUT});
  await expect.soft(this.poManager.getTopPage().carRentalTab).toBeVisible({timeout: ASSERT_TIMEOUT});
});

Then('the “Flight” tab should be selected by default in Japanese', async function () {
  await expect.soft(this.poManager.getTopPage().flightTab).toHaveClass(/is-active/);
  await expect.soft(this.poManager.getTopPage().flightTab).toHaveText('航空券');
});

When('the user selects Round Trip and initiates a search', async function () {
  await this.poManager.getTopPage().roundtripSelection();
  await this.poManager.getTopPage().selectDepartureCity('成田国際空港');
  await this.poManager.getTopPage().selectDestinationCity('ブリスベン空港');
  await this.poManager.getTopPage().selectDepartureDate(DEPARTURE_DATE.month, DEPARTURE_DATE.year, DEPARTURE_DATE.day);//month, year, date
  await this.poManager.getTopPage().selectReturnDate(RETURN_DATE.month, RETURN_DATE.year, RETURN_DATE.day); //month, year, date
  await this.poManager.getTopPage().setAdultPassengerCount(1);
  await this.poManager.getTopPage().setChildrenPassengerCount(1);
  expect(await this.poManager.getTopPage().selectSeatClass('ECONOMY')).toBeTruthy();
  await this.poManager.getTopPage().confirmPassengerSelection();
  await this.poManager.getTopPage().searchButton.click();
});


Then('the search form fields should be visible and user should be redirected to results', async function () {
  await this.utils.waitForSpinnerToDisappear();
  this.searchResultsPage = this.poManager.getSearchResultsPage();
  await expect(this.searchResultsPage.headerSearchForm).toBeVisible({timeout: ASSERT_TIMEOUT});
});

Then('outbound flights should be displayed', async function () {
  await expect(this.searchResultsPage.outboundFlights).toBeVisible({timeout: ASSERT_TIMEOUT});
});

When('the user selects an outbound flight', async function () {
  await this.searchResultsPage.selectOutboundFlight(FlightCarrier);
  await this.utils.waitForSpinnerToDisappear();
});

Then('the return flight selection page should load', async function () {
  await expect(this.searchResultsPage.returnFlightSection).toBeVisible({timeout: ASSERT_TIMEOUT});

});

Then('flight listings and itinerary details should be displayed', async function () {
  await this.searchResultsPage.selectReturnFlightDetails(FlightCarrier);
  this.priceAtReturnDetailsSection = await this.searchResultsPage.getPriceAtReturnDetailsSection();
  const details = await this.searchResultsPage.flightDetailsAndSchedule();
  expect(details.departureAirportName).toBe('ブリスベン空港');
  expect(details.arrivalAirportName).toBe('成田国際空港');
  expect(details.price).toBe(this.priceAtReturnDetailsSection);
  await this.searchResultsPage.closeFlightDetailsModal();
});

When('the user clicks “View Plan”', async function () {
  await this.searchResultsPage.clickViewPlan(FlightCarrier);
});

Then('booking plans should be shown in grid format', async function () {
  await expect(this.searchResultsPage.bookingGridTable).toBeVisible({timeout: ASSERT_TIMEOUT});
  expect(await this.searchResultsPage.getPlanTablesCount()).toBeGreaterThan(1);
});

When('the user clicks “Book with this Plan”', async function () {
  await this.searchResultsPage.clickBookWithThisPlan();
  await this.utils.waitForSpinnerToDisappear();
});

Then('the Passenger Info page should load', async function () {
  this.passengerInfoPage = this.poManager.getPassengerInfoPage();
  await expect(this.passengerInfoPage.passengerInfoPageSection).toBeVisible({timeout: ASSERT_TIMEOUT});
});

Then('Login and Register buttons should be visible for non-logged-in users', async function () {
  await expect(this.passengerInfoPage.loginAndRegisterButton).toContainText("ログイン/新規会員登録"); //Login/Register

});

Then('“Applicant Information” section should be visible for logged-in users', async function () {
  await this.passengerInfoPage.clickLoginAndRegister();
  this.loginFlightBaseModule = this.poManager.getLoginFlightBaseModule();
  await this.loginFlightBaseModule.LogintoFlightBase('shashank.channegowda@ibsplc.com', 'TestingIBS123!');
  await this.utils.waitForSpinnerToDisappear();
  await expect(this.passengerInfoPage.applicantInfoSection).toBeVisible({timeout: ASSERT_TIMEOUT});

});

Then('user should be able to enter mandatory passenger details', async function () {
  await this.passengerInfoPage.fillNameKatakana('0', 'KOKUNAI', 'TARO');// First Passenger
  await this.passengerInfoPage.fillBirthDate('0', '1990', '12', '12');// First Passenger
  await this.passengerInfoPage.selectGender('0', 'male');// First Passenger
  await this.passengerInfoPage.selectNationality('0', 'アンギラ');// First Passenger
  await this.passengerInfoPage.fillNameKatakana('1', 'KOKUNAI', 'HANAKO');// Second Passenger
  await this.passengerInfoPage.fillBirthDate('1', '2021', '12', '12');// Second Passenger
  await this.passengerInfoPage.selectGender('1', 'female');// Second Passenger
  await this.passengerInfoPage.selectNationality('1', 'アンギラ');// Second Passenger
  await this.passengerInfoPage.fillNameKatakana('2', 'KOKUNAI', 'TANAKO');// infant Passenger
  await this.passengerInfoPage.fillBirthDate('2', '2024', '01', '05');// infant Passenger
  await this.passengerInfoPage.selectGender('2', 'male');// infant Passenger
  await this.passengerInfoPage.selectNationality('2', 'アンギラ');// infant Passenger
  await this.passengerInfoPage.fillPhoneContact('09012345678');
  await this.passengerInfoPage.fillDomesticContactInformation('ヤマダハナコ', '09087654321','父');
  await this.passengerInfoPage.proceedToAddOns();

});

When('the user proceeds to select additional services', async function () {
  await utils.waitForSpinnerToDisappear();
  await page.locator('#proceed-services').click();
});

Then('Option Selection Page should load with breadcrumb', async function () {
  await expect(page.locator('#breadcrumb')).toBeVisible();
});

Then('HISWeb Set Insurance section should be visible', async function () {
  await expect(page.locator('#insurance-section')).toBeVisible();
});

When('the user clicks “Proceed to Confirm Input Contents”', async function () {
  await page.locator('#confirm-input').click();
});

Then('Input Confirmation Page should load and display passenger details', async function () {
  await expect(page).toHaveURL(/confirm-input/);
  await expect(page.locator('#passenger-summary')).toBeVisible();
});

Then('“Proceed to Payment” button should be active and clickable', async function () {
  await expect(page.locator('#proceed-payment')).toBeEnabled();
});

When('the user enters payment details and proceeds', async function () {
  await page.locator('#card-number').fill('4111111111111111');
  await page.locator('#expiry').fill('12/25');
  await page.locator('#cvv').fill('123');
  await page.locator('#confirm-payment').click();
});

Then('HIS Reservation Number should be displayed', async function () {
  await expect(page.locator('#reservation-number')).toBeVisible();
});
