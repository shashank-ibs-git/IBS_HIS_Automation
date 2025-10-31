import { test, expect } from '@playwright/test';
const LoginPage= require("../pages/LoginPage"); 

test('Testing Login Method', async ({ page }) => {
  //await page.goto('https://playwright.dev/');

 const loginPage = new LoginPage(page);
 loginPage.testingMethod1();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});


test('Testing Login Method 2', async ({ page }) => {

});