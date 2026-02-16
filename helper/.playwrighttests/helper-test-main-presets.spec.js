const { test, expect } = require('@playwright/test');

test('reference-screengrabs', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction');

  await page.screenshot({ path: 'alwaysscreengrabs/lab-config.png', fullPage: true })


  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  await page.screenshot({ path: 'alwaysscreengrabs/securelab-config.png', fullPage: true })

});
