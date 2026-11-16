import { test, expect } from '@playwright/test';
import { build } from 'vite';
import path from 'node:path';

let script, styles;
test.beforeAll(async () => {
  const result = await build({ configLoader: 'runner', logLevel: 'error', build: {
    write: false, minify: false, cssCodeSplit: false,
    rollupOptions: { input: path.resolve('e2e/fixtures/accessibility.tsx'), output: { inlineDynamicImports: true } },
  } });
  script = result.output.find(item => item.type === 'chunk' && item.isEntry).code;
  styles = result.output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n');
});

async function open(page, mode = '', lang = 'it-IT') {
  await page.route('**/__a11y__?*', route => route.fulfill({ contentType: 'text/html',
    body: `<!doctype html><html lang="${lang}"><head><style>${styles}</style></head><body><div id="root"></div><script type="module" src="/__a11y__.js"></script></body></html>`,
  }));
  await page.route('**/__a11y__.js', route => route.fulfill({ contentType: 'text/javascript', body: script }));
  await page.goto('/__a11y__?mode=' + mode);
}

test('detects document language, follows updates, and respects explicit locale', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('button', { name: 'Ordina colonna', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Tabella', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rimuovi', exact: true })).toBeVisible();
  await page.evaluate(() => { document.documentElement.lang = 'en-US'; });
  await expect(page.getByRole('button', { name: 'Sort column', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  await page.evaluate(() => { document.documentElement.lang = 'de'; });
  await expect(page.getByRole('button', { name: 'Sort column', exact: true })).toBeVisible();
  await open(page, 'explicit');
  await expect(page.getByRole('button', { name: 'Sort column', exact: true })).toBeVisible();
});

test('uses browser language when the document has no lang', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'it-IT' });
  const page = await context.newPage();
  try {
    await open(page, '', '');
    await expect(page.getByRole('button', { name: 'Ordina colonna', exact: true })).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' });
      window.dispatchEvent(new Event('languagechange'));
    });
    await expect(page.getByRole('button', { name: 'Sort column', exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test('custom props reach controls and paste preview in portals; dialog restores focus', async ({ page }) => {
  await open(page, 'custom');
  await expect(page.getByRole('button', { name: 'Custom sort' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Probe' }).click();
  await expect(page.locator('output')).toHaveText('1');
  const trigger = page.getByRole('button', { name: 'Custom paste' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Incolla da Excel', exact: true });
  await expect(dialog.locator('[aria-label="Custom content"]')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Celle da Excel' }).fill('New');
  await dialog.getByRole('button', { name: 'Anteprima', exact: true }).click();
  await expect(dialog.locator('th[data-preview="header-0"]')).toHaveAttribute('scope', 'col');
  await expect(dialog.locator('td[data-preview="body-0"]')).toBeVisible();
  await dialog.getByRole('button', { name: 'Applica blocco' }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('combobox', { name: 'Riga iniziale' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('opting out removes generated semantics from portal content too', async ({ page }) => {
  await open(page, 'off');
  await page.getByRole('button', { name: 'Incolla da Excel', exact: true }).click();
  await page.getByRole('textbox', { name: 'Celle da Excel' }).fill('New');
  await page.getByRole('button', { name: 'Anteprima', exact: true }).click();
  await expect(page.locator('#root [aria-label], #root [role], dialog [aria-label], dialog [aria-busy], dialog [scope], dialog [role]')).toHaveCount(0);
});

test('standalone sorting cells keep rotation, sorting and reduced-motion behavior without an animation runtime', async ({ page }) => {
  await open(page, 'legacy');
  const indicator = page.locator('.tbl-sort-indicator').first();
  const button = page.locator('tbody').getByRole('button', { name: 'Customer', exact: true }).first();
  await expect(indicator).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)');
  await button.click();
  await expect(indicator).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await button.click();
  await expect(indicator).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(indicator).toHaveCSS('transition-duration', '0s');
});
