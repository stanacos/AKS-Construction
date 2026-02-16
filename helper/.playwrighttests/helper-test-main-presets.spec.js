const { test, expect } = require('@playwright/test');

// Tests verify that both Lab and Secure Lab presets load correctly via URL
// parameters and render the expected UI state (REQ-009).

test('lab-preset-loads-via-url-param', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // The Lab preset section stack should be visible
  await expect(page.locator('[data-testid="stacklabenv"]')).toBeVisible();

  // The Lab card checkbox should be checked
  const checkbox = page.locator('[data-testid="portalnav-presets-labenv-yourlab-Checkbox"]');
  await expect(checkbox).toBeAttached();
  await expect(checkbox).toBeChecked();
});

test('securelab-preset-loads-via-url-param', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // The Secure Lab preset section stack should be visible
  await expect(page.locator('[data-testid="stackseclab"]')).toBeVisible();

  // The Secure Lab card checkbox should be checked
  const checkbox = page.locator('[data-testid="portalnav-presets-seclab-yourSecureLab-Checkbox"]');
  await expect(checkbox).toBeAttached();
  await expect(checkbox).toBeChecked();
});

test('lab-preset-deploy-command-is-minimal', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Navigate to deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const cmd = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(cmd).toBeVisible();

  // Lab preset should NOT include monitoring, registry, or ingress params
  await expect(cmd).not.toContainText('omsagent');
  await expect(cmd).not.toContainText('registries_sku');
  await expect(cmd).not.toContainText('appGWcount');
});

test('securelab-preset-deploy-command-has-security-params', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // Navigate to deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const cmd = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(cmd).toBeVisible();

  // Secure Lab should include Azure Policy, registry, monitoring, and Key Vault CSI
  await expect(cmd).toContainText('azurepolicy');
  await expect(cmd).toContainText('registries_sku');
  await expect(cmd).toContainText('omsagent');
  await expect(cmd).toContainText('keyVaultAksCSI');
});

test('switching-from-lab-to-securelab-updates-ui', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=lean');

  // Verify Lab is active
  await expect(page.locator('[data-testid="stacklabenv"]')).toBeVisible();

  // Switch to Secure Lab via the preset dropdown (CommandBarButton menu)
  const presetButton = page.locator('button[aria-label="Preset scenario"]');
  await presetButton.click();
  const secureLabOption = page.locator('button:has-text("Secure Lab")');
  await secureLabOption.click();

  // Verify Secure Lab section is now visible
  await expect(page.locator('[data-testid="stackseclab"]')).toBeVisible();
});
