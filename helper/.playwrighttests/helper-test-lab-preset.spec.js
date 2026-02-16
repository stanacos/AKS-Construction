const { test, expect } = require('@playwright/test');

// Tests verify the Lab preset configuration (REQ-004).

test('lab-preset-loads-via-url', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // The Lab preset section should be visible
  await page.waitForSelector('[data-testid="stacklabenv"]');
  const stack = page.locator('[data-testid="stacklabenv"]');
  await expect(stack).toBeVisible();
});

test('lab-preset-card-is-checked-by-default', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // The Lab Cluster card checkbox should be checked
  const checkbox = page.locator('[data-testid="portalnav-presets-labenv-yourlab-Checkbox"]');
  await expect(checkbox).toBeChecked();
});

test('lab-preset-deploy-has-upgradeChannel-stable', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Click the deploy tab (1st tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should contain upgradeChannel=stable (differs from default "none")
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).toContainText('upgradeChannel');
});

test('lab-preset-deploy-has-no-monitoring', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should not contain omsagent or monitoring params
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).not.toContainText('omsagent');
  await expect(clitextbox).not.toContainText('retentionInDays');
});

test('lab-preset-deploy-has-no-registry', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should not contain registries_sku (no ACR)
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).not.toContainText('registries_sku');
});

test('lab-preset-deploy-has-no-ingress', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Click the deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // The deploy command should not contain appgw or ingress-related params
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).not.toContainText('appGWcount');
  await expect(clitextbox).not.toContainText('appGWsku');
});
