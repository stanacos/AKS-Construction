const { test, expect } = require('@playwright/test');

test('networkpolicy-test-default-is-none-on-lean-preset', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the 3rd Tab in the portal Navigation Pivot (addons)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(3)');

  // Expect 'none' network policy to be checked on the lean preset
  expect (await page.isChecked('[data-testid="addons-netpolicy-none"]')).toBeTruthy()
});

test('networkpolicy-test-default-is-cilium-on-securelab-preset', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the 3rd Tab in the portal Navigation Pivot (addons)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(3)');

  // Expect cilium network policy to be checked on the secureLab preset
  expect (await page.isChecked('[data-testid="addons-netpolicy-cilium"]')).toBeTruthy()
});
