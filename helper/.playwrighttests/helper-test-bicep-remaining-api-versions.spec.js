const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function getNonCommentLines(content) {
  return content.split('\n').filter(line => !line.trimStart().startsWith('//'));
}

// --- acragentpool.bicep ---
const acrAgentPoolPath = path.resolve(__dirname, '../../bicep/acragentpool.bicep');
const acrAgentPoolContent = fs.readFileSync(acrAgentPoolPath, 'utf-8');

test.describe('Bicep acragentpool.bicep API Versions - REQ-001', () => {
  const expectedApiVersions = [
    { resource: 'Microsoft.ContainerRegistry/registries', version: '2025-11-01' },
    { resource: 'Microsoft.ContainerRegistry/registries/agentPools', version: '2025-03-01-preview' },
  ];

  const deprecatedApiVersions = [
    { resource: 'Microsoft.ContainerRegistry/registries', version: '2023-07-01' },
    { resource: 'Microsoft.ContainerRegistry/registries/agentPools', version: '2019-06-01-preview' },
  ];

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(acrAgentPoolContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(acrAgentPoolContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});

// --- aksmetricalerts.bicep ---
const aksMetricAlertsPath = path.resolve(__dirname, '../../bicep/aksmetricalerts.bicep');
const aksMetricAlertsContent = fs.readFileSync(aksMetricAlertsPath, 'utf-8');

test.describe('Bicep aksmetricalerts.bicep API Versions - REQ-001', () => {
  const expectedApiVersions = [
    { resource: 'Microsoft.Insights/metricAlerts', version: '2018-03-01' },
    { resource: 'Microsoft.Insights/scheduledQueryRules', version: '2023-12-01' },
  ];

  const deprecatedApiVersions = [
    { resource: 'Microsoft.Insights/scheduledQueryRules', version: '2022-08-01-preview' },
  ];

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(aksMetricAlertsContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(aksMetricAlertsContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});

// --- aksnetcontrib.bicep ---
const aksNetContribPath = path.resolve(__dirname, '../../bicep/aksnetcontrib.bicep');
const aksNetContribContent = fs.readFileSync(aksNetContribPath, 'utf-8');

test.describe('Bicep aksnetcontrib.bicep API Versions - REQ-001', () => {
  const expectedApiVersions = [
    { resource: 'Microsoft.Network/virtualNetworks', version: '2025-05-01' },
    { resource: 'Microsoft.Network/virtualNetworks/subnets', version: '2025-05-01' },
  ];

  const unchangedApiVersions = [
    { resource: 'Microsoft.Authorization/roleAssignments', version: '2022-04-01' },
  ];

  const deprecatedApiVersions = [
    { resource: 'Microsoft.Network/virtualNetworks', version: '2023-04-01' },
    { resource: 'Microsoft.Network/virtualNetworks/subnets', version: '2023-09-01' },
  ];

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(aksNetContribContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(aksNetContribContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(aksNetContribContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});

// --- networksubnetrbac.bicep ---
const networkSubnetRbacPath = path.resolve(__dirname, '../../bicep/networksubnetrbac.bicep');
const networkSubnetRbacContent = fs.readFileSync(networkSubnetRbacPath, 'utf-8');

test.describe('Bicep networksubnetrbac.bicep API Versions - REQ-001', () => {
  const expectedApiVersions = [
    { resource: 'Microsoft.Network/virtualNetworks/subnets', version: '2025-05-01' },
  ];

  const unchangedApiVersions = [
    { resource: 'Microsoft.Authorization/roleAssignments', version: '2022-04-01' },
  ];

  const deprecatedApiVersions = [
    { resource: 'Microsoft.Network/virtualNetworks/subnets', version: '2022-01-01' },
  ];

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(networkSubnetRbacContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(networkSubnetRbacContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(networkSubnetRbacContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});

// --- keyvaultrbac.bicep ---
const keyvaultRbacPath = path.resolve(__dirname, '../../bicep/keyvaultrbac.bicep');
const keyvaultRbacContent = fs.readFileSync(keyvaultRbacPath, 'utf-8');

test.describe('Bicep keyvaultrbac.bicep API Versions - REQ-001', () => {
  const expectedApiVersions = [
    { resource: 'Microsoft.KeyVault/vaults', version: '2025-05-01' },
  ];

  const unchangedApiVersions = [
    { resource: 'Microsoft.Authorization/roleAssignments', version: '2022-04-01' },
  ];

  const deprecatedApiVersions = [
    { resource: 'Microsoft.KeyVault/vaults', version: '2022-07-01' },
  ];

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(keyvaultRbacContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(keyvaultRbacContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(keyvaultRbacContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});
