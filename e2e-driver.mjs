// Senior-dev smoke test driver for menu-p (runs steps against localhost:3000)
// Usage: node e2e-driver.mjs <step>
import { chromium as pw } from 'playwright-core';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const STATE = '/tmp/e2e-state.json';
const SHOTS = '/tmp/shots';
const EMAIL = 'qa.menup.test@gmail.com';
const PASS = 'MenuP-Test-2026!';
fs.mkdirSync(SHOTS, { recursive: true });

const step = process.argv[2];
const log = (...a) => console.log('[e2e]', ...a);

const exe = '/sessions/gracious-admiring-ride/.cache/ms-playwright/chromium_headless_shell-1181/chrome-linux/headless_shell';
const browser = await pw.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-dev-shm-usage'], headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1366, height: 900 },
  storageState: fs.existsSync(STATE) ? STATE : undefined,
});
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png`, fullPage: false });
const save = () => ctx.storageState({ path: STATE });

try {
  if (step === 'landing') {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await shot('01-landing');
    log('title:', await page.title());
  }

  if (step === 'signup') {
    await page.goto(`${BASE}/auth/sign-up`, { waitUntil: 'networkidle', timeout: 30000 });
    await shot('02-signup');
    const inputs = page.locator('input');
    log('inputs found:', await inputs.count());
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    const pws = page.locator('input[type="password"]');
    const n = await pws.count();
    for (let i = 0; i < n; i++) await pws.nth(i).fill(PASS);
    await shot('02b-signup-filled');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);
    await shot('02c-signup-after');
    log('url after signup:', page.url());
    await save();
  }

  if (step === 'login') {
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await shot('03-login');
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);
    log('url after login:', page.url());
    await shot('03b-after-login');
    await save();
  }

  if (step === 'onboarding') {
    await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });
    await shot('04-onboarding');
    log('url:', page.url());
    log('text:', (await page.locator('body').innerText()).slice(0, 600).replace(/\n+/g, ' | '));
    await save();
  }

  if (step === 'dashboard') {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 35000 });
    await shot('06-dashboard');
    log('url:', page.url());
    log('text:', (await page.locator('body').innerText()).slice(0, 800).replace(/\n+/g, ' | '));
    await save();
  }

  if (step === 'editor') {
    await page.goto(`${BASE}/menu-editor`, { waitUntil: 'networkidle', timeout: 35000 });
    await shot('07-editor');
    log('url:', page.url());
    log('text:', (await page.locator('body').innerText()).slice(0, 800).replace(/\n+/g, ' | '));
    await save();
  }

  if (step === 'custom') {
    // ad-hoc: navigate URL passed as argv[3], dump text + shot
    const url = process.argv[3];
    await page.goto(url.startsWith('http') ? url : BASE + url, { waitUntil: 'networkidle', timeout: 35000 });
    await shot('99-custom');
    log('url:', page.url());
    log('text:', (await page.locator('body').innerText()).slice(0, 1500).replace(/\n+/g, ' | '));
    await save();
  }
} catch (e) {
  await shot('err-' + step);
  log('ERROR:', String(e).slice(0, 500));
  process.exitCode = 1;
} finally {
  await browser.close();
}
