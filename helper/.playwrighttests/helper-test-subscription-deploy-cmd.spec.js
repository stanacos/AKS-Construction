const { test, expect } = require('@playwright/test');
const config = require('../src/config.json');

// Verify the Bash deploy command starts with 'az account set --subscription' (REQ-006).

test('bash-deploy-cmd-contains-subscription-set', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  const deployCmd = await page.locator('[data-testid="deploy-deploycmd"]').innerText();
  expect(deployCmd).toContain(`az account set --subscription ${config.defaults.deploy.subscription}`);
});

test('bash-deploy-cmd-subscription-set-before-group-create', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  const deployCmd = await page.locator('[data-testid="deploy-deploycmd"]').innerText();
  const subscriptionIdx = deployCmd.indexOf('az account set --subscription');
  const groupCreateIdx = deployCmd.indexOf('az group create');
  expect(subscriptionIdx).toBeGreaterThanOrEqual(0);
  expect(groupCreateIdx).toBeGreaterThan(subscriptionIdx);
});
