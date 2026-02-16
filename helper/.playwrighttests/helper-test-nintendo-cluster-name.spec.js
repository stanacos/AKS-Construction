const { test, expect } = require('@playwright/test');

const nintendoPattern = /^[a-z]+(-[a-z]+)*-\d{3}$/;

test('default cluster name uses Nintendo character format', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // The deploy tab is the first tab shown by default, cluster name TextField should be visible
  const clusterNameInput = page.locator('input[value]').first();
  await page.waitForSelector('#mainContent');

  // Get the cluster name from the deploy tab's TextField
  const clusterNameField = page.getByLabel('Cluster Name');
  const clusterName = await clusterNameField.inputValue();

  console.log(`Generated cluster name: ${clusterName}`);

  // Verify it matches the Nintendo naming pattern: {character}-{3digits}
  expect(clusterName).toMatch(nintendoPattern);

  // Verify it does not exceed 20 characters
  expect(clusterName.length).toBeLessThanOrEqual(20);
});

test('cluster name appears in resource group name', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  await page.waitForSelector('#mainContent');

  const clusterNameField = page.getByLabel('Cluster Name');
  const clusterName = await clusterNameField.inputValue();

  const rgField = page.locator('#azResourceGroup');
  const rgName = await rgField.inputValue();

  // Resource group should be {clusterName}-rg
  expect(rgName).toBe(`${clusterName}-rg`);
});
