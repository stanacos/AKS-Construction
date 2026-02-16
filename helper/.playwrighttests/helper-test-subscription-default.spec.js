const { test, expect } = require('@playwright/test');
const config = require('../src/config.json');

// Verify config.json deploy defaults contain the subscription field (REQ-006).

test('config-default-subscription-exists', async ({}) => {
  expect(config.defaults.deploy.subscription).toBeDefined();
});

test('config-default-subscription-value', async ({}) => {
  expect(config.defaults.deploy.subscription).toBe('1869051d-48fc-4985-8631-addf990c15da');
});
