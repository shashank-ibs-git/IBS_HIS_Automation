class PassengerInfoPage {
  constructor(page) {
    this.page = page;
    this.passengerInfoPageSection = page.locator(".p-section__contents").first();
    this.loginAndRegisterButton = page.locator("//div[@class='p-login__button']//button");

    //==Applicant Information locators==
    this.applicantInfoSection = page.locator("//div[@class='p-reservation-info']//h3[text()='申込者情報']");
    this.applicantInfoNameKanaField = page.locator("//h3[text()='申込者情報']//parent::div/following-sibling::div/dl");

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
    this.nextToAddOnsButton = page.locator("//a/span[contains(text(),'追加サービスの選択に進む')]");

    // ==== Minor consent ====
    this.minorConsentCheckbox = (index) => page.locator(`label[for='parentconsent01_${index}']`);

    // ==== Passenger heading blocks (dynamic classification) ====
    this.passengerHeadingLocator = page.locator("//h5[contains(@class,'p-reserve-input-heading')]");
  }

  
async clickLoginAndRegister() {
    const loginRegisterBtn = this.page.locator("//div[@class='p-login__button']//button");
    await loginRegisterBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

async getApplicantInformation() {
  // Find the part of the page that contains applicant information
  const dl = this.applicantInfoNameKanaField;
  // Get all the text from <dt> tags (these are labels like "Name", "Date of Birth", etc.)
  const labels = (await dl.locator("dt").allInnerTexts()).map(t => t.trim());
  // Get all the text from <dd> tags (these are the actual values entered)
  const rawValues = await dl.locator("dd").allInnerTexts();
  // Go through each value and clean it up
  const values = rawValues.map((text, index) => {
    // Remove spaces at the beginning and end
    let value = text.trim();

    // If this label is for "Date of Birth" (生年月日), remove all extra spaces inside too
    if (labels[index] && labels[index].includes("生年月日")) {
      value = value.replace(/\s+/g, ""); // removes all spaces inside the string
    }
    // Return the cleaned value
    return value;
  });

  // Combine labels and values into one object (like { Name: "コクナイ タロウ", DOB: "1989年8月17日" })
  const info = {};
  for (let i = 0; i < labels.length; i++) {
    info[labels[i]] = values[i] || "";
  }
  // Return the final object
  return info;
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
    const yearNum = parseInt(year, 10);
    if(yearNum >= new Date().getFullYear() - 18) { // less than 18 years old
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

  // ===================== Dynamic Passenger Filling =====================
  /**
   * Classify passenger heading DOM nodes into adult/child/infant buckets.
   * @returns {Promise<Array<{index:number,type:string,rawText:string}>>}
   */
  async classifyDomPassengerHeadings() {
    const headingCount = await this.passengerHeadingLocator.count();
    const results = [];
    for (let i = 0; i < headingCount; i++) {
      const raw = (await this.passengerHeadingLocator.nth(i).textContent()) || '';
      const text = raw.trim();
      let type = null;
      if (/幼児/.test(text)) type = 'infant';
      else if (/子供/.test(text)) type = 'child';
      else if (/大人/.test(text) || /代表者/.test(text)) type = 'adult';
      if (type) results.push({ index: i, type, rawText: text });
    }
    return results;
  }

  /**
   * Map data passengers to DOM headings based on requested counts in flightSearch.
   * @param {Array<Object>} dataPassengers passengers from sharedData (each must have a type field)
   * @param {Object} flightSearch contains adultPassengerCount, childPassengerCount, infantPassengerCount
   * @returns {Promise<Array<{domIndex:number,data:Object}>>}
   */
  async mapPassengersToDom(dataPassengers, flightSearch = {}) {
    const dom = await this.classifyDomPassengerHeadings();
    if (!dom.length) throw new Error('No passenger heading blocks found on Passenger Info page.');

    // Organize data by type
    const buckets = { adult: [], child: [], infant: [] };
    for (const p of dataPassengers) {
      const t = (p.type || '').toLowerCase();
      if (!['adult','child','infant'].includes(t)) {
        throw new Error(`Unknown passenger type '${p.type}' in testData.json`);
      }
      buckets[t].push(p);
    }

    const desired = {
      adult: flightSearch.adultPassengerCount ?? buckets.adult.length,
      child: flightSearch.childPassengerCount ?? buckets.child.length,
      infant: flightSearch.infantPassengerCount ?? buckets.infant.length
    };
    // --- Dynamic auto-cloning logic ---
    // If we have fewer data passengers than desired for a type but at least 1 sample, clone the first one.
    const autoCloneType = (type) => {
      const existing = buckets[type];
      const need = desired[type];
      if (existing.length === 0) return; // cannot clone if we have no template
      if (existing.length >= need) return; // already enough
      const template = existing[0];
      for (let i = existing.length; i < need; i++) {
        // Create a new shallow copy and adjust given name + date of birth.
        const clone = { ...template };
        // Append an alphabetic suffix (A, B, C, ... AA, AB ...) instead of digits (fields reject numbers).
        const baseGiven = String(template.given || '').replace(/\d+$/, '').replace(/[A-Z]+$/,'');
        const suffixIndex = i - existing.length; // first clone -> 0
        const toLetters = (n) => {
          let s = '';
          n = n; // zero-based
          do {
            s = String.fromCharCode(65 + (n % 26)) + s;
            n = Math.floor(n / 26) - 1; // classic spreadsheet column algorithm adjusted for zero-base
          } while (n >= 0);
          return s;
        };
        const letterSuffix = toLetters(suffixIndex); // A, B, C, ... Z, AA, AB, ...
        clone.given = `${baseGiven}${letterSuffix}`; // e.g. TARO + A, TARO + B ...
        // Adjust date of birth: add i days to original date safely.
        const y = parseInt(template.y, 10) || 2000;
        const m = parseInt(template.m, 10) || 1; // 1-12
        const d = parseInt(template.d, 10) || 1; // 1-31
        const baseDate = new Date(y, m - 1, d);
        const shifted = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000)); // add i days
        clone.y = String(shifted.getFullYear());
        clone.m = String(shifted.getMonth() + 1).padStart(2,'0');
        clone.d = String(shifted.getDate()).padStart(2,'0');
        // Keep gender/nationality/surname/type same.
        existing.push(clone);
      }
    };

    autoCloneType('adult');
    autoCloneType('child');
    autoCloneType('infant');

    // After cloning, trim any excess if data list was longer than desired.
    for (const key of Object.keys(buckets)) {
      if (buckets[key].length > desired[key]) {
        buckets[key] = buckets[key].slice(0, desired[key]);
      }
    }

    if (desired.infant > desired.adult) {
      throw new Error(`Invalid passenger mix requested: ${desired.infant} infants but only ${desired.adult} adults.`);
    }

    const counters = { adult: 0, child: 0, infant: 0 };
    const assigned = [];
    for (const block of dom) {
      const pool = buckets[block.type];
      const used = counters[block.type];
      if (used >= pool.length) {
        // Extra DOM form beyond desired count -> skip
        continue;
      }
      const dataPassenger = pool[used];
      counters[block.type]++;
      assigned.push({ domIndex: block.index, data: dataPassenger });
    }

    // Ensure DOM rendered at least desired count for each type
    for (const t of ['adult','child','infant']) {
      if (counters[t] < desired[t]) {
        throw new Error(`Rendered ${t} forms (${counters[t]}) less than requested count (${desired[t]}).`);
      }
    }
    return assigned;
  }

  /**
   * Fill passenger forms given assignments (domIndex + data)
   * @param {Array<{domIndex:number,data:Object}>} assignments
   */
  async fillPassengerForms(assignments) {
    for (const { domIndex, data } of assignments) {
      await this.fillNameKatakana(domIndex, data.surname, data.given);
      await this.fillBirthDate(domIndex, data.y, data.m, data.d);
      if (data.gender) {
        await this.selectGender(String(domIndex), data.gender);
      }
      if (data.nationality) {
        await this.selectNationality(String(domIndex), data.nationality);
      }
    }
  }

  /**
   * Orchestrate dynamic passenger entry including contacts and return expected snapshot.
   * @param {Array<Object>} dataPassengers from sharedData.passengers
   * @param {Object} contacts from sharedData.contacts
   * @param {Object} flightSearch search counts
   * @returns {Promise<Array<Object>>} expectedPassengers snapshot
   */
  async fillAllPassengers(dataPassengers, contacts = {}, flightSearch = {}) {
    const assignments = await this.mapPassengersToDom(dataPassengers, flightSearch);
    await this.fillPassengerForms(assignments);
    if (contacts.phone) await this.fillPhoneContact(contacts.phone);
    if (contacts.domestic) {
      await this.fillDomesticContactInformation(
        contacts.domestic.nameKana,
        contacts.domestic.phone,
        contacts.domestic.relationship
      );
    }
    return assignments.map(({ domIndex, data }) => ({
      domIndex,
      type: data.type,
      surname: data.surname,
      given: data.given,
      y: data.y,
      m: data.m,
      d: data.d,
      gender: data.gender,
      nationality: data.nationality
    }));
  }




}


 

  //login and Register Module


module.exports = { PassengerInfoPage };