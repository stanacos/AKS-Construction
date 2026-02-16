const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Verify that old preset files have been removed from the repository (REQ-004).

const presetsDir = path.join(__dirname, '..', 'src', 'configpresets');

const removedFiles = [
  'baselines.json',
  'entScale.json',
  'gaming.json',
  'principals.json',
];

for (const file of removedFiles) {
  test(`old preset file ${file} does not exist`, async () => {
    const filePath = path.join(presetsDir, file);
    expect(fs.existsSync(filePath)).toBe(false);
  });
}

test('only lab.json and securelab.json presets remain', async () => {
  const files = fs.readdirSync(presetsDir).filter(f => f.endsWith('.json'));
  expect(files.sort()).toEqual(['lab.json', 'securelab.json']);
});
