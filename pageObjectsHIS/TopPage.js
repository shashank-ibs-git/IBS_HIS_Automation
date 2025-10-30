
class TopPage {
  constructor(page) {
    this.page = page;

    // Selectors from your Playwright snippet
    this.headerLogo = page.locator("a.header-main__logo img[alt='HIS']");
    this.headerDropdown = page.locator("button.header-new-area__heading.is-visible");

     // Product tab locators
    this.tourTab = page.locator('a.p-global-nav__link--icon-bag');
    this.flightTab = page.locator('a.p-global-nav__link--icon-airplane');
    this.flightHotelTab = page.locator('a.p-global-nav__link--icon-airplane-and-bed');
    this.hotelTab = page.locator('a.p-global-nav__link--icon-bed');
    this.localTourTab = page.locator('a.p-global-nav__link--icon-snorkel');
    this.carRentalTab = page.locator('a.p-global-nav__link--icon-car');

    this.roundTripOption = page.locator("//label[@for='searchRadio01']");
    this.departureField = page.locator("//input[@placeholder='出発地を入力']");
    this.departureSuggestionField = page.locator("//input[@placeholder='都市名/空港名を入力または下記より選択']");
    this.destinationField = page.locator("//input[@placeholder='目的地を入力']");
    this.destinationSuggestionField = page.locator("//input[@placeholder='都市名/空港名を入力または下記より選択']");
    this.departureDateField = page.locator("//span[@class='c-input__text' and text()='出発日']");
    this.destinationDateField = page.locator("//span[@class='c-input__text' and text()='復路出発日']");

    //passenger selection locators
    this.passengerSelectionField = page.locator("//input[@id='room']");
    this.adultIncrementButton = page.locator("//button[@aria-label='大人の人数を増やす']");
    this.childIncrementButton = page.locator("//button[@aria-label='子供の人数を増やす']");
    this.infantIncrementButton = page.locator("//button[@aria-label='幼児の人数を増やす']");
    this.passengerSelectionButton = page.locator("//button//span[text()='確定する']");

    this.passengerSeatConfirmButton = page.locator("//button//span[text()='確定する']")
    this.searchButton = page.locator("//button//span[text()='航空券を検索']");

  }

  async goto() {
    await this.page.goto('/');
  }

  async roundtripSelection(){
    const isClicked = await this.roundTripOption.isChecked();
    if(!isClicked){
      await this.roundTripOption.click();
    }

  }
    async selectDepartureCity(city) {
      await this.departureField.click();
      await this.departureSuggestionField.fill(city);
      const cityOption = this.page.locator(
      `//div[@class='c-destination-history overflow-autosuggest']//span[normalize-space(.)='${city}']`
    ).first();
    // wait until the option becomes visible, then click
    await cityOption.waitFor({ state: 'visible', timeout: 10000 });
    await cityOption.click();
    }
  async selectDestinationCity(city) {
    await this.destinationField.click();
    await this.destinationSuggestionField.fill(city);

    const cityOption = this.page.locator(
      `//div[@class='c-destination-history overflow-autosuggest']//span[normalize-space(.)='${city}']`
    ).first();
    // wait until the option becomes visible, then click
    await cityOption.waitFor({ state: 'visible', timeout: 10000 });
    await cityOption.click();
  }
  async selectDepartureDate(month, year, date) {
    await this.departureDateField.click();
    await this.selectCalendarDate2(month, year, date);
  }

  async selectReturnDate(month, year, date) {
    await this.destinationDateField.click();
    await this.selectCalendarDate2(month, year, date);
  }
 
  async setAdultPassengerCount(desiredCount) {
  await this.passengerSelectionField.click();
  let valueField = this.page.locator("//dt[text()='大人　12歳以上']//parent::div//input").inputValue();
  const plusBtn = this.page.locator("//dt[text()='大人　12歳以上']//parent::div//button[contains(@class,'js-count-up')]");
  const minusBtn = this.page.locator("//dt[text()='大人　12歳以上']//parent::div//button[contains(@class,'js-count-down')]");

  let current = parseInt(await valueField);

  if (current === desiredCount) return; // already correct

  const btn = desiredCount > current ? plusBtn : minusBtn;

  while (current !== desiredCount) {
    await btn.click();
    valueField = this.page.locator("//dt[text()='大人　12歳以上']//parent::div//input").inputValue();
    current = parseInt(await valueField);
  }
}

  async setChildrenPassengerCount(desiredCount) {
  await this.passengerSelectionField.click();
  let valueField = this.page.locator("//dt[text()='子供　2〜11歳']//parent::div//input").inputValue();
  const plusBtn = this.page.locator("//dt[text()='子供　2〜11歳']//parent::div//button[contains(@class,'js-count-up')]");
  const minusBtn = this.page.locator("//dt[text()='子供　2〜11歳']//parent::div//button[contains(@class,'js-count-down')]");

  let current = parseInt(await valueField);

  if (current === desiredCount) return; // already correct

  const btn = desiredCount > current ? plusBtn : minusBtn;

  while (current !== desiredCount) {
    await btn.click();
    valueField = this.page.locator("//dt[text()='子供　2〜11歳']//parent::div//input").inputValue();
    current = parseInt(await valueField);
  }
  //hardcoded to select age 2 for first child
  if (desiredCount > 0) {
    const childAgeDropdown = this.  page.locator("//select[contains(@class,'js-child-age')]");
    await childAgeDropdown.waitFor({ state: 'visible' });
    await childAgeDropdown.selectOption({ label: '3歳' });
  }
  //setInfantPassengerCount();
  const plusBtn1 = this.page.locator("//dt[text()='幼児（座席不要） 0〜1歳']//parent::div//button[contains(@class,'js-count-up')]");
  await plusBtn1.click();
}

async selectSeatClass(value) {
  const input = this.page.locator(`input[name="seatClass01"][value="${value}"]`);
  const label = this.page.locator(`input[name="seatClass01"][value="${value}"] + label`);

  await label.waitFor({ state: 'visible' }); // wait until it's ready

  const isSelected = await input.isChecked();

  if (!isSelected) {
    await label.click(); // click only if not already selected
  } 
  return await input.isChecked();
}

async confirmPassengerSelection() {
  await this.passengerSelectionButton.click();
}


async selectCalendarDate(month, year, date) {
  // Convert values to numbers/strings
  month = Number(month);
  year = Number(year);
  date = String(date).padStart(2, '0'); // zero-pad day

  const nextButton  = this.page.locator("//button[@aria-label='Next Month']");
  const prevButton  = this.page.locator("//button[@aria-label='Previous Month']");
  const monthLabelR = this.page.locator("(//div[@class='react-datepicker__current-month'])[2]"); // right header

  // Navigate until the RIGHT header shows target month/year (keeps your existing logic)
  for (let i = 0; i < 24; i++) {
    const txt = (await monthLabelR.innerText()).trim(); // e.g. "10月 2025"
    const [mTxt, yTxt] = txt.split(' ');
    const curM = parseInt(mTxt.replace('月', ''), 10);
    const curY = parseInt(yTxt, 10);

    if (curM === month && curY === year) break;

    if (curY < year || (curY === year && curM < month)) {
      await nextButton.click();
    } else {
      await prevButton.click();
    }
    await this.page.waitForTimeout(150);
  }

  // 🔎 Robust: find the panel whose header matches `${month}月 ${year}`
  const headerText = `${month}月 ${year}`;
  const monthContainers = this.page.locator('.react-datepicker__month-container');
  const targetPanel = monthContainers.filter({
    has: this.page.locator('.react-datepicker__current-month', { hasText: headerText })
  });

  // Ensure the correct panel is present
  await targetPanel.first().locator('.react-datepicker__current-month', { hasText: headerText }).waitFor();

  // Click the day inside ONLY that panel
  const dayInTargetPanel = targetPanel.locator(
    `.react-datepicker__day--0${date}:not(.react-datepicker__day--outside-month):not([aria-disabled="true"])`
  );
  await dayInTargetPanel.first().click();
}

async selectCalendarDate1(targetMonth, targetYear, targetDay) {
  const nextBtn = this.page.locator("//button[@aria-label='Next Month']");
  const prevBtn = this.page.locator("//button[@aria-label='Previous Month']");
  const headers = this.page.locator("//div[@class='react-datepicker__current-month']");
  const monthContainers = this.page.locator("//div[contains(@class,'react-datepicker__month-container')]");

  // helper: get month/year numbers from header text like "11月 2025"
  const getMonthYear = async (header) => {
    const text = (await header.innerText()).trim();
    const [monthTxt, yearTxt] = text.split(' ');
    return { month: parseInt(monthTxt.replace('月', '')), year: parseInt(yearTxt) };
  };

  for (let i = 0; i < 24; i++) {
    const left = await getMonthYear(headers.nth(0));
    const right = await getMonthYear(headers.nth(1));

    // check if target matches left or right calendar
    if (left.month === targetMonth && left.year === targetYear) {
      await monthContainers.nth(0)
        .locator(".react-datepicker__day:not(.react-datepicker__day--outside-month)")
        .getByText(String(targetDay), { exact: true })
        .click();
      return;
    }

    if (right.month === targetMonth && right.year === targetYear) {
      await monthContainers.nth(1)
        .locator(".react-datepicker__day:not(.react-datepicker__day--outside-month)")
        .getByText(String(targetDay), { exact: true })
        .click();
      return;
    }

    // decide which direction to move
    if (right.year < targetYear || (right.year === targetYear && right.month < targetMonth)) {
      await nextBtn.click();
    } else {
      await prevBtn.click();
    }

    await this.page.waitForTimeout(200);
  }

  throw new Error(`Could not find month ${targetMonth}/${targetYear}`);
}

async selectCalendarDate2(targetMonth, targetYear, targetDay) {
  const nextBtn = this.page.locator("//button[@aria-label='Next Month']");
  const prevBtn = this.page.locator("//button[@aria-label='Previous Month']");
  const headers = this.page.locator("//div[@class='react-datepicker__current-month']");
  const months  = this.page.locator("//div[contains(@class,'react-datepicker__month-container')]");

  targetMonth = Number(targetMonth);
  targetYear  = Number(targetYear);
  const idx = (y, m) => y * 12 + m;

  const parseHeader = async (h) => {
    const t = (await h.innerText()).trim().replace(/\s+/g, ' '); // normalize spaces
    const [mTxt, yTxt] = t.split(' ');
    return { m: parseInt(mTxt.replace('月', ''), 10), y: parseInt(yTxt, 10) };
  };

  for (let i = 0; i < 24; i++) {
    const left  = await parseHeader(headers.nth(0));
    const right = await parseHeader(headers.nth(1));

    const leftIdx   = idx(left.y, left.m);
    const rightIdx  = idx(right.y, right.m);
    const targetIdx = idx(targetYear, targetMonth);

    const dd = String(Number(targetDay)).padStart(2, '0');

    // If either panel matches, click inside that panel and return
    if (targetIdx === leftIdx) {
      await months.nth(0)
        .locator(`.react-datepicker__day--0${dd}:not(.react-datepicker__day--outside-month):not([aria-disabled="true"])`)
        .first()
        .click();
      return;
    }
    if (targetIdx === rightIdx) {
      await months.nth(1)
        .locator(`.react-datepicker__day--0${dd}:not(.react-datepicker__day--outside-month):not([aria-disabled="true"])`)
        .first()
        .click();
      return;
    }

    // Decide direction using the range [left, right]
    if (targetIdx > rightIdx) {
      await nextBtn.click();        // target is after the right panel
    } else if (targetIdx < leftIdx) {
      await prevBtn.click();        // target is before the left panel
    } else {
      // Between left and right (shouldn't happen for contiguous months) — nudge forward
      await nextBtn.click();
    }

    await this.page.waitForTimeout(150);
  }

  throw new Error(`Could not reach ${targetYear}-${String(targetMonth).padStart(2, '0')}`);
}







};




module.exports = { TopPage };
  