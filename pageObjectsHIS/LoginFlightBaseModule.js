class LoginFlightBaseModule {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator("input#username");
    this.emailContinueButton = page.locator("//button[contains(@class,'login-id')]");
    this.passwordField = page.locator("input#password");
    this.passwordContinueButton = page.locator("//button[contains(@class,'login-password')]");
    this.abbortPassKeyButton = page.locator("//button[@value='abort-passkey-enrollment']");
}

  async LogintoFlightBase(email, password) {
    await this.emailField.fill(email);
    await this.emailContinueButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.passwordField.fill(password);
    await this.passwordContinueButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.abortPasskeyEnrollmentIfPresent();
  }

  async abortPasskeyEnrollmentIfPresent() {
    if (await this.abbortPassKeyButton.isVisible({ timeout: 5000 })) {
      await this.abbortPassKeyButton.click();
      await this.page.waitForLoadState('networkidle');
    }
}














}

module.exports = { LoginFlightBaseModule };
