import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const url = process.argv[2] || 'http://localhost:5173/';
  const out = process.argv[3] || './tmp/smoke-full.png';

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out, fullPage: true });

  await browser.close();
  console.log('Saved:', out);
})();
