const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Global `CustomWorld` is declared in `types/world.d.ts` — no local typedef here to avoid conflicts.

let page;
const ASSERT_TIMEOUT = 10000;
const FlightCarrier = 'JQ';
const DEPARTURE_DATE = { month: '11', year: '2025', day: '01' };
const RETURN_DATE = { month: '11', year: '2025', day: '10' };

Given('the user launches the Flight BASE application', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  await this.poManager.getTopPage().goto();
});

Then('the Top Page should display header, product tabs, and search form', /** @this {CustomWorld} */ async function () {
  await expect.soft(this.poManager.getTopPage().headerLogo).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.poManager.getTopPage().flightTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.poManager.getTopPage().flightHotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.poManager.getTopPage().hotelTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.poManager.getTopPage().localTourTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
  await expect.soft(this.poManager.getTopPage().carRentalTab).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('the “Flight” tab should be selected by default in Japanese', /** @this {CustomWorld} */ async function () {
  await expect.soft(this.poManager.getTopPage().flightTab).toHaveClass(/is-active/);
  await expect.soft(this.poManager.getTopPage().flightTab).toHaveText('航空券');
});

When('the user selects Round Trip and initiates a search', /** @this {CustomWorld} */ async function () {
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


Then('the search form fields should be visible and user should be redirected to results', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  // POManager#getSearchResultsPage already returns the correct page-object instance.
  // The project-level types (types/world.d.ts + jsconfig.json) provide the necessary
  // IntelliSense so the explicit inline cast is no longer required.
  this.searchResultsPage = this.poManager.getSearchResultsPage();
  await expect(this.searchResultsPage.headerSearchForm).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('outbound flights should be displayed', /** @this {CustomWorld} */ async function () {
  await expect(this.searchResultsPage.outboundFlights).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

When('the user selects an outbound flight', /** @this {CustomWorld} */ async function () {
  await this.searchResultsPage.selectOutboundFlight(FlightCarrier);
  await this.utils.waitForSpinnerToDisappear();
});

Then('the return flight selection page should load', /** @this {CustomWorld} */ async function () {
  await expect(this.searchResultsPage.returnFlightSection).toBeVisible({ timeout: ASSERT_TIMEOUT });

});

Then('flight listings and itinerary details should be displayed', /** @this {CustomWorld} */ async function () {
  await this.searchResultsPage.selectReturnFlightDetails(FlightCarrier);
  this.priceAtReturnDetailsSection = await this.searchResultsPage.getPriceAtReturnDetailsSection();
  const details = await this.searchResultsPage.flightDetailsAndSchedule();
  expect(details.departureAirportName).toBe('ブリスベン空港');
  expect(details.arrivalAirportName).toBe('成田国際空港');
  expect(details.price).toBe(this.priceAtReturnDetailsSection);
  await this.searchResultsPage.closeFlightDetailsModal();
});

When('the user clicks “View Plan”', /** @this {CustomWorld} */ async function () {
  await this.searchResultsPage.clickViewPlan(FlightCarrier);
});

Then('booking plans should be shown in grid format', /** @this {CustomWorld} */ async function () {
  await expect(this.searchResultsPage.bookingGridTable).toBeVisible({ timeout: ASSERT_TIMEOUT });
  expect(await this.searchResultsPage.getPlanTablesCount()).toBeGreaterThan(1);
});

When('the user clicks “Book with this Plan”', /** @this {CustomWorld} */ async function () {
  await this.searchResultsPage.clickBookWithThisPlan();
  await this.utils.waitForSpinnerToDisappear();
});

Then('the Passenger Info page should load', /** @this {CustomWorld} */ async function () {
  this.passengerInfoPage = this.poManager.getPassengerInfoPage();
  await expect(this.passengerInfoPage.passengerInfoPageSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('Login and Register buttons should be visible for non-logged-in users', /** @this {CustomWorld} */ async function () {
  await expect(this.passengerInfoPage.loginAndRegisterButton).toContainText("ログイン/新規会員登録"); //Login/Register

});

Then('“Applicant Information” section should be visible for logged-in users', /** @this {CustomWorld} */ async function () {
  await this.passengerInfoPage.clickLoginAndRegister();
  this.loginFlightBaseModule = this.poManager.getLoginFlightBaseModule();
  await this.loginFlightBaseModule.LogintoFlightBase('shashank.channegowda@ibsplc.com', 'TestingIBS123!');
  await this.utils.waitForSpinnerToDisappear();
  await expect(this.passengerInfoPage.applicantInfoSection).toBeVisible({ timeout: ASSERT_TIMEOUT });
  // Get applicant info and keep only the values
  const applicantInfo = await this.passengerInfoPage.getApplicantInformation();
  this.applicantValuesFromPassengerInfoPage = Object.values(applicantInfo);

});

Then('user should be able to enter mandatory passenger details',/** @this {CustomWorld} */ async function () {
  await this.passengerInfoPage.fillNameKatakana(0, 'KOKUNAI', 'TARO');// First Passenger
  await this.passengerInfoPage.fillBirthDate(0, '1990', '12', '12');// First Passenger
  await this.passengerInfoPage.selectGender('0', 'male');// First Passenger
  await this.passengerInfoPage.selectNationality('0', 'アンギラ');// First Passenger // 日本
  await this.passengerInfoPage.fillNameKatakana(1, 'KOKUNAI', 'HANAKO');// Child Passenger
  await this.passengerInfoPage.fillBirthDate(1, '2021', '12', '12');// Child Passenger
  await this.passengerInfoPage.selectGender('1', 'female');// Child Passenger
  await this.passengerInfoPage.selectNationality('1', 'アンギラ');// Child Passenger
  await this.passengerInfoPage.fillNameKatakana(2, 'KOKUNAI', 'TANAKO');// infant Passenger
  await this.passengerInfoPage.fillBirthDate(2, '2024', '01', '05');// infant Passenger
  await this.passengerInfoPage.selectGender('2', 'male');// infant Passenger
  await this.passengerInfoPage.selectNationality('2', 'アンギラ');// infant Passenger
  this.expectedPassengers = [
  { surname: 'KOKUNAI', given: 'TARO',   y: '1990', m: '12', d: '12', gender: 'male',   nationality: 'アンギラ' },
  { surname: 'KOKUNAI', given: 'HANAKO', y: '2021', m: '12', d: '12', gender: 'female', nationality: 'アンギラ' },
  { surname: 'KOKUNAI', given: 'TANAKO', y: '2024', m: '01', d: '05', gender: 'male', nationality: 'アンギラ' },
];

  await this.passengerInfoPage.fillPhoneContact('09012345678');
  await this.passengerInfoPage.fillDomesticContactInformation('ヤマダハナコ', '09087654321', '父');
  await this.passengerInfoPage.proceedToAddOns();

});

When('the user proceeds to select additional services', /** @this {CustomWorld} */ async function () {
  await this.utils.waitForSpinnerToDisappear();
  this.additionalServicePage = this.poManager.getAdditionalServicePage();
  await expect(this.additionalServicePage.addOnServiceBreadcrumbHeader).toBeVisible({ timeout: ASSERT_TIMEOUT });
});

Then('Option Selection Page should load with breadcrumb', /** @this {CustomWorld} */ async function () {
  await expect(this.additionalServicePage.addOnServiceBreadcrumbHeader).toHaveText('追加サービス選択');
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
  await expect(this.confirmInputPage.confirmInputBreadcrumbHeader).toBeVisible({ timeout: ASSERT_TIMEOUT });
  const applicantInfoFromConfirmInputPage = await this.confirmInputPage.getApplicantInformation();
  const applicantValuesFromConfirmInputPage = Object.values(applicantInfoFromConfirmInputPage);

  // Compare both value of Applicant Information directly from Passenger Info and Confirm Input pages
  expect(applicantValuesFromConfirmInputPage).toEqual(this.applicantValuesFromPassengerInfoPage);

// --- Field labels on the page (handle minor variants) ---
const LABELS = {
  surname: ['姓（SurName）', '姓 (SurName)'],
  given:   ['名（GivenName）', '名 (GivenName)'],
  dob:     ['生年月日'],
  gender:  ['性別'],
  nation:  ['国籍'],
};

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
  await expect(this.paymentPage.proceedToPaymentButton).toBeEnabled();
});

When('the user enters payment details and proceeds', /** @this {CustomWorld} */ async function () {
  await this.paymentPage.selectCardPaymentIfNotChecked();
  
  await this.page.locator('#card-number').fill('4111111111111111');
  await this.page.locator('#expiry').fill('12/25');
  await this.page.locator('#cvv').fill('123');
  await this.page.locator('#confirm-payment').click();
});

Then('HIS Reservation Number should be displayed', /** @this {CustomWorld} */ async function () {
  await expect(this.page.locator('#reservation-number')).toBeVisible();
});
