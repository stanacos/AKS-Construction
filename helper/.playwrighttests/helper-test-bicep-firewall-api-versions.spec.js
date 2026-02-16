const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const firewallBicepPath = path.resolve(__dirname, '../../bicep/firewall.bicep');
const firewallBicepContent = fs.readFileSync(firewallBicepPath, 'utf-8');

// API Version Upgrade Map from PRD REQ-001 for firewall.bicep
const expectedApiVersions = [
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2025-05-01' },
  { resource: 'Microsoft.Network/azureFirewalls', version: '2025-05-01' },
  { resource: 'Microsoft.Network/firewallPolicies', version: '2025-05-01' },
  { resource: 'Microsoft.Network/firewallPolicies/ruleCollectionGroups', version: '2025-05-01' },
];

// These API versions should remain unchanged per PRD
const unchangedApiVersions = [
  { resource: 'Microsoft.Insights/diagnosticSettings', version: '2021-05-01-preview' },
];

// Old API versions that must NOT be present in resource declarations
const deprecatedApiVersions = [
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2023-04-01' },
  { resource: 'Microsoft.Network/azureFirewalls', version: '2023-04-01' },
  { resource: 'Microsoft.Network/firewallPolicies', version: '2023-04-01' },
  { resource: 'Microsoft.Network/firewallPolicies/ruleCollectionGroups', version: '2023-09-01' },
];

function getNonCommentLines(content) {
  return content.split('\n').filter(line => !line.trimStart().startsWith('//'));
}

test.describe('Bicep firewall.bicep API Versions - REQ-001', () => {

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(firewallBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(firewallBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(firewallBicepContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});
