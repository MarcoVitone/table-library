import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.errors = [];
  page.on('pageerror', error => page.errors.push(error.message));
  await page.goto('/');
});
test.afterEach(async ({ page }) => { expect(page.errors).toEqual([]); });

async function openSearch(page) {
  await page.getByRole('button', { name: 'Ricerca globale', exact: true }).click();
  return page.getByRole('searchbox', { name: 'Ricerca globale', exact: true });
}

test('searches across columns before pagination and restores rows when cleared', async ({ page }) => {
  const search = await openSearch(page);
  const rows = page.locator('tbody');
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(rows).toContainText('Giulia');
  await search.fill('marco ROMA');
  await expect(rows).toContainText('Marco Rossi');
  await expect(rows.locator('tr')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Pagina precedente', exact: true })).toBeDisabled();
  await search.fill('jose');
  await expect(rows).toContainText('José Neri');
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(rows).toContainText('Anna');
  await search.fill('example.it');
  await expect(rows.locator('tr')).toHaveCount(2);
  await page.getByRole('button', { name: 'Cancella ricerca globale', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(rows).toContainText('Marco');
});

test('column restrictions and column filters intersect the global search', async ({ page }) => {
  const search = await openSearch(page);
  await search.fill('Roma');
  await expect(page.locator('tbody')).toContainText('Marco');
  await expect(page.locator('tbody')).toContainText('Giulia');
  await page.getByRole('checkbox', { name: 'Cerca solo nei nomi' }).check();
  await expect(page.locator('tbody').getByRole('status')).toContainText('Nessun risultato');
  await page.getByRole('checkbox', { name: 'Cerca solo nei nomi' }).uncheck();
  const nameHeader = page.getByRole('columnheader').filter({ has: page.getByText('Nome', { exact: true }) });
  await nameHeader.getByRole('button', { name: 'Filtra colonna' }).click();
  const filter = page.getByRole('dialog').getByRole('textbox');
  await filter.fill('Giulia');
  await filter.press('Escape');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody')).toContainText('Giulia');
  await search.fill('Marco');
  await expect(page.locator('tbody').getByRole('status')).toContainText('Nessun risultato');
});

test('controlled server search emits one query with page reset and follows external updates', async ({ page }) => {
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  const table = page.getByRole('table', { name: 'Risultati server' });
  await expect(table.locator('tbody')).toContainText('Zoe');
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(table.locator('tbody')).toContainText('Marco');
  const count = page.getByRole('status', { name: 'Cambi query' });
  const before = Number(await count.textContent());
  await page.getByRole('searchbox', { name: 'Ricerca globale' }).fill('Elena');
  await expect(count).toHaveText(String(before + 1));
  await expect.poll(async () => JSON.parse(await page.getByRole('status', { name: 'Query corrente' }).textContent()))
    .toMatchObject({ page: 0, search: 'Elena', filters: [], sorting: [] });
  await expect(table.locator('tbody')).toContainText('Elena');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Imposta pagina esterna' }).click();
  await expect(page.getByRole('searchbox', { name: 'Ricerca globale' })).toHaveValue('');
  await expect(table.locator('tbody')).toContainText('Carla');
});

test('global search finds unmounted virtual rows and resets the scroll window', async ({ page }) => {
  await page.getByRole('button', { name: 'Virtualizzazione', exact: true }).click();
  const viewport = page.locator('.tbl-virtual-viewport');
  await viewport.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(page.locator('tr[data-virtual-row]').last()).toContainText('Riga 09999');
  await page.getByRole('searchbox', { name: 'Ricerca globale' }).fill('00042');
  await expect(page.locator('tr[data-virtual-row]')).toHaveCount(1);
  await expect(page.locator('tr[data-virtual-row]')).toContainText('Riga 00042');
  await expect.poll(() => viewport.evaluate(element => element.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Cancella ricerca globale', exact: true }).click();
  await expect(page.locator('tr[data-virtual-row]').first()).toContainText('Riga 00000');
  expect(await page.locator('tr[data-virtual-row]').count()).toBeLessThan(40);
});
