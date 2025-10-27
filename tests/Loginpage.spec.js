import { test, expect } from '@playwright/test';
const LoginPage= require("../pages/LoginPage"); 

test('Testing Login Method', async ({ page }) => {
  //await page.goto('https://playwright.dev/');

 const loginPage = new LoginPage(page);
 loginPage.testingMethod2();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});


test('Testing Login Method 2', async ({ page }) => {

  await page.goto('https://stg-overseas-air.his-j.com/');
  await page.getByRole('textbox', { name: '例：TARO' }).first().click();
  await page.getByRole('textbox', { name: '例：TARO' }).first().fill('TARO');
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).first().click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).first().click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).first().fill('KOKUNAI');
  await page.getByRole('combobox').first().selectOption('1990');
  await page.getByRole('combobox').nth(1).selectOption('12');
  await page.getByRole('combobox').nth(2).selectOption('12');
  await page.getByText('男性').first().click();
  await page.getByRole('combobox').nth(3).selectOption('リヒテンシュタイン');
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).fill('KOKUNAI');
  await page.getByRole('textbox', { name: '例：TARO' }).nth(1).click();
  await page.getByRole('textbox', { name: '例：TARO' }).nth(1).fill('TARO');
  await page.getByText('男性').nth(1).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).fill('HANAKO');
  await page.getByText('ご予約情報入力申込者情報お名前コクナイ タロウ生年月日').click();
  await page.locator('select[name="birthYear"]').nth(1).selectOption('2021');
  await page.locator('select[name="birthMonth"]').nth(1).selectOption('12');
  await page.locator('select[name="birthDay"]').nth(1).selectOption('12');
  await page.getByText('ご予約情報入力申込者情報お名前コクナイ タロウ生年月日').click();
  await page.locator('select[name="nationality"]').nth(1).selectOption('アンギラ');
  
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).fill('TANAKO');
  await page.getByRole('textbox', { name: '例：TARO' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).fill('');
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(1).fill('KOKUNAI');
  await page.getByRole('textbox', { name: '例：TARO' }).nth(1).click();
  await page.getByRole('textbox', { name: '例：TARO' }).nth(1).fill('HANAKO');
  await page.getByRole('textbox', { name: '例：TARO' }).nth(1).press('CapsLock');
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：KOKUNAI' }).nth(2).fill('KOKUNAI');
  await page.getByRole('textbox', { name: '例：TARO' }).nth(2).click();
  await page.getByRole('textbox', { name: '例：TARO' }).nth(2).fill('TANAKO');
  await page.locator('select[name="birthYear"]').nth(2).selectOption('2024');
  await page.locator('select[name="birthMonth"]').nth(2).selectOption('12');
  await page.getByText('生年月日年').nth(2).click();
  await page.locator('select[name="birthDay"]').nth(2).selectOption('12');
  await page.getByText('女性').nth(2).click();
  await page.locator('select[name="nationality"]').nth(2).selectOption('アンギラ');
  await page.getByRole('combobox').nth(3).selectOption('アンギラ');
  await page.locator('#phoneNumber_contact').click();
  await page.locator('#phoneNumber_contact').fill('1234567890');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).press('ControlOrMeta+V');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('山田 一郎');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('F');
  await page.getByRole('textbox', { name: '例：09012345678' }).click();
  await page.getByRole('textbox', { name: '例：09012345678' }).click();
  await page.getByRole('textbox', { name: '例：09012345678' }).fill('12879000');
  await page.getByText('ご予約情報入力申込者情報お名前コクナイ タロウ生年月日').click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('D');
  await page.getByRole('textbox', { name: '例：父' }).click();
  await page.getByRole('textbox', { name: '例：父' }).dblclick();
  await page.getByRole('textbox', { name: '例：父' }).press('ControlOrMeta+V');
  await page.getByRole('textbox', { name: '例：父' }).fill('父');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).dblclick();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).press('ControlOrMeta+V');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('山田 一郎');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).press('ControlOrMeta+V');
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('山田 一郎');
  await page.locator('a').filter({ hasText: '追加サービスの選択に進む' }).click();
  await page.getByText('未成年の旅行者です。親権者の同意を得ています。').first().click();
  await page.getByText('未成年の旅行者です。親権者の同意を得ています。').nth(1).click();
  await page.locator('a').filter({ hasText: '追加サービスの選択に進む' }).click();
  await page.getByRole('textbox', { name: '例：エイチ アイコ' }).fill('4');
});