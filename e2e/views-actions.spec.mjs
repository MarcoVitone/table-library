import { test, expect } from '@playwright/test';

const errorsByPage = new WeakMap();
const rows = page => page.locator('tbody tr');
const nameHeader = page => page.getByRole('columnheader').filter({ has: page.getByText('Nome', { exact: true }) });
const viewsSelect = page => page.getByRole('combobox', { name: 'Viste salvate', exact: true });
const search = page => page.getByRole('searchbox', { name: 'Ricerca globale', exact: true });
const sizeSelect = page => page.getByRole('combobox').filter({ has: page.locator('option[value="6"]') });
const toolbar = page => page.getByRole('toolbar', { name: 'Azioni sulle righe selezionate' });
async function openManagement(page) {
  await page.getByRole('button', { name: 'Viste e azioni', exact: true }).click();
}
async function save(page, name) {
  await page.getByRole('textbox', { name: 'Nome vista', exact: true }).fill(name);
  await page.getByRole('button', { name: 'Salva vista', exact: true }).click();
  return viewsSelect(page).inputValue();
}
async function filterCity(page, text) {
  const header = page.getByRole('columnheader').filter({ has: page.getByText('Città', { exact: true }) });
  await header.getByRole('button', { name: 'Filtra colonna' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill(text);
  await page.getByRole('dialog').getByRole('textbox').press('Escape');
}

test('shared snapshot restores in a fresh browser without saved views and supports manual copying', async ({ page, browser }) => {
  await openManagement(page);
  await sizeSelect(page).selectOption('4');
  await filterCity(page, 'Roma');
  await search(page).fill('ar');
  await nameHeader(page).getByRole('button', { name: 'Ordina colonna' }).click();
  await nameHeader(page).getByRole('separator').focus();
  await nameHeader(page).getByRole('separator').press('Shift+ArrowRight');
  await page.getByRole('button', { name: 'Configura colonne', exact: true }).click();
  await page.getByRole('dialog').getByRole('listitem').filter({ hasText: 'Stato' }).getByRole('switch').uncheck();
  await page.getByRole('dialog').getByRole('button', { name: 'Chiudi', exact: true }).click();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await page.getByRole('button', { name: 'Condividi vista', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Copia il link' })).toBeVisible();
  const url = await page.getByRole('textbox', { name: 'Link alla vista', exact: true }).inputValue();
  const context = await browser.newContext();
  try {
    const recipient = await context.newPage();
    await recipient.goto(url);
    await openManagement(recipient);
    await expect(search(recipient)).toHaveValue('ar');
    await expect(sizeSelect(recipient)).toHaveValue('4');
    await expect(nameHeader(recipient)).toHaveAttribute('aria-sort', 'ascending');
    await expect(recipient.locator('thead th')).toHaveText(['', 'Nome', 'Città']);
    await expect(rows(recipient)).toHaveCount(2);
    await expect(rows(recipient).first()).toContainText('Carla');
    await expect(viewsSelect(recipient).locator('option')).toHaveCount(1);
    await expect.poll(() => recipient.evaluate(() => localStorage.getItem('table_views_demo-contacts'))).toBeNull();
    // A later user edit must not reapply the snapshot on every render.
    await search(recipient).fill('Marco');
    await expect(search(recipient)).toHaveValue('Marco');
  } finally { await context.close(); }
});

test('malformed shared URLs leave the current table usable', async ({ page }) => {
  await page.goto('/?tableView.demo-contacts=%7Bbroken');
  await openManagement(page);
  await expect(page.getByRole('alert')).toContainText('vista non valida');
  await expect(rows(page)).toHaveCount(2);
  await search(page).fill('Anna');
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page)).toContainText('Anna');
});

test('copy uses the clipboard without changing the URL and history restores shared snapshots', async ({ page }) => {
  await openManagement(page);
  const originalUrl = page.url();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: async value => { window.copiedView = value; } } }));
  await search(page).fill('Marco');
  await page.getByRole('button', { name: 'Condividi vista', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link copiato.' })).toBeVisible();
  const marcoUrl = await page.evaluate(() => window.copiedView);
  expect(page.url()).toBe(originalUrl);
  await search(page).fill('Anna');
  await page.getByRole('button', { name: 'Condividi vista', exact: true }).click();
  const annaUrl = await page.evaluate(() => window.copiedView);
  await page.evaluate(url => { history.pushState(null, '', url); window.dispatchEvent(new PopStateEvent('popstate')); }, marcoUrl);
  await expect(search(page)).toHaveValue('Marco');
  await page.evaluate(url => { history.pushState(null, '', url); window.dispatchEvent(new PopStateEvent('popstate')); }, annaUrl);
  await expect(search(page)).toHaveValue('Anna');
  await page.goBack();
  await expect(search(page)).toHaveValue('Marco');
  // Legacy query mode also imports the link on mount.
  await page.getByRole('checkbox', { name: 'Query unificata', exact: true }).uncheck();
  await expect(search(page)).toHaveValue('Marco');
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page)).toContainText('Marco');
});

test('shared server views emit one complete query when mounted', async ({ page }) => {
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  await search(page).fill('Elena');
  await expect(rows(page).first()).toContainText('Elena');
  await page.getByRole('button', { name: 'Condividi vista', exact: true }).click();
  const url = await page.getByRole('textbox', { name: 'Link alla vista', exact: true }).inputValue();
  await page.goto(url);
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  await expect(rows(page).first()).toContainText('Elena');
  await expect(search(page)).toHaveValue('Elena');
  await expect(page.getByRole('status', { name: 'Cambi query' })).toHaveText('1');
});

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
});
test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('named views restore filters, search, sorting, column widths/order/visibility and page size after reload', async ({ page }) => {
  await openManagement(page);
  await sizeSelect(page).selectOption('4');
  await filterCity(page, 'Roma');
  await search(page).fill('ar');
  await nameHeader(page).getByRole('button', { name: 'Ordina colonna' }).click();
  await nameHeader(page).getByRole('separator').focus();
  await nameHeader(page).getByRole('separator').press('Shift+ArrowRight');
  await nameHeader(page).getByRole('button', { name: 'Trascina colonna' }).focus();
  await nameHeader(page).getByRole('button', { name: 'Trascina colonna' }).press('Alt+ArrowRight');
  await page.getByRole('button', { name: 'Configura colonne', exact: true }).click();
  await page.getByRole('dialog').getByRole('listitem').filter({ hasText: 'Stato' }).getByRole('switch').uncheck();
  await page.getByRole('dialog').getByRole('button', { name: 'Chiudi', exact: true }).click();
  const id = await save(page, 'Roma ordinata');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('table_views_demo-contacts')));
  const saved = stored.views[0].state;
  expect(saved.pageSize).toBe(4);
  expect(saved.search).toBe('ar');
  expect(saved.filters[0]).toMatchObject({ key: 'city', val: 'Roma' });
  expect(saved.sorting[0]).toMatchObject({ key: 'name', dir: 'asc' });
  expect(saved.columnsLayout.map(column => column.id)).toEqual(['selection', 'city', 'name', 'status']);
  expect(saved.columnsLayout.find(column => column.id === 'status').props.isHidden).toBe(true);
  expect(saved.columnsLayout.find(column => column.id === 'name').props.width).toBeGreaterThan(220);
  await search(page).fill('Anna');
  await expect(page.getByText('Vista modificata', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Applica vista', exact: true }).click();
  await expect(search(page)).toHaveValue('ar');
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).first()).toContainText('Carla');
  await page.reload();
  await openManagement(page);
  await viewsSelect(page).selectOption(id);
  await expect(search(page)).toHaveValue('ar');
  await expect(sizeSelect(page)).toHaveValue('4');
  await expect(nameHeader(page)).toHaveAttribute('aria-sort', 'ascending');
  await expect(page.locator('thead th')).toHaveText(['', 'Città', 'Nome']);
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).first()).toContainText('Carla');
  await expect(page.getByText('Vista modificata', { exact: true })).toHaveCount(0);
});

test('views validate names, reject duplicates, update/rename explicitly and delete persistently', async ({ page }) => {
  await openManagement(page);
  await page.getByRole('button', { name: 'Salva vista', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Inserisci un nome');
  const id = await save(page, 'Preferita');
  await page.getByRole('button', { name: 'Salva vista', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Esiste già');
  await search(page).fill('Roma');
  await page.getByRole('textbox', { name: 'Nome vista', exact: true }).fill('Contatti Roma');
  await page.getByRole('button', { name: 'Aggiorna vista', exact: true }).click();
  await expect(viewsSelect(page)).toHaveValue(id);
  await expect(viewsSelect(page).locator('option')).toHaveText(['Seleziona una vista', 'Contatti Roma']);
  await search(page).fill('Milano');
  await page.getByRole('button', { name: 'Applica vista', exact: true }).click();
  await expect(search(page)).toHaveValue('Roma');
  await page.getByRole('button', { name: 'Elimina vista', exact: true }).click();
  await expect(search(page)).toHaveValue('Roma');
  await expect(viewsSelect(page).locator('option')).toHaveCount(1);
  await page.reload();
  await openManagement(page);
  await expect(viewsSelect(page).locator('option')).toHaveCount(1);
});

test('saved views work with legacy pagination and layout without a unified query', async ({ page }) => {
  await openManagement(page);
  await page.getByRole('checkbox', { name: 'Query unificata', exact: true }).uncheck();
  await filterCity(page, 'Roma');
  await search(page).fill('ar');
  await nameHeader(page).getByRole('button', { name: 'Ordina colonna' }).click();
  await sizeSelect(page).selectOption('4');
  await save(page, 'Legacy');
  await filterCity(page, 'Milano');
  await search(page).fill('Anna');
  await page.getByRole('button', { name: 'Applica vista', exact: true }).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).first()).toContainText('Carla');
  await expect(search(page)).toHaveValue('ar');
  await expect(sizeSelect(page)).toHaveValue('4');
});

test('applying a server view emits one complete query and resets pagination', async ({ page }) => {
  await page.getByRole('button', { name: 'Stati e server', exact: true }).click();
  await expect(rows(page).first()).toContainText('Zoe');
  await save(page, 'Tutti');
  await search(page).fill('Elena');
  await expect(rows(page).first()).toContainText('Elena');
  const count = page.getByRole('status', { name: 'Cambi query' });
  const before = Number(await count.textContent());
  await page.getByRole('button', { name: 'Applica vista', exact: true }).click();
  await expect(rows(page).first()).toContainText('Zoe');
  await expect(count).toHaveText(String(before + 1));
  await expect.poll(async () => JSON.parse(await page.getByRole('status', { name: 'Query corrente' }).textContent()))
    .toMatchObject({ page: 0, pageSize: 2, sorting: [], filters: [], search: '' });
});

test('bulk actions receive selected records, allow clearing, and follow the current page', async ({ page }) => {
  await openManagement(page);
  await expect(toolbar(page)).toHaveCount(0);
  await rows(page).first().getByRole('checkbox').check();
  await expect(toolbar(page)).toContainText('1 righe selezionate');
  await toolbar(page).getByRole('button', { name: 'Mostra selezionate', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Ultime righe elaborate' })).toHaveText('[0]');
  await expect(rows(page).first().getByRole('checkbox')).toBeChecked();
  await page.locator('thead').getByRole('checkbox').check();
  await toolbar(page).getByRole('button', { name: 'Mostra selezionate', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Ultime righe elaborate' })).toHaveText('[0,1]');
  await toolbar(page).getByRole('button', { name: 'Deseleziona tutte', exact: true }).click();
  await expect(toolbar(page)).toHaveCount(0);
  await rows(page).first().getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(rows(page).first()).toContainText('Giulia');
  await expect(toolbar(page)).toHaveCount(0);
});

test('async bulk failures preserve selection and retries clear only successfully processed rows', async ({ page }) => {
  await openManagement(page);
  await page.getByRole('checkbox', { name: 'Simula errore azione', exact: true }).check();
  await rows(page).first().getByRole('checkbox').check();
  const archive = toolbar(page).getByRole('button', { name: 'Archivia selezionate', exact: true });
  await archive.click();
  await expect(archive).toBeDisabled();
  await expect(toolbar(page).getByRole('button', { name: 'Mostra selezionate', exact: true })).toBeDisabled();
  await expect(page.getByText('Operazione in corso…', { exact: true })).toBeVisible();
  await archive.evaluate(button => { button.click(); button.click(); });
  await expect(page.getByRole('alert')).toContainText('Archiviazione rifiutata');
  await expect(page.getByRole('status', { name: 'Esecuzioni azione' })).toHaveText('1');
  await expect(rows(page).first().getByRole('checkbox')).toBeChecked();
  await page.getByRole('checkbox', { name: 'Simula errore azione', exact: true }).uncheck();
  await archive.click();
  // A new selection made during the request must survive its completion.
  await rows(page).nth(1).getByRole('checkbox').check();
  await expect(rows(page).first()).toContainText('Archiviato');
  await expect(rows(page).first().getByRole('checkbox')).not.toBeChecked();
  await expect(rows(page).nth(1).getByRole('checkbox')).toBeChecked();
  await expect(page.getByRole('status', { name: 'Ultime righe elaborate' })).toHaveText('[0]');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('status', { name: 'Esecuzioni azione' })).toHaveText('2');
});

test('conditional bulk disabled state uses the selected records', async ({ page }) => {
  await openManagement(page);
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await rows(page).nth(1).getByRole('checkbox').check();
  await expect(toolbar(page).getByRole('button', { name: 'Archivia selezionate', exact: true })).toBeDisabled();
  await rows(page).first().getByRole('checkbox').check();
  await expect(toolbar(page).getByRole('button', { name: 'Archivia selezionate', exact: true })).toBeEnabled();
});

test('virtualized bulk actions include selected unmounted rows', async ({ page }) => {
  await page.getByRole('button', { name: 'Virtualizzazione', exact: true }).click();
  await page.locator('thead').getByRole('checkbox').check();
  await toolbar(page).getByRole('button', { name: 'Conta selezionate', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Righe elaborate virtuali' })).toHaveText('10000');
  expect(await page.locator('tr[data-virtual-row]').count()).toBeLessThan(35);
});

test('corrupt browser storage is reported and can be replaced by a valid saved view', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('table_views_demo-contacts', '{invalid'));
  await openManagement(page);
  await expect(page.getByRole('alert')).toContainText('Impossibile leggere');
  await save(page, 'Recuperata');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await openManagement(page);
  await expect(viewsSelect(page).locator('option')).toHaveText(['Seleziona una vista', 'Recuperata']);
});
