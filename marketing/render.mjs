// Renders the flier (PDF + PNG), the presentation (PDF) and the promo video (WebM) from the HTML in this folder.
//   PW_CORE=<path to playwright-core/index.mjs> CHROME=<chrome.exe> OUT=<output dir> node marketing/render.mjs [flier|deck|promo|all]
import path from 'node:path';
import { mkdirSync, readdirSync, renameSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.OUT || path.join(here, 'out');
const { chromium } = await import(pathToFileURL(process.env.PW_CORE).href);
const what = process.argv[2] || 'all';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
const file = (n) => pathToFileURL(path.join(here, n)).href;
const settle = async (page) => { await page.evaluate(() => document.fonts && document.fonts.ready); await page.waitForTimeout(1500); };

if (what === 'flier' || what === 'all') {
    const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(file('flier.html'), { waitUntil: 'networkidle' });
    await settle(page);
    await page.screenshot({ path: path.join(OUT, 'Heartfelt-Community-Flier.png') });
    await page.pdf({ path: path.join(OUT, 'Heartfelt-Community-Flier.pdf'), width: '794px', height: '1123px', printBackground: true });
    await ctx.close();
    console.log('flier done');
}

if (what === 'deck' || what === 'all') {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    await page.goto(file('deck.html'), { waitUntil: 'networkidle' });
    await settle(page);
    await page.pdf({ path: path.join(OUT, 'Heartfelt-Community-Presentation.pdf'), width: '1280px', height: '720px', printBackground: true });
    await ctx.close();
    console.log('deck done');
}

if (what === 'promo' || what === 'all') {
    const tmp = path.join(OUT, '_video');
    mkdirSync(tmp, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: tmp, size: { width: 1280, height: 720 } } });
    const t0 = Date.now();
    const page = await ctx.newPage();
    await page.goto(file('promo.html'), { waitUntil: 'load' });
    await page.waitForFunction(() => window.__done === true, null, { timeout: 120000 });
    const started = await page.evaluate(() => window.__started);
    // seconds of blank page recorded before the first scene (fonts/images loading): trim it when converting
    writeFileSync(path.join(OUT, 'promo-lead.txt'), String(Math.max(0, (started - t0) / 1000 - 0.2).toFixed(2)));
    await ctx.close();
    const vid = readdirSync(tmp).find((f) => f.endsWith('.webm'));
    if (vid) renameSync(path.join(tmp, vid), path.join(OUT, 'Heartfelt-Community-Promo.webm'));
    console.log('promo done', existsSync(path.join(OUT, 'Heartfelt-Community-Promo.webm')));
}

await browser.close();
