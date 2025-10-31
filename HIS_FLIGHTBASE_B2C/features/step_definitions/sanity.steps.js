const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
// Test data provided via hooks: this.testData (loaded once). Using direct destructuring for readability.
// Global `CustomWorld` types live in `types/world.d.ts`.

const ASSERT_TIMEOUT_FALLBACK = 10000; // kept if testData.assertTimeout missing; central value also set on World as this.ASSERT_TIMEOUT

Given('the user launches the Flight BASE application', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  await this.poManager.getTopPage().goto();
});

Then('the Top Page should display header, product tabs, and search form', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
   this.topPage = this.poManager.getTopPage();
  await expect.soft(this.topPage.headerLogo).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.flightTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.flightHotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.hotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.localTourTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.topPage.carRentalTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('the “Flight” tab should be selected by default in Japanese', /** @this {CustomWorld} */ async function () {
  await expect.soft(this.topPage.flightTab).toHaveClass(/is-active/);
  const { flight = {} } = this.testData || {};
  await expect.soft(this.topPage.flightTab).toHaveText(flight.flightTabLabel);
});

When('the user selects Round Trip and initiates a search', /** @this {CustomWorld} */ async function () {
  const { flight = {} } = this.testData || {};
  await this.topPage.roundtripSelection();
  await this.topPage.selectDepartureCity(flight.departureAirport);
  await this.topPage.selectDestinationCity(flight.destinationAirport);
  // await this.topPage.selectDepartureDate(flight.departureDate.month, flight.departureDate.year, flight.departureDate.day);
  // await this.topPage.selectReturnDate(flight.returnDate.month, flight.returnDate.year, flight.returnDate.day);
  await this.topPage.selectAutoDates();
  await this.topPage.setAdultPassengerCount(flight.adultPassengerCount);
  await this.topPage.setChildrenPassengerCount(flight.childPassengerCount);
  expect(await this.topPage.selectSeatClass(flight.seatClass)).toBeTruthy();
  await this.topPage.confirmPassengerSelection();
  await this.topPage.searchButton.click();
});


Then('the search form fields should be visible and user should be redirected to results', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  // POManager#getSearchResultsPage already returns the correct page-object instance.
  // The project-level types (types/world.d.ts + jsconfig.json) provide the necessary
  // IntelliSense so the explicit inline cast is no longer required.
  this.searchResultsPage = this.poManager.getSearchResultsPage();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.headerSearchForm).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('outbound flights should be displayed', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.outboundFlights).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

When('the user selects an outbound flight', /** @this {CustomWorld} */ async function () {
  const { flight = {} } = this.testData || {};
  await this.searchResultsPage.selectOutboundFlight(flight.carrier);
  await this.utils.waitForSpinnerToDisappear();
});

Then('the return flight selection page should load', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.returnFlightSection).toBeVisible({ timeout: ASSERT_TIMEOUT });

});

Then('flight listings and itinerary details should be displayed', /** @this {CustomWorld} */ async function () {
  const { flight = {} } = this.testData || {};
  await this.searchResultsPage.selectReturnFlightDetails(flight.carrier);
  this.priceAtReturnDetailsSection = await this.searchResultsPage.getPriceAtReturnDetailsSection();
  const details = await this.searchResultsPage.flightDetailsAndSchedule();
  expect(details.departureAirportName).toBe(flight.destinationAirport);
  expect(details.arrivalAirportName).toBe(flight.departureAirport);
  expect(details.price).toBe(this.priceAtReturnDetailsSection);
  await this.searchResultsPage.closeFlightDetailsModal();
});

When('the user clicks “View Plan”', /** @this {CustomWorld} */ async function () {
  const { flight = {} } = this.testData || {};
  await this.searchResultsPage.clickViewPlan(flight.carrier);
});

Then('booking plans should be shown in grid format', /** @this {CustomWorld} */ async function () {
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.searchResultsPage.bookingGridTable).toBeVisible({ timeout: ASSERT_TIMEOUT });
  expect(await this.searchResultsPage.getPlanTablesCount()).toBeGreaterThan(1);
});

When('the user clicks “Book with this Plan”', /** @this {CustomWorld} */ async function () {
  await this.searchResultsPage.clickBookWithThisPlan();
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
  const { login = {} } = this.testData || {};
  await this.loginFlightBaseModule.LogintoFlightBase(login.email, login.password);
  await this.utils.waitForSpinnerToDisappear();
  const ASSERT_TIMEOUT = this.ASSERT_TIMEOUT ?? ASSERT_TIMEOUT_FALLBACK;
  await expect(this.passengerInfoPage.applicantInfoSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
  // Get applicant info and keep only the values
  const applicantInfo = await this.passengerInfoPage.getApplicantInformation();
  this.applicantValuesFromPassengerInfoPage = Object.values(applicantInfo);

});

Then('user should be able to enter mandatory passenger details',/** @this {CustomWorld} */ async function () {
  // Populate passengers dynamically from test data
  const { passengers = [], contacts = {} } = this.testData || {};
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
  const { additionalServices = {} } = this.testData || {};
  await expect(this.additionalServicePage.addOnServiceBreadcrumbHeader).toHaveText(additionalServices.breadcrumbHeader);
});

Then('the user selects additional checked baggage options', /** @this {CustomWorld} */ async function () {
  await this.additionalServicePage.clickonadditionalCheckedBaggageSection();//open the section
  await this.additionalServicePage.clickOutboundBaggageAndSelect20kg();
  await this.additionalServicePage.clickReturnCheckedBaggageAndSelect20kg();
  await this.additionalServicePage.clickonadditionalCheckedBaggageSection();//close the section
});

Then('HISWeb Set Insurance section should be visible', /** @this {CustomWorld} */ async function () {
  const policyHolders = await this.additionalServicePage.getInsurancePolicyHolders();
  // 1st passenger
  expect(policyHolders[0].firstName).toBe('TARO');
  expect(policyHolders[0].lastName).toBe('KOKUNAI');
  // 2nd child passenger
  expect(policyHolders[1].firstName).toBe('HANAKO');
  expect(policyHolders[1].lastName).toBe('KOKUNAI');
  // 3rd infant passenger
  expect(policyHolders[2].firstName).toBe('TANAKO');
  expect(policyHolders[2].lastName).toBe('KOKUNAI');
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
const { labels: LABELS = { surname: [], given: [], dob: [], gender: [], nation: [] } } = this.testData || {};

// --- Small utilities ---
/** Return the first non-empty value for any of the given keys from an object */
const pick = (obj, keys) => keys.map(k => obj[k]).find(v => v != null && String(v).trim() !== '');
/** Keep only digits (for comparing DoB robustly) */
const normalizeDob = s => (String(s ?? '').match(/\d+/g) || []).map((v,i)=> i? v.padStart(2,'0'):v).join('');
/** Expected DoB as 8 digits YYYYMMDD */
const formatDob = ({ y, m, d }) =>
  `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
/** Map input gender -> page label */
const toPageGender = (g) => (g === 'male' ? '男性' : '女性');
// --- The validation ---
for (let i = 0; i < this.expectedPassengers.length; i++) {
  const actual = await this.confirmInputPage.getPassengerInfo(i); // { "姓（SurName）": "...", ... }
  const exp = this.expectedPassengers[i];

  const actualSurname = pick(actual, LABELS.surname);
  const actualGiven   = pick(actual, LABELS.given);
  const actualDob     = pick(actual, LABELS.dob);
  const actualGender  = pick(actual, LABELS.gender);
  const actualNation  = pick(actual, LABELS.nation);

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
  this.paymentPage = this.poManager.getPaymentPage(); //Payement Page object
 this.totalAmountFromPaymentPage = await this.paymentPage.getTotalAmount();
  //await expect(this.paymentPage.proceedToPaymentButton).toBeEnabled();
});

When('the user enters payment details and proceeds', /** @this {CustomWorld} */ async function () {
  await this.paymentPage.selectCardPaymentIfNotChecked();
  await this.page.waitForTimeout(1000); // slight wait to ensure button state updates
  await this.paymentPage.proceedToEnterPayment();
  this.enterPaymentPage = this.poManager.getEnterPaymentPage(); // Enter Payment Page object
  expect(await this.enterPaymentPage.getFinalAmount()).toBe(this.totalAmountFromPaymentPage);
  const { payment = {} } = this.testData || {};
  const { card = {} } = payment;
  await this.enterPaymentPage.fillCreditCard({
    cardNo: card.number,
    expYear: card.expYear,
    expMonth: card.expMonth,
    holderName: card.holderName,
    cvc: card.cvc
  });
});
  
Then('HIS Reservation Number should be displayed', /** @this {CustomWorld} */ async function () {
  await expect(this.page.locator('#reservation-number')).toBeVisible();
});
