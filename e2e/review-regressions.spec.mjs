import { test, expect } from '@playwright/test';
import { build } from 'vite';
import path from 'node:path';

let script, styles;
const errors = new WeakMap();
test.beforeAll(async () => {
  // Bundle a dedicated fixture in memory; the shipped demo and build stay unchanged.
  const result = await build({
    configLoader: 'runner',
    logLevel: 'error',
    build: { write: false, minify: false, cssCodeSplit: false,
      rollupOptions: { input: path.resolve('e2e/fixtures/review.tsx'), output: { inlineDynamicImports: true } } },
  });
  const output = result.output;
  script = output.find(item => item.type === 'chunk' && item.isEntry).code;
  styles = output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n');
});
test.beforeEach(async ({ page }) => {
  const messages = [];
  errors.set(page, messages);
  page.on('pageerror', error => messages.push(error.message));
  await page.route('**/__review__', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><head><style>' + styles + '</style></head><body><div id="root"></div><script type="module" src="/__review__.js"></script></body></html>',
  }));
  await page.route('**/__review__.js', route => route.fulfill({ contentType: 'text/javascript', body: script }));
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));
const header = (page, id) => page.locator('thead [data-column-id="' + id + '"]');
const bodyCell = (page, id) => page.locator('tbody tr.tbl-row').first().locator('[data-column-id="' + id + '"]');
async function records(page) { return JSON.parse(await page.getByLabel('Records').textContent()); }

test('editing uses custom identities and never confuses id with _id', async ({ page }) => {
  await page.goto('/__review__');
  const inputs = page.locator('tbody [data-column-id="name"] input');
  await inputs.nth(1).fill('Custom updated');
  await inputs.nth(1).press('Tab');
  await expect.poll(async () => (await records(page)).map(row => row.profile.name)).toEqual(['Alpha', 'Custom updated']);
  await page.getByRole('button', { name: 'Use id', exact: true }).click();
  await inputs.nth(1).fill('ID updated');
  await inputs.nth(1).press('Tab');
  await expect.poll(async () => (await records(page)).map(row => row.profile.name)).toEqual(['Alpha', 'ID updated']);
});

test('empty dates render safely, toolbar selection works, and CSV preserves edited data', async ({ page }) => {
  await page.goto('/__review__');
  await expect(page.getByRole('table', { name: 'Regression' })).toBeVisible();
  await expect(page.locator('tbody tr.tbl-row')).toHaveCount(2);
  await expect(page.locator('tbody [data-column-id="date"]')).toHaveText(['', '']);
  await page.getByRole('button', { name: 'Select all', exact: true }).click();
  await expect(page.getByLabel('Selected', { exact: true })).toHaveText('2');
  const input = page.locator('tbody [data-column-id="name"] input').first();
  await input.fill('Updated, "name"');
  await input.press('Tab');
  await expect.poll(async () => (await records(page))[0].profile.name).toBe('Updated, "name"');
  await page.evaluate(() => {
    window.open = url => { fetch(url).then(response => response.text()).then(text => { window.reviewCSV = text; }); return null; };
  });
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.reviewCSV)).toContain('"Updated, ""name"""');
  expect(await page.evaluate(() => window.reviewCSV)).toContain('"Rossi, Marco;\n""50%"""');
});

for (const scenario of ['blocked', 'corrupt']) {
  test('table and persistence remain usable with ' + scenario + ' storage', async ({ page }) => {
    await page.addInitScript(scenario => {
      if (scenario === 'blocked') Object.defineProperty(window, 'localStorage', {
        configurable: true, get() { throw new DOMException('Denied', 'SecurityError'); },
      });
      else localStorage.setItem('pagination_review-browser', '{"limit":0,"page":-1,"columnsLayout":{"invalid":true}}');
    }, scenario);
    await page.goto('/__review__');
    await expect(page.locator('tbody tr.tbl-row')).toHaveCount(2);
    await page.getByRole('button', { name: 'Select all', exact: true }).click();
    await expect(page.getByLabel('Selected', { exact: true })).toHaveText('2');
    await page.getByRole('combobox').selectOption('10');
    await expect(page.locator('tbody tr.tbl-row')).toHaveCount(2);
  });
}

test('fixed columns retain identity and measured offsets after reorder, resize and hiding', async ({ page }) => {
  await page.goto('/__review__');
  const expectOffsets = async () => {
    await expect.poll(() => header(page, 'name').evaluate(cell => getComputedStyle(cell).left)).toBe('0px');
    await expect.poll(async () => {
      const width = await header(page, 'name').evaluate(cell => cell.getBoundingClientRect().width);
      const left = await header(page, 'note').evaluate(cell => parseFloat(getComputedStyle(cell).left));
      return Math.abs(width - left);
    }).toBeLessThan(1);
    expect(await bodyCell(page, 'id').evaluate(cell => getComputedStyle(cell).position)).toBe('relative');
    expect(await bodyCell(page, 'name').evaluate(cell => getComputedStyle(cell).position)).toBe('sticky');
  };
  await expectOffsets();
  const handle = header(page, 'name').getByRole('button', { name: 'Trascina colonna', exact: true });
  await handle.press('Alt+ArrowRight');
  await expect(page.getByRole('columnheader').nth(2)).toContainText('Name');
  await expectOffsets();
  await header(page, 'name').getByRole('separator').press('ArrowRight');
  await expectOffsets();
  await page.getByRole('button', { name: /configura colonne/i }).click();
  await page.getByRole('dialog').getByRole('switch', { name: /Name/ }).uncheck();
  await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
  await expect(header(page, 'name')).toHaveCount(0);
  await expect.poll(() => header(page, 'note').evaluate(cell => getComputedStyle(cell).left)).toBe('0px');
  await expect.poll(() => bodyCell(page, 'note').evaluate(cell => getComputedStyle(cell).left)).toBe('0px');
});

test('object measurement refs expose the cell and clear when the column is hidden', async ({ page }) => {
  await page.goto('/__review__');
  await page.getByRole('button', { name: 'Read measured ref', exact: true }).click();
  await expect(page.getByLabel('Measured tag', { exact: true })).toHaveText('TD');
  await page.getByRole('button', { name: /configura colonne/i }).click();
  await page.getByRole('dialog').getByRole('switch', { name: /Note/ }).uncheck();
  await page.getByRole('button', { name: 'Chiudi', exact: true }).click();
  await page.getByRole('button', { name: 'Read measured ref', exact: true }).click();
  await expect(page.getByLabel('Measured tag', { exact: true })).toHaveText('none');
});
