const { test, expect } = require('@playwright/test');

// Tests verify the Secure Lab preset configuration (REQ-004).

test('securelab-preset-loads-via-url', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // The Secure Lab preset section should be visible
  await page.waitForSelector('[data-testid="stackseclab"]');
  const stack = page.locator('[data-testid="stackseclab"]');
  await expect(stack).toBeVisible();
});

test('securelab-preset-card-is-checked-by-default', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // The Secure Lab Cluster card checkbox should be checked
  const checkbox = page.locator('[data-testid="portalnav-presets-seclab-yourSecureLab-Checkbox"]');
  await expect(checkbox).toBeChecked();
});

test('securelab-preset-deploy-has-azurepolicy-audit', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the deploy tab (1st tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should contain azurepolicy=audit
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).toContainText('azurepolicy');
});

test('securelab-preset-deploy-has-registry', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should contain registries_sku=Basic
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).toContainText('registries_sku');
});

test('securelab-preset-deploy-has-monitoring', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should contain omsagent (Azure Monitor)
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).toContainText('omsagent');
});

test('securelab-preset-deploy-has-keyvault-csi', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should contain keyVaultAksCSI and keyVaultCreate
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).toContainText('keyVaultAksCSI');
  await expect(clitextbox).toContainText('keyVaultCreate');
});

test('securelab-preset-deploy-has-no-ingress', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should not contain appgw or ingress-related params
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).not.toContainText('appGWcount');
  await expect(clitextbox).not.toContainText('appGWsku');
});
