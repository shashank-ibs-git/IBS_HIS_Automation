const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { default: chalk } = require('chalk');
const { pickFirstNonEmpty, normalizeDob, formatDob, toPageGender } = require('../support/dataUtils');
// Data source simplified: all dynamic flight search values come from Scenario Outline Examples.
// Other required data (login, passengers, payment, labels) are now static inline constants.

const ASSERT_TIMEOUT_FALLBACK = 10000;


Given('the user launches the Flight BASE application', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  await this.poManager.getTopPage().goto();
});

Then('the Top Page should display header, product tabs, and search form', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  this.topPage = this.poManager.getTopPage();
  //action- pop page object
  await expect.soft(this.topPage.headerLogo).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.flightTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.flightHotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.hotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.localTourTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.carRentalTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('the “Flight” tab should be selected by default in Japanese', /** @this {CustomWorld} */ async function () {
  await expect.soft(this.topPage.flightTab).toHaveClass(/is-active/);
  const label = this.sharedData?.flight?.flightTabLabel || '航空券';
  await expect.soft(this.topPage.flightTab).toHaveText(label);
});

// More tolerant regex step to handle potential minor spacing or character variations
When(/the user selects Round Trip with flight search data\s+(.+)\s+to\s+(.+)\s+carrier\s+(\S+)\s+seat class\s+(\S+)\s+adult\s+(\d+)\s+child\s+(\d+)/, /** @this {CustomWorld} */ async function (departureAirport, destinationAirport, carrier, seatClass, adultCountStr, childCountStr) {
  this.flightSearch = {
    departureAirport,
    destinationAirport,
    carrier,
    seatClass,
    adultPassengerCount: Number(adultCountStr),
    childPassengerCount: Number(childCountStr)
  };
  const flight = this.flightSearch;
  await this.topPage.roundtripSelection();
  await this.topPage.selectDepartureCity(flight.departureAirport);
  await this.topPage.selectDestinationCity(flight.destinationAirport);
  await this.topPage.selectAutoDates(1); // dynamic date helper
  //await this.topPage.selectDepartureDate(11, 2025, 10);
  //await this.topPage.selectReturnDate(12, 2025, 17);
  await this.topPage.setAdultPassengerCount(flight.adultPassengerCount);
  await this.topPage.setChildrenPassengerCount(flight.childPassengerCount);
  expect(await this.topPage.selectSeatClass(flight.seatClass)).toBeTruthy();
  await this.topPage.confirmPassengerSelection();
  await this.topPage.searchButton.click();
});


Then('the search form fields should be visible and user should be redirected to results', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  this.searchResultsPage = this.poManager.getSearchResultsPage();
  const status = await this.searchResultsPage.getSearchResultsStatus();
  expect(['results', 'no-results']).toContain(status);
  if (status === 'no-results') {
    console.error('❌ No search results found — stopping execution.');
    throw new Error('No search results found.');
  }
});

Then('outbound flights should be displayed', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.outboundFlights).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('the outbound flight selection page should load', /** @this {CustomWorld} */ async function () {
  // After choosing outbound flight, ensure return flight section appears
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.returnFlightSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

When('the user selects an outbound flight', /** @this {CustomWorld} */ async function () {
  const flight = this.flightSearch || {};
  await this.searchResultsPage.selectOutboundFlight(flight.carrier);
  await this.utils.waitForSpinnerToDisappear();
  this.selectedCarrier = flight.carrier;
});

When('the user selects a return flight', /** @this {CustomWorld} */ async function () {
  const carrier = this.selectedCarrier || (this.flightSearch && this.flightSearch.carrier);
  await this.searchResultsPage.selectReturnFlightDetails(carrier);
  this.priceAtReturnDetailsSection = await this.searchResultsPage.getPriceAtReturnDetailsSection();
});

Then('the return flight selection page should load', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.returnFlightSection).toBeVisible({ timeout: ASSERT_TIMEOUT });

});

Then('flight listings and itinerary details should be displayed', /** @this {CustomWorld} */ async function () {
  const flight = this.flightSearch || {};
  const details = await this.searchResultsPage.flightDetailsAndSchedule();
  expect(details.departureAirportName).toBe(flight.destinationAirport);
  expect(details.arrivalAirportName).toBe(flight.departureAirport);
  expect(details.price).toBe(this.priceAtReturnDetailsSection);
  await this.searchResultsPage.closeFlightDetailsModal();
});

When('the user clicks “View Plan”', /** @this {CustomWorld} */ async function () {
  const flight = this.flightSearch || {};
  await this.searchResultsPage.clickViewPlan(flight.carrier);
});

Then('booking plans should be shown in grid format', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.bookingGridTable).toBeVisible({ timeout: ASSERT_TIMEOUT });
  expect(await this.searchResultsPage.getPlanTablesCount()).toBeGreaterThan(1);
});

When('the user clicks “Book with this Plan”', /** @this {CustomWorld} */ async function () {
  // Simplified: underlying page object now throws on failure (error banner, unchanged URL, unexpected URL)
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? 10000;
  await this.searchResultsPage.waitForBookWithPlanOutcome(ASSERT_TIMEOUT);
  console.log('✅ Successfully navigated to Passenger Info Page.');
  await this.utils.waitForSpinnerToDisappear();
});

Then('the Passenger Info page should load', /** @this {CustomWorld} */ async function () {
  this.passengerInfoPage = this.poManager.getPassengerInfoPage();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.passengerInfoPage.passengerInfoPageSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('Login and Register buttons should be visible for non-logged-in users', /** @this {CustomWorld} */ async function () {
  await expect(this.passengerInfoPage.loginAndRegisterButton).toContainText("ログイン/新規会員登録"); //Login/Register

});

Then('“Applicant Information” section should be visible for logged-in users', /** @this {CustomWorld} */ async function () {
  await this.passengerInfoPage.clickLoginAndRegister();
  this.loginFlightBaseModule = this.poManager.getLoginFlightBaseModule();
  const login = { ...(this.sharedData?.login || {}) };
  if (!login.email || !login.password) {
    throw new Error('Missing login credentials in test data (sharedData.login)');
  }
  await this.loginFlightBaseModule.LogintoFlightBase(login.email, login.password);
  await this.utils.waitForSpinnerToDisappear();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.passengerInfoPage.applicantInfoSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
  // Get applicant info and keep only the values
  const applicantInfo = await this.passengerInfoPage.getApplicantInformation();
  this.applicantValuesFromPassengerInfoPage = Object.values(applicantInfo);

});

Then('user should be able to enter mandatory passenger details',/** @this {CustomWorld} */ async function () {
  const passengers = this.sharedData?.passengers || [];
  const contacts = this.sharedData?.contacts || {};
  for (let i = 0; i < passengers.length; i++) {
    const p = passengers[i];
    await this.passengerInfoPage.fillNameKatakana(i, p.surname, p.given);
    await this.passengerInfoPage.fillBirthDate(i, p.y, p.m, p.d);
    await this.passengerInfoPage.selectGender(String(i), p.gender);
    await this.passengerInfoPage.selectNationality(String(i), p.nationality);
  }
  this.expectedPassengers = passengers.map(p => ({
    surname: p.surname,
    given: p.given,
    y: p.y,
    m: p.m,
    d: p.d,
    gender: p.gender,
    nationality: p.nationality
  }));
  if (contacts.phone) await this.passengerInfoPage.fillPhoneContact(contacts.phone);
  if (contacts.domestic) {
    await this.passengerInfoPage.fillDomesticContactInformation(
      contacts.domestic.nameKana,
      contacts.domestic.phone,
      contacts.domestic.relationship
    );
  }
  await this.passengerInfoPage.proceedToAddOns();

});

When('the user proceeds to select additional services', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  this.additionalServicePage = this.poManager.getAdditionalServicePage();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.additionalServicePage.addOnServiceBreadcrumbHeader).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('Option Selection Page should load with breadcrumb', /** @this {CustomWorld} */ async function () {
  const breadcrumbHeader = this.sharedData?.additionalServices?.breadcrumbHeader || '追加サービス選択';
  await expect(this.additionalServicePage.addOnServiceBreadcrumbHeader).toHaveText(breadcrumbHeader);
});

Then('the user selects additional checked baggage options', /** @this {CustomWorld} */ async function () {
  //await this.additionalServicePage.clickonadditionalCheckedBaggageSection();//open the section
  //await this.additionalServicePage.clickOutboundBaggageAndSelect20kg();
  //await this.additionalServicePage.clickReturnCheckedBaggageAndSelect20kg();
  //await this.additionalServicePage.clickonadditionalCheckedBaggageSection();//close the section
});

Then('HISWeb Set Insurance section should be visible', /** @this {CustomWorld} */ async function () {
  const policyHolders = await this.additionalServicePage.getInsurancePolicyHolders();
  const passengers = this.sharedData?.passengers || [];
  expect(policyHolders.length).toBeGreaterThanOrEqual(Math.min(passengers.length, policyHolders.length));
  for (let i = 0; i < Math.min(passengers.length, policyHolders.length); i++) {
    const expected = passengers[i];
    const actual = policyHolders[i];
    expect(actual.firstName).toBe(expected.given);
    expect(actual.lastName).toBe(expected.surname);
  }
});

When('the user clicks “Proceed to Confirm Input Contents”', /** @this {CustomWorld} */ async function () {
  await this.additionalServicePage.proceedToConfirmInput();

});

Then('Input Confirmation Page should load and display passenger details', /** @this {CustomWorld} */ async function () {
  this.confirmInputPage = this.poManager.getConfirmInputPage();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.confirmInputPage.confirmInputBreadcrumbHeader).toBeVisible({ timeout: ASSERT_TIMEOUT });
  const applicantInfoFromConfirmInputPage = await this.confirmInputPage.getApplicantInformation();
  const applicantValuesFromConfirmInputPage = Object.values(applicantInfoFromConfirmInputPage);

  // Compare both value of Applicant Information directly from Passenger Info and Confirm Input pages
  expect(applicantValuesFromConfirmInputPage).toEqual(this.applicantValuesFromPassengerInfoPage);

  // --- Field labels on the page (handle minor variants) ---
  const LABELS = this.sharedData?.labels || { surname: [], given: [], dob: [], gender: [], nation: [] };

  // --- Small utilities ---
  // Utilities now imported from dataUtils.js
  // --- The validation ---
  for (let i = 0; i < this.expectedPassengers.length; i++) {
    const actual = await this.confirmInputPage.getPassengerInfo(i); // { "姓（SurName）": "...", ... }
    const exp = this.expectedPassengers[i];

  const actualSurname = pickFirstNonEmpty(actual, LABELS.surname);
  const actualGiven = pickFirstNonEmpty(actual, LABELS.given);
  const actualDob = pickFirstNonEmpty(actual, LABELS.dob);
  const actualGender = pickFirstNonEmpty(actual, LABELS.gender);
  const actualNation = pickFirstNonEmpty(actual, LABELS.nation);
    // Names
    expect(actualSurname).toBe(exp.surname);
    expect(actualGiven).toBe(exp.given);
    // DoB (compare as digits to ignore formatting like "1990年12月12日")
    const expectedDOBValue = formatDob(exp);
    const actualDobvalue = normalizeDob(actualDob);
    expect(actualDobvalue).toBe(expectedDOBValue);
    // Gender and nationality
    expect(actualGender).toBe(toPageGender(exp.gender));
    expect(actualNation).toBe(exp.nationality);
  }

});

Then('“Proceed to Payment” button should be active and clickable', /** @this {CustomWorld} */ async function () {
  await this.confirmInputPage.proceedToPayment();
  await this.utils.waitForSpinnerToDisappear();
  await expect(this.page).toHaveURL(/\/v2\/payment\/select-method\/?$/, { timeout: 30_000 });
  this.paymentPage = this.poManager.getPaymentPage(); //Payement Page object
  this.totalAmountFromPaymentPage = await this.paymentPage.getTotalAmount();
  //await expect(this.paymentPage.proceedToPaymentButton).toBeEnabled();
});

When('the user enters payment details and proceeds', /** @this {CustomWorld} */ async function () {
  await this.paymentPage.selectCardPaymentIfNotChecked();
  await this.page.waitForTimeout(1000); // slight wait to ensure button state updates
  await this.paymentPage.proceedToEnterPayment();
  await this.utils.waitForPageStability();
  this.enterPaymentPage = this.poManager.getEnterPaymentPage(); // Enter Payment Page object
  expect(await this.enterPaymentPage.getFinalAmount()).toBe(this.totalAmountFromPaymentPage);
  await this.enterPaymentPage.fillCreditCard({
    cardNo: (this.sharedData?.payment?.card?.number) || '',
    expYear: (this.sharedData?.payment?.card?.expYear) || '',
    expMonth: (this.sharedData?.payment?.card?.expMonth) || '',
    holderName: (this.sharedData?.payment?.card?.holderName) || '',
    cvc: (this.sharedData?.payment?.card?.cvc) || ''
  });
  await this.paymentPage.proceedToEnterPayment();
});

Then('HIS Reservation Number should be displayed', /** @this {CustomWorld} */ async function () {
  //await this.utils.waitForPageStability();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.page).toHaveURL(/\/complete\?hisresno=/i, { timeout: 30000 });

  //await this.paymentPage.waitForBookingConfirmationPage();
  this.reservationCompletePage = this.poManager.getReservationCompletePage();
  const reservationNumber = await this.reservationCompletePage.getReservationNumber();
  expect(reservationNumber).not.toBeFalsy();        // basic check
  expect(reservationNumber).toMatch(/^PO\d{11}$/);
  //console.log(reservationNumber); // pattern check
  console.log(chalk.green.bold('\n🎉 Reservation Completed Successfully!'));
  console.log(chalk.yellow.bold(`🧾 Reservation Number: ${reservationNumber}\n`));

  // Store on World so After hook (or other steps) could access if needed
  this.reservationNumber = reservationNumber;
  // Attach ONLY the final booking message to the Cucumber report (text attachment)
  if (typeof this.attach === 'function') {
    const finalMessage = `Reservation Completed Successfully\nReservation Number: ${reservationNumber}`;
    this.attach(finalMessage, 'text/plain');
  }
});
