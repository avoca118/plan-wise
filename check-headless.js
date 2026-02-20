const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const consoleMessages = [];
  const pageErrors = [];
  const requestFailures = [];
  const badResponses = [];

  page.on('console', msg => {
    consoleMessages.push({type: msg.type(), text: msg.text()});
  });

  page.on('pageerror', err => {
    pageErrors.push({message: err.message, stack: err.stack});
  });

  page.on('requestfailed', req => {
    requestFailures.push({url: req.url(), failure: req.failure()});
  });

  page.on('response', res => {
    const status = res.status();
    if (status >= 400) {
      badResponses.push({url: res.url(), status, statusText: res.statusText()});
    }
  });

  try {
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'headless-screenshot.png', fullPage: true });

    const report = { consoleMessages, pageErrors, requestFailures, badResponses };
    const json = JSON.stringify(report, null, 2);
    fs.writeFileSync('headless-report.json', json);
    console.log('Headless check completed — report saved to headless-report.json');
  } catch (err) {
    console.error('Error during headless check:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
