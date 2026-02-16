const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainBicepPath = path.resolve(__dirname, '../../bicep/main.bicep');
const mainBicepContent = fs.readFileSync(mainBicepPath, 'utf-8');

test.describe('System Pool OS SKU Hardcoded to AzureLinux - REQ-002', () => {

  test('systemPoolBase has osSku set to AzureLinux', () => {
    const baseBlockRegex = /var systemPoolBase = \{([\s\S]*?)\n\}/;
    const match = mainBicepContent.match(baseBlockRegex);
    expect(match).not.toBeNull();

    const baseBody = match[1];
    const osSkuMatch = baseBody.match(/osSku\s*:\s*'([^']+)'/);
    expect(osSkuMatch).not.toBeNull();
    expect(osSkuMatch[1]).toBe('AzureLinux');
  });

  test('systemPoolOsSku variable forces AzureLinux', () => {
    const osSkuVarRegex = /var systemPoolOsSku = \{\s*osSku\s*:\s*'([^']+)'\s*\}/;
    const match = mainBicepContent.match(osSkuVarRegex);
    expect(match).not.toBeNull();
    expect(match[1]).toBe('AzureLinux');
  });

  test('agentPoolProfiles union includes systemPoolOsSku as final argument', () => {
    const unionRegex = /var agentPoolProfiles = .*union\(systemPoolBase,.*,\s*systemPoolOsSku\)/;
    const match = mainBicepContent.match(unionRegex);
    expect(match).not.toBeNull();
  });

  test('systemPoolBase does not reference the osSKU parameter', () => {
    const baseBlockRegex = /var systemPoolBase = \{([\s\S]*?)\n\}/;
    const match = mainBicepContent.match(baseBlockRegex);
    expect(match).not.toBeNull();

    const baseBody = match[1];
    // osSku should be a hardcoded string, not referencing the osSKU parameter
    expect(baseBody).not.toMatch(/osSku\s*:\s*osSKU/);
    expect(baseBody).toMatch(/osSku\s*:\s*'AzureLinux'/);
  });
});
