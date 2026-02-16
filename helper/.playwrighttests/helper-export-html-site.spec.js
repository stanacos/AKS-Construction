const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('localsite', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction');

  //Wait for the preset section stack to render
  const stacklabenv='[data-testid="stacklabenv"]';
  await page.waitForSelector(stacklabenv)

  //Save the contents of the page to file
  const pageHtml = await page.content();

  console.log(pageHtml);
  fs.writeFileSync('localsite.html', pageHtml);

});

test('prodsite', async ({ page }) => {

  await page.goto('https://azure.github.io/AKS-Construction/');

  //Wait for the main content to render
  await page.waitForSelector('#mainContent')

  //Save the contents of the page to file
  const pageHtml = await page.content();

  console.log(pageHtml);
  fs.writeFileSync('prodsite.html', pageHtml);

});