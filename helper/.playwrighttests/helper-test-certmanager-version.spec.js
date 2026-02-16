const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Tests verify cert-manager references use v1.17.x LTS across the project (REQ-010).

const CERTMANAGER_VERSION = 'v1.17.4';

test('dependencies-json-has-correct-certmanager-version', async () => {
  const depsPath = path.resolve(__dirname, '../src/dependencies.json');
  const deps = JSON.parse(fs.readFileSync(depsPath, 'utf8'));

  // Verify the key uses the correct version
  expect(deps.cert_manager).toHaveProperty('1_17_4');

  // Verify the download URL contains the correct version
  const entry = deps.cert_manager['1_17_4'];
  expect(entry.github_https_url).toContain(CERTMANAGER_VERSION);

  // Verify all image tags match
  expect(entry.images.cainjector.tag).toBe(CERTMANAGER_VERSION);
  expect(entry.images.controller.tag).toBe(CERTMANAGER_VERSION);
  expect(entry.images.webhook.tag).toBe(CERTMANAGER_VERSION);
});

test('dependencies-json-certmanager-url-uses-cert-manager-org', async () => {
  const depsPath = path.resolve(__dirname, '../src/dependencies.json');
  const deps = JSON.parse(fs.readFileSync(depsPath, 'utf8'));

  const entry = deps.cert_manager['1_17_4'];
  // URL should use cert-manager org, not the old jetstack org
  expect(entry.github_https_url).toContain('github.com/cert-manager/cert-manager');
});

test('postdeploy-workflow-defaults-to-correct-certmanager-version', async () => {
  const workflowPath = path.resolve(__dirname, '../../.github/workflows/PostDeploy.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');

  // Default version should be v1.17.4
  expect(content).toContain(`default: "${CERTMANAGER_VERSION}"`);

  // Download URL should use cert-manager org
  expect(content).toContain('github.com/cert-manager/cert-manager/releases/download');
  expect(content).not.toContain('github.com/jetstack/cert-manager');
});

test('postdeploy-script-references-correct-certmanager-version', async () => {
  const scriptPath = path.resolve(__dirname, '../../postdeploy/scripts/postdeploy.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');

  // Should reference the 1_17_4 key from dependencies.json
  expect(content).toContain('cert_manager.1_17_4.github_https_url');
  expect(content).not.toContain('cert_manager.1_8_2');
});
