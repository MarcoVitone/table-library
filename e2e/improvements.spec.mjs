import { test, expect } from '@playwright/test';
const pageErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
});
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]); });

test('semantic headers expose sorting and keyboard sorting preserves focus', async ({ page }) => {
  await page.getByRole('button', { name: 'Ordina & Filtra', exact: true }).click();
  const header = page.getByRole('columnheader').filter({ has: page.getByText('Nome', { exact: true }) });
  await expect(header).toHaveAttribute('scope', 'col');
  const sort = header.getByRole('button', { name: 'Ordina colonna' });
  await sort.focus();
  await sort.press('Enter');
  await expect(header).toHaveAttribute('aria-sort', 'ascending');
  await expect(sort).toBeFocused();
  await sort.press('Space');
  await expect(header).toHaveAttribute('aria-sort', 'descending');
  await sort.press('Enter');
  await expect(header).toHaveAttribute('aria-sort', 'none');
});

test('column resizing supports keyboard increments and the minimum width', async ({ page }) => {
  await page.getByRole('button', { name: 'Ridimensionabile', exact: true }).click();
  const header = page.getByRole('columnheader').first();
  const handle = header.getByRole('separator');
  const before = (await header.boundingBox()).width;
  await handle.focus();
  await handle.press('ArrowRight');
  await expect.poll(async () => Math.abs((await header.boundingBox()).width - before - 10)).toBeLessThan(2);
  await expect(handle).toBeFocused();
  await handle.press('Shift+ArrowRight');
  await expect.poll(async () => Math.abs((await header.boundingBox()).width - before - 60)).toBeLessThan(2);
  await handle.press('Home');
  await expect.poll(async () => Math.abs((await header.boundingBox()).width - 100)).toBeLessThan(2);
  await handle.press('ArrowLeft');
  await expect.poll(async () => Math.abs((await header.boundingBox()).width - 100)).toBeLessThan(2);
});

test('column reordering supports keyboard moves and keeps the moved control focused', async ({ page }) => {
  await page.getByRole('button', { name: 'Drag & Drop', exact: true }).click();
  const header = page.getByRole('columnheader').filter({ has: page.getByText('Nome (Drag Me)', { exact: true }) });
  const handle = header.getByRole('button', { name: 'Trascina colonna' });
  await handle.focus();
  await handle.press('Alt+ArrowRight');
  await expect(page.getByRole('columnheader').nth(1)).toContainText('Nome (Drag Me)');
  await expect(handle).toBeFocused();
  await expect(header.getByRole('status')).toContainText('posizione 2');
  await handle.press('Alt+ArrowLeft');
  await expect(page.getByRole('columnheader').first()).toContainText('Nome (Drag Me)');
  await handle.press('Alt+ArrowLeft');
  await expect(page.getByRole('columnheader').first()).toContainText('Nome (Drag Me)');
});

test('collapsed columns can be expanded from the keyboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Collassabile', exact: true }).click();
  const header = page.getByRole('columnheader').first();
  await header.getByRole('button', { name: 'Collassa colonna' }).click();
  await expect(header).toHaveAttribute('tabindex', '0');
  await header.focus();
  await header.press('Enter');
  await expect(header).toContainText('Nome');
  await expect(page.locator('tbody tr').first().locator('td').first()).not.toBeEmpty();
});

test('input editing validates, cancels with Escape and supports row editability', async ({ page }) => {
  await page.getByRole('button', { name: 'Modifica celle', exact: true }).click();
  const rows = page.locator('tbody tr');
  const name = rows.first().getByRole('textbox', { name: 'Nome', exact: true });
  await name.fill('Modifica annullata');
  await name.press('Escape');
  await expect(name).toHaveValue('Anna');
  await expect(page.locator('output')).toHaveText('Nessuna modifica');
  await name.fill('');
  await name.press('Enter');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(rows.first().getByRole('alert')).toHaveText('Il nome è obbligatorio');
  await expect(page.locator('output')).toHaveText('Nessuna modifica');
  await name.fill('Anna valida');
  await name.press('Tab');
  await expect(name).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('output')).toContainText('Anna valida');
  await expect(rows.nth(1).getByRole('textbox', { name: 'Nome', exact: true })).toHaveAttribute('readonly', '');
});

test('async editing disables duplicate saves, reports rejection and permits retry', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: 'Modifica celle', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Salvataggio asincrono', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Simula errore salvataggio', exact: true }).check();
  const row = page.locator('tbody tr').first();
  const name = row.getByRole('textbox', { name: 'Nome', exact: true });
  await name.fill('Tentativo');
  await name.press('Enter');
  await expect(row.getByRole('status')).toHaveText('Salvataggio…');
  await expect(name).toBeDisabled();
  await expect(row.getByRole('spinbutton')).toHaveAttribute('readonly', '');
  await expect(row.getByRole('alert')).toHaveText('Salvataggio rifiutato');
  await expect(name).toBeEnabled();
  await expect(row.getByRole('spinbutton')).not.toHaveAttribute('readonly', '');
  await expect(name).toHaveValue('Tentativo');
  await expect(page.locator('output')).toHaveText('Nessuna modifica');
  await page.getByRole('checkbox', { name: 'Simula errore salvataggio', exact: true }).uncheck();
  await name.fill('Anna salvata');
  await name.press('Enter');
  await expect(row.getByRole('status')).toHaveText('Salvataggio…');
  await expect(page.locator('output')).toContainText('Anna salvata');
  await expect(name).toBeEnabled();
  await expect(row.getByRole('alert')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('autocomplete validation can reject a choice and Escape restores the original selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Modifica celle', exact: true }).click();
  const row = page.locator('tbody tr').nth(2);
  const role = row.getByRole('combobox', { name: 'Ruolo', exact: true });
  await role.fill('Amministratore');
  await page.getByRole('option', { name: 'Amministratore', exact: true }).click();
  await expect(role).toHaveAttribute('aria-invalid', 'true');
  await expect(row.getByRole('alert')).toHaveText('Ruolo non consentito');
  await expect(page.locator('output')).toHaveText('Nessuna modifica');
  await role.press('Escape');
  await expect(role).toHaveValue('Lettore');
  await expect(row.getByRole('alert')).toHaveCount(0);
});

test('table loading, error/retry and empty states transition without displaying stale rows', async ({ page }) => {
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  const table = page.getByRole('table', { name: 'Risultati server' });
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(2);
  const scenario = page.getByRole('combobox', { name: 'Scenario' });
  await scenario.selectOption('loading');
  await expect(table).toHaveAttribute('aria-busy', 'true');
  await expect(table.locator('tbody').getByRole('status')).toHaveText('Caricamento…');
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(0);
  await scenario.selectOption('error');
  await expect(table.getByRole('alert')).toContainText('Impossibile caricare i dati');
  await table.getByRole('button', { name: 'Riprova' }).click();
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(2);
  await expect(table).not.toHaveAttribute('aria-busy', 'true');
  await scenario.selectOption('empty');
  await expect(table.locator('tbody').getByRole('status')).toHaveText('Nessun dato disponibile');
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(0);
});

test('server queries reset pagination once for filtering/sorting and follow external state', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  const table = page.getByRole('table', { name: 'Risultati server' });
  const queryOutput = page.getByRole('status', { name: 'Query corrente' });
  const changesOutput = page.getByRole('status', { name: 'Cambi query' });
  const query = async () => JSON.parse(await queryOutput.textContent());
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(2);
  await expect(changesOutput).toHaveText('0');
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect.poll(query).toMatchObject({ page: 1 });
  await expect(changesOutput).toHaveText('1');
  await expect(table.locator('tbody')).toContainText('Marco');
  await table.getByRole('button', { name: 'Ordina colonna' }).click();
  await expect.poll(query).toMatchObject({ page: 0, sorting: [{ key: 'name', dir: 'asc' }] });
  await expect(changesOutput).toHaveText('2');
  await expect(table.locator('tbody tr.tbl-row').first()).toContainText('Anna');
  await page.getByRole('button', { name: 'Imposta pagina esterna' }).click();
  await expect.poll(query).toMatchObject({ page: 2, sorting: [], filters: [] });
  await expect(table.locator('tbody tr.tbl-row').first()).toContainText('Carla');
  await expect(changesOutput).toHaveText('2');
  await table.getByRole('button', { name: 'Filtra colonna' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('nessuna corrispondenza');
  await expect.poll(query).toMatchObject({ page: 0, filters: [{ key: 'name', op: 'match', val: 'nessuna corrispondenza' }] });
  await page.getByRole('dialog').getByRole('textbox').press('Escape');
  await expect(table.locator('tbody').getByRole('status')).toHaveText('Nessun risultato per i filtri applicati');
  await expect(changesOutput).toHaveText('3');
  expect(errors).toEqual([]);
});

test('server page-size changes emit a single complete query and reset the page', async ({ page }) => {
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  const table = page.getByRole('table', { name: 'Risultati server' });
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(table.locator('tbody')).toContainText('Marco');
  const changes = page.getByRole('status', { name: 'Cambi query' });
  await expect(changes).toHaveText('1');
  await page.locator('.tbl-pagination-info select').selectOption('5');
  await expect.poll(async () => JSON.parse(await page.getByRole('status', { name: 'Query corrente' }).textContent()))
    .toMatchObject({ page: 0, pageSize: 5, sorting: [], filters: [] });
  await expect(changes).toHaveText('2');
  await expect(table.locator('tbody tr.tbl-row')).toHaveCount(5);
});
