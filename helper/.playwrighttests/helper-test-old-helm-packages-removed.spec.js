const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verify old Helm chart packages have been removed and references updated (REQ-010).

const helmDir = path.resolve(__dirname, '../../postdeploy/helm');

const removedPackages = [
  'Az-CertManagerIssuer-0.3.0.tgz',
  'externaldns-0.3.0.tgz',
  'externaldns-0.2.0.tgz',
];

for (const pkg of removedPackages) {
  test(`old helm package ${pkg} does not exist`, async () => {
    const pkgPath = path.join(helmDir, pkg);
    expect(fs.existsSync(pkgPath)).toBe(false);
  });
}

test('Az-CertManagerIssuer-0.4.0.tgz exists', async () => {
  const pkgPath = path.join(helmDir, 'Az-CertManagerIssuer-0.4.0.tgz');
  expect(fs.existsSync(pkgPath)).toBe(true);
});

test('externaldns-0.4.0.tgz exists', async () => {
  const pkgPath = path.join(helmDir, 'externaldns-0.4.0.tgz');
  expect(fs.existsSync(pkgPath)).toBe(true);
});

test('PostDeploy workflow references Az-CertManagerIssuer-0.4.0', async () => {
  const workflowPath = path.resolve(__dirname, '../../.github/workflows/PostDeploy.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('release workflow references Az-CertManagerIssuer-0.4.0', async () => {
  const workflowPath = path.resolve(__dirname, '../../.github/workflows/release.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('postdeploy.sh references Az-CertManagerIssuer-0.4.0', async () => {
  const scriptPath = path.resolve(__dirname, '../../postdeploy/scripts/postdeploy.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('postdeploy.ps1 references Az-CertManagerIssuer-0.4.0', async () => {
  const scriptPath = path.resolve(__dirname, '../../postdeploy/scripts/postdeploy.ps1');
  const content = fs.readFileSync(scriptPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('deployTab.jsx references Az-CertManagerIssuer-0.4.0', async () => {
  const deployTabPath = path.resolve(__dirname, '../src/components/deployTab.jsx');
  const content = fs.readFileSync(deployTabPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

// Helper to extract a file from a .tgz and return its contents as a string.
function extractFileFromTgz(tgzPath, innerPath) {
  return execSync(`tar xzf "${tgzPath}" -O "${innerPath}"`, { encoding: 'utf8' });
}

// Package integrity: verify .tgz contents contain valid Chart.yaml with correct metadata.

test('Az-CertManagerIssuer-0.4.0.tgz contains Chart.yaml with version 0.4.0', async () => {
  const tgzPath = path.join(helmDir, 'Az-CertManagerIssuer-0.4.0.tgz');
  const chartYaml = extractFileFromTgz(tgzPath, 'Az-CertManagerIssuer/Chart.yaml');
  expect(chartYaml).toContain('name: Az-CertManagerIssuer');
  expect(chartYaml).toContain('version: 0.4.0');
  expect(chartYaml).toContain('appVersion: 1.17.4');
});

test('externaldns-0.4.0.tgz contains Chart.yaml with version 0.4.0', async () => {
  const tgzPath = path.join(helmDir, 'externaldns-0.4.0.tgz');
  const chartYaml = extractFileFromTgz(tgzPath, 'externaldns/Chart.yaml');
  expect(chartYaml).toContain('name: externaldns');
  expect(chartYaml).toContain('version: 0.4.0');
  expect(chartYaml).toContain('appVersion: v0.15.1');
});

test('Az-CertManagerIssuer-0.4.0.tgz contains expected templates', async () => {
  const tgzPath = path.join(helmDir, 'Az-CertManagerIssuer-0.4.0.tgz');
  const listing = execSync(`tar tzf "${tgzPath}"`, { encoding: 'utf8' });
  expect(listing).toContain('Az-CertManagerIssuer/templates/clusterissuer-prod.yaml');
  expect(listing).toContain('Az-CertManagerIssuer/templates/clusterissuer-staging.yaml');
  expect(listing).toContain('Az-CertManagerIssuer/values.yaml');
});

test('externaldns-0.4.0.tgz contains expected templates', async () => {
  const tgzPath = path.join(helmDir, 'externaldns-0.4.0.tgz');
  const listing = execSync(`tar tzf "${tgzPath}"`, { encoding: 'utf8' });
  expect(listing).toContain('externaldns/templates/deployment.yaml');
  expect(listing).toContain('externaldns/templates/serviceaccount.yaml');
  expect(listing).toContain('externaldns/values.yaml');
});
