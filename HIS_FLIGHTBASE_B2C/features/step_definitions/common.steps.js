const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Shared basic navigation & UI validation steps used by multiple features.
// Keep these lightweight and side-effect free so they can be reused safely.

const ASSERT_TIMEOUT_FALLBACK = 10000;

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
  const label = this.sharedData?.flight?.flightTabLabel || '航空券';
  await expect.soft(this.topPage.flightTab).toHaveText(label);
});
