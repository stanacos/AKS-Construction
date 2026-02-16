const { test, expect } = require('@playwright/test');
const fs = require('fs');

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //fluentui dom hack to navigate to the checkbox

test('test', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction?deploy.getCredentials=false');

  //Change the name of the resource group
  await page.waitForSelector('#azResourceGroup')
  await page.click('#azResourceGroup')
  await page.fill('#azResourceGroup', 'Automation-Actions-AksPublishCI')

  //Opt out of telemetry
  await page.waitForSelector('[data-testid="akscTelemetryOpt-Checkbox"]')
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeTruthy()
  await page.click('[data-testid="akscTelemetryOpt-Checkbox"]' + chk)
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeFalsy()

  //Save the contents of the az cmd box to file
  const clitextboxrevisted = await page.$('[data-testid="deploy-deploycmd"]')
  const azcmdLab =await clitextboxrevisted.innerText();
  console.log(azcmdLab);
  fs.writeFileSync('azcmd-lab.sh', azcmdLab);

});
