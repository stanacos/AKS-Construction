const { test, expect } = require('@playwright/test');
const { matchers } = require('playwright-expect');

// add custom matchers
expect.extend(matchers);

test('default-outbound-option-is-natgateway', async ({ page }) => {

  // The lean preset does not override aksOutboundTrafficType, so config.json default (natGateway) applies
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the 4th Tab in the portal Navigation Pivot (network)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(4)');

  // Check that config.json default of natGateway is shown
  const dropdown = await page.waitForSelector('[data-testid="net-aksEgressType"]')
  await expect(dropdown).toBeVisible()
  await expect(dropdown).toMatchText('NAT Gateway')

  // Click the 1st Tab in the portal Navigation Pivot (deploy)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // Check aksOutboundTrafficType parameter is absent (matches default, not emitted)
  await page.waitForSelector('[data-testid="deploy-deploycmd"]')
  const clitextbox = await page.$('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('natGateway')

});