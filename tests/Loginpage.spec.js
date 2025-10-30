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

  await this.passengerInfoPage.fillNameKatakana('0', 'KOKUNAI', 'TARO');// First Passenger
  await this.passengerInfoPage.fillBirthDate('0', '1990', '12', '12');// First Passenger
  await this.passengerInfoPage.selectGender('0', 'male');// First Passenger
  await this.passengerInfoPage.selectNationality('0', 'アンギラ');// First Passenger // 日本
  await this.passengerInfoPage.fillNameKatakana('1', 'KOKUNAI', 'HANAKO');// Child Passenger
  await this.passengerInfoPage.fillBirthDate('1', '2021', '12', '12');// Child Passenger
  await this.passengerInfoPage.selectGender('1', 'female');// Child Passenger
  await this.passengerInfoPage.selectNationality('1', 'アンギラ');// Child Passenger
  await this.passengerInfoPage.fillNameKatakana('2', 'KOKUNAI', 'TANAKO');// infant Passenger
  await this.passengerInfoPage.fillBirthDate('2', '2024', '01', '05');// infant Passenger
  await this.passengerInfoPage.selectGender('2', 'male');// infant Passenger
  await this.passengerInfoPage.selectNationality('2', 'アンギラ');// infant Passenger

  
});