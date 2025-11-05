class ConfirmInputPage {
  constructor(page) {
    this.page = page;
    this.confirmInputBreadcrumbHeader = page.locator("(//ol//p)[2]");
    this.policyHolderNames = page.locator("span.p-set-insurance-card__policyholder-name");
    this.applicantInformationTable = page.locator("//h2[text()='申込者情報']//parent::div/following-sibling::div//table/tbody");
    this.passengerInformationRows = (index) => this.page.locator(`(//div[contains(@class,'p-reserve-info__contents-item')])[${index + 1}]`);
    this.proceedToPaymentButton =  page.getByRole('button', { name: 'お支払いに進む' });
    this.errorAfterProceedToPayment = page.locator("//p[contains(@class,'c-input__error')]").first();
    this.DEFAULT_TIMEOUT = 30000;
  }
async getApplicantInformation() {
  // Locate the applicant information table
  await this.applicantInformationTable.waitFor({ state: 'attached' });
  const table = this.applicantInformationTable;

  // Find all the rows inside that table
  const rows = await table.locator("tr").all();
  // Create an empty object to store the results
  const info = {};

  // Loop through each row and extract label + value
  for (const row of rows) {
    const label = (await row.locator("th").innerText()).trim();
    const value = (await row.locator("td").innerText()).trim();
    info[label] = value;
  }

  return info; // Return all key-value pairs
}

// Booked Passenger information
async getPassengerInfo(index) {
  const section = this.passengerInformationRows(index);
  // Ensure the table content exists and is visible before reading
  await section.locator('tr').first().waitFor({ state: 'visible' });

  // Do a single evaluation pass in the page to avoid detachment issues
  const entries = await section.locator('tr').evaluateAll((trs) =>
    trs.map(tr => {
      const th = tr.querySelector('th');
      const td = tr.querySelector('td');
      if (!th || !td) return null;
      const k = (th.textContent || '').trim();
      const v = (td.textContent || '').trim();
      return k && v ? [k, v] : null;
    }).filter(Boolean)
  );

  // If duplicate keys exist, last one wins; change if you need arrays
  return Object.fromEntries(entries);
}

async proceedToPayment(timeout = this.DEFAULT_TIMEOUT, pauseMs = 1000) {
  await this.proceedToPaymentButton.waitFor({ state: 'visible', timeout });
  await this.proceedToPaymentButton.click({ trial: true });
  await this.proceedToPaymentButton.click(); 
  
  if (await this.errorAfterProceedToPayment.isVisible()) {
    const errorMessage = await this.errorAfterProceedToPayment.innerText();
    throw new Error(`Error after proceeding to payment: ${errorMessage}`);
  }


}
}

module.exports = { ConfirmInputPage };