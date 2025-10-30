class AdditionalServicePage {
  constructor(page) {
    this.page = page;
    this.addOnServiceBreadcrumbHeader = page.locator("(//ol//p)[1]");
    this.hisWebSetInsuranceSection = page.locator("//section[@id='option03']");
    this.additionalCheckedBagageSection = page.locator("//section[@id='option02']");
    this.outboundCheckedBaggageOption = page.locator("//div[contains(@class,'p-checked-baggage__baggage-cards')][preceding-sibling::h3[1][normalize-space()='往路']]");
    this.returnCheckedBaggageOption = page.locator("//div[contains(@class,'p-checked-baggage__baggage-cards')][preceding-sibling::h3[2][normalize-space()='往路']]");
    this.insurancePolicyHolderName = page.locator("span.p-set-insurance-card__policyholder-name");
    this.proceedToConfirmInputButton = page.locator("//button[contains(@class,'p-next-button')]");

  }

  async clickonadditionalCheckedBaggageSection() {
    await this.additionalCheckedBagageSection.click();
    await this.page.waitForTimeout(500); // Wait for 500 milliseconds to ensure the section is expanded
  }

  async

async selectBaggageOptions(baggageLocator, optionText = '20kg') {
  const cards = baggageLocator;
  const cardCount = await cards.count();

  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);
    const button = card.locator('button');
    await button.first().waitFor({ state: 'visible' });

    // open
    await button.first().click();

    // wait for dropdown
    await card.locator('div.p-baggage-list__item select').first().waitFor({ state: 'visible' });

    const selects = card.locator('div.p-baggage-list__item select');
    const selectCount = await selects.count();

    for (let j = 0; j < selectCount; j++) {
      const select = selects.nth(j);

      // find option partially matching "20kg"
      const value = await select.evaluate((el, text) => {
        const opt = [...el.options].find(o => o.textContent.includes(text));
        return opt?.value;
      }, optionText);

      if (value) {
        await select.selectOption(value);
        //console.log(`✅ Selected ${optionText} for passenger ${j + 1} in card ${i + 1}`);
      } else {
        console.warn(`⚠️ No option containing "${optionText}" found for passenger ${j + 1} in card ${i + 1}`);
      }
    }

    // close dropdown
    await button.first().click();
    //console.log(`🔒 Closed baggage dropdown for card ${i + 1}`);
  }
}

async clickOutboundBaggageAndSelect20kg() {
  await this.selectBaggageOptions(this.outboundCheckedBaggageOption, '20kg');
}

async clickReturnCheckedBaggageAndSelect20kg() {
  await this.selectBaggageOptions(this.returnCheckedBaggageOption, '20kg');
}




  async getInsurancePolicyHolders() {
    await this.hisWebSetInsuranceSection.click();
    await this.insurancePolicyHolderName.first().waitFor({ state: 'visible' });
    const names = await this.insurancePolicyHolderName.allTextContents();

    return names.map(nameText => {
      const [lastName, firstName] = nameText.split('/');
      return {
        lastName: lastName?.trim() || '',
        firstName: firstName?.trim() || ''
      };
    });
  }

  async proceedToConfirmInput() {
    await this.proceedToConfirmInputButton.click();
    await this.page.waitForLoadState('networkidle');
  }

}

module.exports = { AdditionalServicePage };