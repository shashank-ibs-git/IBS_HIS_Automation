// TestBud-Cucumber/features/support/hooks.js
const { BeforeAll, AfterAll, Before, After, AfterStep, setDefaultTimeout, Status } = require('@cucumber/cucumber');
const { chromium, firefox, webkit} = require('playwright');
const { expect } = require('@playwright/test');  
const { POManager } = require('../../../pageObjectsHIS/POManager');
const {Utilities} = require('./Utilities');

const fs = require('fs');
const path = require('path');
const util = require('util');
const { loadTestData } = require('./dataLoader');
// Dataset loader removed: all dynamic test data now comes directly from Scenario Outline Examples.
// World will hold only runtime values extracted in steps (flightSearch, passengers, etc.).

setDefaultTimeout(45000);

// Increase stack trace depth so async call chains show more frames from your page-objects
Error.stackTraceLimit = 50;

// Try to install source-map-support if available to improve stack traces (no-op if not installed)
try {
  // eslint-disable-next-line global-require
  require('source-map-support').install();
} catch (e) {
  // ignore if the package is not present; --enable-source-maps Node flag is already used in the test runner
}

// ---- static config ----
const cfgPath = path.resolve(process.cwd(), 'testConfig_HIS.json');
if (!fs.existsSync(cfgPath)) throw new Error(`testConfig_HIS.json not found at ${cfgPath}`);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const BROWSER_NAME = (cfg.browser || 'chromium').toString().trim().toLowerCase();
const ENV_NAME     = (cfg.env || 'dev').toString().trim().toLowerCase();
const BASE_URL     = (cfg.baseUrls && cfg.baseUrls[ENV_NAME]) || cfg.baseUrls?.dev || 'https://dev-overseas-air.his-j.com/';
const HEADLESS     = typeof cfg.headless === 'boolean' ? cfg.headless : false;

// ---- runtime holders ----
let browser;

/**
 * Decide which Playwright engine to use, and (optionally) which channel.
 * Edge is Chromium under the hood; we launch Chromium with the msedge channel.
 */
function resolveEngineAndChannel(name) {
  // engines
  if (name === 'firefox') return { engine: firefox, channel: null };
  if (name === 'webkit')  return { engine: webkit,  channel: null };

  // default to chromium + optional channel
  let channel = null;

  // Normalize common aliases
  if (name === 'edge') name = 'msedge';

  const validChannels = new Set([
    'chrome',
    'chrome-beta',
    'msedge',
    'msedge-dev',
    'msedge-canary',
  ]);

  if (validChannels.has(name)) channel = name;

  return { engine: chromium, channel };
}

BeforeAll(async function () {
  const { engine, channel } = resolveEngineAndChannel(BROWSER_NAME);

  const launchOptions = {
    headless: HEADLESS,
    ...(channel ? { channel } : {})
  };

  console.log(
    `Starting tests -> browser: ${BROWSER_NAME}${channel ? ` (channel: ${channel})` : ''}, env: ${ENV_NAME}, baseUrl: ${BASE_URL}, headless: ${HEADLESS}`
  );

  browser = await engine.launch(launchOptions);

  // NOTE: If you later run in parallel, consider launching per scenario/worker instead.
});

Before(async function () {
  // per-scenario context/page
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(60000);
  //expect.configure({ timeout: 15000 });
  

  // expose to World
  this.context     = context;
  this.page        = page;
  this.browserName = BROWSER_NAME;
  this.envName     = ENV_NAME;
  this.baseUrl     = BASE_URL;
  // Load shared test data from single testData.json file
  this.sharedData = loadTestData();
  // Centralized ASSERT_TIMEOUT (allow override via testData.json assertTimeout field)
  this.ASSERT_TIMEOUT = (this.sharedData && typeof this.sharedData.assertTimeout === 'number') ? this.sharedData.assertTimeout : 10000;

  // Page Objects
  this.poManager = new POManager(page);
   // 🧩 Utilities (global per-scenario)
  this.utils = new Utilities(page);
});

AfterStep(async function ({ result, pickleStep }) {
  if (result.status === Status.FAILED && this.page) {
    const safe = pickleStep.text.replace(/[^a-z0-9-_]/gi, '_').slice(0, 50);
    const ts = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
    const dir = path.resolve(process.cwd(), 'screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `step-failure-${safe}-${ts}.png`);
    const shot = await this.page.screenshot({ path: filePath, fullPage: true });
    this.attach(shot, 'image/png');
    // Log the underlying exception (if any) and dump the result object for inspection.
    try {
      console.error('Step failed - pickle step:', pickleStep.text);
      console.error('Inspecting result object:', util.inspect(result, { depth: 5 }));
      console.error('Inspecting result.exception:', util.inspect(result && result.exception, { depth: 5 }));

      // Log current page URL to know where we were when the failure happened
      try {
        console.error('Current page URL:', this.page.url());
      } catch (e) {
        // ignore
      }

      // Save page HTML always; attach only if env ATTACH_HTML=1 to avoid bloating reports.
      try {
        const fullHtml = await this.page.content();
        const safe = pickleStep.text.replace(/[^a-z0-9-_]/gi, '_').slice(0, 50);
        const ts = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
        const dir = path.resolve(process.cwd(), 'screenshots');
        const htmlPath = path.join(dir, `step-failure-${safe}-${ts}.html`);
        fs.writeFileSync(htmlPath, fullHtml);
        console.error('Saved failing page HTML to', htmlPath);
        if (process.env.ATTACH_HTML === '1') {
          const MAX_ATTACH = 500_000; // ~500 KB
            const attachHtml = fullHtml.length > MAX_ATTACH ? fullHtml.slice(0, MAX_ATTACH) + '\n<!-- truncated -->' : fullHtml;
            this.attach(attachHtml, 'text/html');
        }
      } catch (e) {
        console.error('Could not save page HTML:', e && e.message ? e.message : e);
      }

      // ---- Raw stack trace attachment (minimal, clickable) ----
      try {
        const ex = result && result.exception ? /** @type {any} */(result.exception) : null;
        const stack = (ex && (ex.stack || ex.stackTrace)) || '';
        if (stack && typeof this.attach === 'function') {
          // Attach entire stack; VS Code Ctrl+Click will work on absolute paths
          this.attach(stack, 'text/plain');
        }
      } catch (e) {
        console.error('Error attaching raw stack:', e.message || e);
      }
    } catch (e) {
      console.error('Error while logging AfterStep exception details:', e);
    }
  }
});

After(async function () {
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
});

AfterAll(async function () {
  try {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  } catch (e) {
    console.error('Error closing browser:', e);
  }
});
