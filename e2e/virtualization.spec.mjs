import { test, expect } from '@playwright/test';

const errorsByPage = new WeakMap();
const viewport = page => page.locator('.tbl-virtual-viewport');
const rows = page => page.locator('tbody > tr[data-virtual-row]');
const rowAt = (page, index) => page.locator(`tbody > tr[data-virtual-index="${index}"]`);
async function scrollTo(page, position) {
  await viewport(page).evaluate((element, target) => { element.scrollTop = target === 'end' ? element.scrollHeight : target; }, position);
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Virtualizzazione', exact: true }).click();
  await expect(rowAt(page, 0)).toBeVisible();
});
test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('ten thousand rows use a bounded DOM and the first/last records remain reachable', async ({ page }) => {
  await expect(page.getByRole('table', { name: 'Righe virtualizzate' })).toHaveAttribute('aria-rowcount', '10001');
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
  await expect(rowAt(page, 0)).toContainText('Riga 00000');
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeInViewport();
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
  await expect(rowAt(page, 0)).toHaveCount(0);
  await scrollTo(page, 0);
  await expect(rowAt(page, 0)).toBeVisible();
  await expect(page.locator('.tbl-virtual-spacer')).toHaveAttribute('aria-hidden', 'true');
});

test('fixed columns, sticky headers and column widths stay aligned while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 650, height: 900 });
  const widths = () => page.locator('thead th').evaluateAll(cells => cells.map(cell => cell.getBoundingClientRect().width));
  const initialWidths = await widths();
  await scrollTo(page, 20000);
  await expect.poll(async () => Number(await rows(page).first().getAttribute('data-virtual-index'))).toBeGreaterThan(100);
  expect(await widths()).toEqual(initialWidths);
  await viewport(page).evaluate(element => { element.scrollLeft = 150; });
  const header = page.locator('thead th').nth(1);
  const cell = rows(page).nth(4).locator('td').nth(1);
  await expect.poll(async () => Math.abs((await header.boundingBox()).x - (await cell.boundingBox()).x)).toBeLessThan(1);
  await expect.poll(async () => {
    const parent = await viewport(page).boundingBox();
    return Math.abs((await header.boundingBox()).y - parent.y);
  }).toBeLessThan(2);
});

test('striped colors and accessible indices follow the full sorted body, not the window', async ({ page }) => {
  await scrollTo(page, 23200);
  await expect.poll(async () => Number(await rows(page).first().getAttribute('data-virtual-index'))).toBeGreaterThan(100);
  const info = await rows(page).evaluateAll(elements => elements.map(row => ({
    index: Number(row.dataset.virtualIndex), aria: Number(row.getAttribute('aria-rowindex')),
    color: getComputedStyle(row).backgroundColor,
    cellColor: getComputedStyle(row.cells[1]).backgroundColor,
  })));
  for (const row of info) {
    const expected = row.index % 2 === 0 ? 'rgb(255, 255, 255)' : 'rgb(245, 247, 250)';
    expect(row.aria).toBe(row.index + 2);
    expect(row.color).toBe(expected);
    expect(row.cellColor).toBe(expected);
  }
});

test('selection survives window changes and select-all includes unmounted records', async ({ page }) => {
  await rowAt(page, 0).getByRole('checkbox').check();
  const selected = page.getByRole('status', { name: 'Righe selezionate virtuali' });
  await expect(selected).toHaveText('1');
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeVisible();
  await page.locator('thead').getByRole('checkbox').check();
  await expect(selected).toHaveText('10000');
  await expect(rowAt(page, 9999).getByRole('checkbox')).toBeChecked();
  await scrollTo(page, 0);
  await expect(rowAt(page, 0).getByRole('checkbox')).toBeChecked();
  await page.locator('thead').getByRole('checkbox').uncheck();
  await expect(selected).toHaveText('0');
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
});

test('filtering/sorting at a deep scroll resets the viewport and preserves the entire data pipeline', async ({ page }) => {
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeVisible();
  const nameHeader = page.getByRole('columnheader').filter({ has: page.getByText('Nome', { exact: true }) });
  await nameHeader.getByRole('button', { name: 'Filtra colonna' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill('Riga 09999');
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText('Riga 09999');
  await expect.poll(() => viewport(page).evaluate(element => element.scrollTop)).toBe(0);
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(rowAt(page, 0)).toContainText('Riga 00000');
  await nameHeader.getByRole('button', { name: 'Ordina colonna' }).click();
  await nameHeader.getByRole('button', { name: 'Ordina colonna' }).click();
  await expect(rowAt(page, 0)).toContainText('Riga 09999');
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
});

test('measured variable heights and viewport resizing leave no gaps or overlapping rows', async ({ page }) => {
  await expect.poll(async () => (await rowAt(page, 0).boundingBox()).height).toBeGreaterThan(48);
  await scrollTo(page, 650);
  await expect(rowAt(page, 17)).toHaveCount(1);
  await expect.poll(async () => {
    const boxes = await rows(page).evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect(); return { top: box.top, bottom: box.bottom };
    }));
    return Math.max(...boxes.slice(1).map((box, index) => Math.abs(box.top - boxes[index].bottom)));
  }).toBeLessThan(1);
  await page.getByRole('checkbox', { name: 'Viewport compatto', exact: true }).check();
  await expect(viewport(page)).toHaveCSS('height', '240px');
  await expect.poll(() => rows(page).count()).toBeLessThan(30);
});

test('focused drafts and validation errors remain mounted outside the visible range', async ({ page }) => {
  const input = rowAt(page, 0).getByRole('spinbutton');
  await input.fill('-1');
  await scrollTo(page, 20000);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('-1');
  await expect(rowAt(page, 0)).toHaveCount(1);
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
  await scrollTo(page, 0);
  await input.press('Enter');
  await expect(rowAt(page, 0).getByRole('alert')).toBeVisible();
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeVisible();
  await expect(input).toHaveValue('-1');
  await expect(rowAt(page, 0).getByRole('alert')).toHaveCount(1);
  await scrollTo(page, 0);
  await input.fill('12');
  await input.press('Enter');
  await expect(page.getByRole('status', { name: 'Ultima modifica virtuale' })).toContainText('"quantity":12');
  await expect(rowAt(page, 0).getByRole('alert')).toHaveCount(0);
});

test('pending async saves and rejected drafts survive scrolling, then can be retried', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Salvataggio differito', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Rifiuta salvataggio', exact: true }).check();
  const input = rowAt(page, 0).getByRole('spinbutton');
  await input.fill('20');
  await input.press('Enter');
  await expect(input).toBeDisabled();
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeVisible();
  await expect(rowAt(page, 0).getByRole('alert')).toHaveText('Salvataggio rifiutato');
  await expect(input).toHaveValue('20');
  await page.getByRole('checkbox', { name: 'Rifiuta salvataggio', exact: true }).uncheck();
  await scrollTo(page, 0);
  await input.fill('21');
  await input.press('Enter');
  await expect(page.getByRole('status', { name: 'Ultima modifica virtuale' })).toContainText('"quantity":21');
  await expect(input).toBeEnabled();
});

test('shrinking data near the end resets stale offsets and leaves the new data reachable', async ({ page }) => {
  await scrollTo(page, 'end');
  await expect(rowAt(page, 9999)).toBeVisible();
  await page.getByRole('button', { name: 'Riduci a 25 righe', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Righe virtualizzate' })).toHaveAttribute('aria-rowcount', '26');
  await expect(rowAt(page, 0)).toBeVisible();
  await expect.poll(() => viewport(page).evaluate(element => element.scrollTop)).toBe(0);
  await scrollTo(page, 'end');
  await expect(rowAt(page, 24)).toBeVisible();
  await page.getByRole('button', { name: 'Ripristina dataset', exact: true }).click();
  await expect(rowAt(page, 0)).toBeVisible();
  await expect.poll(() => rows(page).count()).toBeLessThan(35);
});
