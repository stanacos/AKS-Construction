const { test, expect } = require('@playwright/test');
const { matchers } = require('playwright-expect');

// add custom matchers
expect.extend(matchers);

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //dom hack to get to the checkbox

test('disablelocalaccounts-not-present-on-lean-preset', async ({ page }) => {

  // The lean preset inherits enable_aad=true from config.json but does not set AksDisableLocalAccounts
  await page.goto('http://localhost:3000/AKS-Construction');

  //Check AksDisableLocalAccounts parameter is absent
  await page.waitForSelector('[data-testid="deploy-deploycmd"]')
  const clitextbox = await page.$('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('AksDisableLocalAccounts')

});

test('disablelocalaccounts-toggle-on-securelab-preset', async ({ page }) => {

  // The secureLab preset enables AAD with Azure RBAC
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  //Check AAD parameter is present
  await page.waitForSelector('[data-testid="deploy-deploycmd"]')
  const clitextbox = await page.$('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).toContainText('enable_aad=true')
  await expect(clitextbox).not.toContainText('AksDisableLocalAccounts')

  // Click the 2nd Tab in the portal Navigation Pivot (cluster details)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(2)')

  //Inspect the local accounts checkbox, make sure its unchecked (secureLab doesn't set it)
  await page.waitForSelector('[data-testid="cluster-localaccounts-Checkbox"]')
  const checkbox2 = await page.$('[data-testid="cluster-localaccounts-Checkbox"]')
  await expect(checkbox2).not.toBeChecked();
  await expect(checkbox2).toBeVisible();

  //Enable the Checkbox
  await page.click('[data-testid="cluster-localaccounts-Checkbox"]' + chk)
  await expect(checkbox2).toBeChecked();

  //Go back to the deploy tab.
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)')

  //The setting should be present now
  const clitextboxrevisted = await page.$('[data-testid="deploy-deploycmd"]')
  await expect(clitextboxrevisted).toContainText('AksDisableLocalAccounts');
});
