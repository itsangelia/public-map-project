// Optional browser regression: requires Playwright and Chromium.
// Uses the real Firebase SDK but intercepts authentication; no real accounts created.
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const page = await browser.newPage();
    let requests = 0;
    await page.route('https://map-test.invalid/**', route => route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));
    await page.route('https://identitytoolkit.googleapis.com/**', route => {
      requests++;
      return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{message:'OPERATION_NOT_ALLOWED'}})});
    });
    await page.goto('https://map-test.invalid/');
    await page.evaluate(() => {
      indexedDB.open = () => ({}); // Never resolves: known mobile storage failure mode.
      window.originalDatabaseAPI = indexedDB;
      window.PUBLIC_MAP_CONFIG = {firebase:{apiKey:'test-key',authDomain:'test.firebaseapp.com',projectId:'test'}};
    });
    await page.addScriptTag({content:readFileSync('generated/multiplayer.js','utf8')});
    await page.waitForFunction(() => document.querySelector('#connection-status')?.textContent.includes('operation-not-allowed'));
    assert.ok(requests > 0, 'blocked browser storage must not prevent the login request');
    assert.equal(await page.evaluate(() => indexedDB === window.originalDatabaseAPI), true, 'browser storage API must be restored');
    console.log('PASS actual Firebase SDK with permanently pending IndexedDB, explicit error status and restored browser API');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
