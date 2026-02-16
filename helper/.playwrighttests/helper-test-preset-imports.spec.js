const { test, expect } = require('@playwright/test');
const { matchers } = require('playwright-expect');

// add custom matchers
expect.extend(matchers);

// Tests verify that only lab.json and securelab.json presets are loaded (REQ-004).

test('default-preset-is-lean', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // The Lab preset section should render by default
  await page.waitForSelector('[data-testid="stacklabenv"]');
  const visible = await page.isVisible('[data-testid="stacklabenv"]');
  expect(visible).toBeTruthy();
});

test('old-presets-are-not-loaded', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Wait for the page to render
  await page.waitForSelector('[data-testid="stacklabenv"]');

  // Old preset sections should not exist
  expect(await page.isVisible('[data-testid="stackops"]')).toBeFalsy();
  expect(await page.isVisible('[data-testid="stacksecure"]')).toBeFalsy();
  expect(await page.isVisible('[data-testid="stackenv"]')).toBeFalsy();
  expect(await page.isVisible('[data-testid="stackbaselineRI"]')).toBeFalsy();
  expect(await page.isVisible('[data-testid="stackentscale"]')).toBeFalsy();
  expect(await page.isVisible('[data-testid="stackminecraft"]')).toBeFalsy();
});

test('securelab-preset-accessible-via-url', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // The Secure Lab preset section should render
  await page.waitForSelector('[data-testid="stackseclab"]');
  const visible = await page.isVisible('[data-testid="stackseclab"]');
  expect(visible).toBeTruthy();
});

test('lean-preset-deploy-command-is-minimal', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // The lean preset should produce a minimal deploy command (no monitoring, no registry, no ingress)
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');
  const clitextbox = await page.$('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();

  // These parameters should NOT appear because lean preset disables them (matching config.json defaults)
  await expect(clitextbox).not.toContainText('registries_sku');
  await expect(clitextbox).not.toContainText('omsagent=true');
});
