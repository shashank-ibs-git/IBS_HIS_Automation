class PassengerInfoPage {
  constructor(page) {
    this.page = page;
    this.passengerInfoPageSection = page.locator(".p-section__contents").first();
    this.loginAndRegisterButton = page.locator("//div[@class='p-login__button']//button");
    this.applicantInfoSection = page.locator("//div[@class='p-reservation-info']//h3[text()='申込者情報']");

    // ==== Passenger form fields ====
     this.surnameKanaLocator = page.getByRole('textbox', { name: '例：KOKUNAI' });
    this.givenKanaLocator = page.getByRole('textbox', { name: '例：TARO' });
    this.birthYearLocator = page.locator('select[name="birthYear"]');
    this.birthMonthLocator = page.locator('select[name="birthMonth"]');
    this.birthDayLocator = page.locator('select[name="birthDay"]');
    this.genderMaleLocator = page.getByText('男性');
    this.genderFemaleLocator = page.getByText('女性');
    this.nationalityLocator = page.locator('select[name="nationality"]');
    // ==== Contact info ====
    this.phoneContactField = page.locator('#phoneNumber_contact');
    //=== Domestic emergency contacts ====
    this.contactNameKanaField = page.getByRole('textbox', { name: '例：エイチ アイコ' });
    this.contactPhoneExampleField = page.getByRole('textbox', { name: '例：09012345678' });
    this.relationship = page.locator('#relationShip_emergency');
    // ==== Actions / navigation ====
    this.nextToAddOnsButton = page.locator("//a[contains(text(),'追加サービスの選択に進む')]");

    // ==== Minor consent ====
    this.minorConsentCheckbox = (index) => page.locator(`label[for='parentconsent01_${index}']`);
  }

  
async clickLoginAndRegister() {
    const loginRegisterBtn = this.page.locator("//div[@class='p-login__button']//button");
    await loginRegisterBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

    /**
   * Fill passenger name (Katakana) for a specific passenger block
   * @param {number} index 0-based index of the passenger (0 = first)
   * @param {string} surnameKana e.g. 'KOKUNAI'
   * @param {string} givenKana e.g. 'TARO'
   */
   async fillNameKatakana(index, surnameKana, givenKana) {
    await this.surnameKanaLocator.nth(index).click();
    await this.surnameKanaLocator.nth(index).fill(surnameKana);
    await this.givenKanaLocator.nth(index).click();
    await this.givenKanaLocator.nth(index).fill(givenKana);
  }

   /**
   * Select date of birth for a passenger
   * @param {number} index 0-based index for the passenger (0 = first)
   * @param {string} year e.g. '1990'
   * @param {string} month e.g. '12'
   * @param {string} day e.g. '25'
   */
  async fillBirthDate(index, year, month, day) {
    await this.birthYearLocator.nth(index).selectOption(year);
    await this.birthMonthLocator.nth(index).selectOption(month);
    await this.birthDayLocator.nth(index).selectOption(day);
    if(year >= new Date().getFullYear() - 5) {
      await this.page.waitForTimeout(500); // slight delay to allow minor consent checkbox to appear
      await this.minorConsentCheckbox(index).click();
  }
}

    /**
   * Select gender for a passenger
   */
  async selectGender(index, gender) {
    if (gender === 'male') {
      await this.genderMaleLocator.nth(index).click();
    } else {
      await this.genderFemaleLocator.nth(index).click();
    }
  }

   /**
   * Select nationality
   */
  async selectNationality(index, nationalityText) {
    //await this.nationalityLocator.nth(index).click();
    await this.nationalityLocator.nth(index).selectOption({ label: nationalityText });
  }

  async fillPhoneContact(phoneNumber) {
    await this.phoneContactField.fill(phoneNumber);
  }

   async fillDomesticContactInformation(nameKana, phoneNumber, relationshipType) {
    await this.contactNameKanaField.fill(nameKana);
    await this.contactPhoneExampleField.fill(phoneNumber);
    await this.relationship.fill(relationshipType);
  }

  async proceedToAddOns() {
    await this.nextToAddOnsButton.click();
    await this.page.waitForLoadState('networkidle');
  }




}


 

  //login and Register Module


module.exports = { PassengerInfoPage };