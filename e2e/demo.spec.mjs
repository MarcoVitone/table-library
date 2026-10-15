import { test, expect } from '@playwright/test';
import { MOCK_USERS } from '../src/demo/mock-data.ts';

const demos = ['Base', 'Paginazione', 'Ordina & Filtra', 'Celle Custom', 'Selezione', 'Drag & Drop', 'Ridimensionabile', 'Collassabile', 'Config. Colonne', 'Modifica celle'];
const bodyRows = page => page.locator('tbody tr');
const header = (page, label) => page.locator('thead td').filter({ has: page.getByText(label, { exact: true }) });
const names = page => bodyRows(page).locator('td:first-child').allTextContents();
const pageErrors = new WeakMap();

// Each test starts a fresh browser context with no user profiles or stored credentials.
test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Framework Tabelle - Demo' })).toBeVisible();
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

for (const demo of demos) {
  test('renders demo: ' + demo, async ({ page }) => {
    await page.getByRole('button', { name: demo, exact: true }).click();
    await expect(page.locator('table')).toBeVisible();
    await expect(bodyRows(page).first()).toBeVisible();
  });
}

test('pagination changes page and page size', async ({ page }) => {
  await page.getByRole('button', { name: 'Paginazione', exact: true }).click();
  await expect(bodyRows(page)).toHaveCount(5);
  await expect(bodyRows(page).first()).toContainText(MOCK_USERS[0].firstName);
  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(bodyRows(page).first()).toContainText(MOCK_USERS[5].firstName);
  await page.getByRole('combobox').selectOption('10');
  await expect(bodyRows(page)).toHaveCount(Math.min(10, MOCK_USERS.length));
  await expect(bodyRows(page).first()).toContainText(MOCK_USERS[0].firstName);
});

test('pagination keeps column widths stable across pages and page sizes', async ({ page }) => {
  await page.getByRole('button', { name: 'Paginazione', exact: true }).click();
  const widths = () => page.locator('thead td').evaluateAll(cells =>
    cells.map(cell => cell.getBoundingClientRect().width)
  );
  const initialWidths = await widths();
  const expectStableWidths = async () => {
    await expect.poll(async () => {
      const currentWidths = await widths();
      return Math.max(...currentWidths.map((width, index) => Math.abs(width - initialWidths[index])));
    }).toBeLessThan(1);
  };

  await page.getByRole('button', { name: 'Pagina successiva', exact: true }).click();
  await expect(bodyRows(page).first()).toContainText(MOCK_USERS[5].firstName);
  await expectStableWidths();
  await page.getByRole('button', { name: 'Ultima pagina', exact: true }).click();
  await expect(bodyRows(page).last()).toContainText(MOCK_USERS.at(-1).firstName);
  await expectStableWidths();
  await page.getByRole('button', { name: 'Prima pagina', exact: true }).click();
  await expect(bodyRows(page).first()).toContainText(MOCK_USERS[0].firstName);
  await expectStableWidths();
  await page.getByRole('combobox').selectOption('10');
  await expect(bodyRows(page)).toHaveCount(Math.min(10, MOCK_USERS.length));
  await expectStableWidths();
});

test('sorting cycles through ascending, descending and original order', async ({ page }) => {
  await page.getByRole('button', { name: 'Ordina & Filtra', exact: true }).click();
  const nameHeader = header(page, 'Nome');
  await nameHeader.hover();
  const sortButton = nameHeader.locator('.sort-icon');
  await sortButton.click();
  const ascending = MOCK_USERS.map(user => user.firstName).sort();
  await expect.poll(() => names(page)).toEqual(ascending);
  await sortButton.click();
  await expect.poll(() => names(page)).toEqual([...ascending].reverse());
  await sortButton.click();
  await expect.poll(() => names(page)).toEqual(MOCK_USERS.map(user => user.firstName));
});

test('text filter accepts uppercase input and can be cleared', async ({ page }) => {
  await page.getByRole('button', { name: 'Ordina & Filtra', exact: true }).click();
  const nameHeader = header(page, 'Nome');
  await nameHeader.hover();
  await nameHeader.locator('.filter-icon').click();
  await page.getByRole('textbox').fill('MARIO');
  await expect(bodyRows(page)).toHaveCount(1);
  await expect(bodyRows(page).first()).toContainText('Mario');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(bodyRows(page)).toHaveCount(MOCK_USERS.length);
});

test('numeric filter matches numeric ages and can be cleared', async ({ page }) => {
  await page.getByRole('button', { name: 'Ordina & Filtra', exact: true }).click();
  const ageHeader = header(page, 'Età');
  await ageHeader.hover();
  await ageHeader.locator('.filter-icon').click();
  const field = page.getByRole('spinbutton');
  const age = MOCK_USERS[0].age;
  await field.fill(String(age));
  await expect(bodyRows(page)).toHaveCount(MOCK_USERS.filter(user => user.age === age).length);
  await expect(bodyRows(page).first()).toContainText('Mario');
  await field.fill('');
  await expect(bodyRows(page)).toHaveCount(MOCK_USERS.length);
});

test('selection handles one row, all rows and clearing', async ({ page }) => {
  await page.getByRole('button', { name: 'Selezione', exact: true }).click();
  const counter = page.locator('strong').filter({ hasText: 'Selected Rows:' }).locator('..');
  await page.locator('tbody input[type="checkbox"]').first().check();
  await expect(counter).toHaveText(/Selected Rows:\s*1$/);
  const all = page.locator('thead input[type="checkbox"]');
  await all.check();
  await expect(counter).toHaveText(new RegExp('Selected Rows:\\s*' + MOCK_USERS.length + '$'));
  await all.uncheck();
  await expect(counter).toHaveText(/Selected Rows:\s*0$/);
});

async function resizeColumn(page, column, delta) {
  const handle = column.getByRole('separator', { name: 'Ridimensiona colonna' });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + delta, y, { steps: 10 });
  const liveWidth = await column.evaluate(cell => cell.getBoundingClientRect().width);
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await column.boundingBox()).width - liveWidth)).toBeLessThan(2);
  return (await column.boundingBox()).width;
}

test('resize grows and shrinks smoothly without moving the other columns', async ({ page }) => {
  await page.getByRole('button', { name: 'Ridimensionabile', exact: true }).click();
  const cells = page.locator('thead td');
  const first = cells.nth(0);
  const start = await first.boundingBox();
  const neighbor = await cells.nth(1).boundingBox();
  const grown = await resizeColumn(page, first, 120);
  expect(Math.abs(grown - (start.width + 120))).toBeLessThan(2);
  const shrunk = await resizeColumn(page, first, -180);
  expect(Math.abs(shrunk - (grown - 180))).toBeLessThan(2);
  expect(shrunk).toBeLessThan(start.width);
  expect(Math.abs((await cells.nth(1).boundingBox()).width - neighbor.width)).toBeLessThan(2);
  expect(Math.abs((await page.locator('tbody tr').first().locator('td').first().boundingBox()).width - shrunk)).toBeLessThan(2);
});

test('resize respects the configured minimum width', async ({ page }) => {
  await page.getByRole('button', { name: 'Ridimensionabile', exact: true }).click();
  const first = page.locator('thead td').first();
  const start = await first.boundingBox();
  const width = await resizeColumn(page, first, 100 - start.width - 40);
  expect(Math.abs(width - 100)).toBeLessThan(2);
  await expect.poll(() => page.locator('body').evaluate(body => body.style.cursor)).toBe('');
});


test('resize works on another column, supports repeated drags and a click without movement', async ({ page }) => {
  await page.getByRole('button', { name: 'Ridimensionabile', exact: true }).click();
  const cells = page.locator('thead td');
  const first = cells.nth(0);
  const second = cells.nth(1);
  const original = (await first.boundingBox()).width;
  await resizeColumn(page, first, -60);
  const before = (await second.boundingBox()).width;
  const grown = await resizeColumn(page, second, 75);
  expect(Math.abs(grown - before - 75)).toBeLessThan(2);
  const shrunk = await resizeColumn(page, second, -110);
  expect(Math.abs(shrunk - grown + 110)).toBeLessThan(2);
  const clicked = await resizeColumn(page, second, 0);
  expect(Math.abs(clicked - shrunk)).toBeLessThan(2);
  expect(Math.abs((await first.boundingBox()).width - original + 60)).toBeLessThan(2);
});

test('drag and drop reorders headers and their body data', async ({ page }) => {
  await page.getByRole('button', { name: 'Drag & Drop', exact: true }).click();
  const source = header(page, 'Nome (Drag Me)');
  await source.locator('.drag-handle').dragTo(header(page, 'Email'));
  await expect(page.locator('thead td')).toHaveText(['Cognome', 'Email', 'Nome (Drag Me)', 'Ruolo']);
  await expect(bodyRows(page).first().locator('td').nth(0)).toHaveText(MOCK_USERS[0].lastName);
  await expect(bodyRows(page).first().locator('td').nth(2)).toHaveText(MOCK_USERS[0].firstName);
});

test('a collapsed column can be expanded with its original data', async ({ page }) => {
  await page.getByRole('button', { name: 'Collassabile', exact: true }).click();
  const first = page.locator('thead td').first();
  await first.getByRole('button', { name: 'Collassa colonna' }).click();
  await expect(first).toHaveText('');
  await expect(bodyRows(page).first().locator('td').first()).toHaveText('');
  await first.dblclick();
  await expect(first).toContainText('Nome');
  await expect(bodyRows(page).first().locator('td').first()).toHaveText(MOCK_USERS[0].firstName);
});

test('column configuration hides, restores, reorders and resets columns', async ({ page }) => {
  await page.getByRole('button', { name: 'Config. Colonne', exact: true }).click();
  await page.getByRole('button', { name: 'Configura colonne', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const firstItem = dialog.getByRole('listitem').first();
  const toggle = firstItem.locator('input');
  await toggle.uncheck();
  await expect(page.locator('thead td')).toHaveCount(4);
  await toggle.check();
  await expect(page.locator('thead td')).toHaveCount(5);
  await firstItem.getByRole('button', { name: 'Sposta giù' }).click();
  await expect(page.locator('thead td').first()).toHaveText('Cognome');
  await dialog.getByRole('button', { name: 'Ripristina Default' }).click();
  await expect(page.locator('thead td')).toHaveText(['Nome', 'Cognome', 'Email', 'Ruolo', 'Salary']);
  await dialog.getByRole('button', { name: 'Chiudi', exact: true }).click();
  await expect(dialog).toBeHidden();
});

test('custom action uses the data of the clicked row', async ({ page }) => {
  await page.getByRole('button', { name: 'Celle Custom', exact: true }).click();
  const dialogEvent = page.waitForEvent('dialog');
  const click = bodyRows(page).first().getByRole('button', { name: 'View', exact: true }).click();
  const dialog = await dialogEvent;
  expect(dialog.message()).toBe('Visiting ' + MOCK_USERS[0].city);
  await dialog.accept();
  await click;
});


const lastEdit = async page => JSON.parse(await page.locator('output[aria-label="Ultima modifica"]').textContent());

test('native inputs commit text, numbers and clearing through onDataChange', async ({page}) => {
  await page.getByRole('button',{name:'Modifica celle',exact:true}).click();
  const row=bodyRows(page).first();
  const name=row.locator('td').nth(0).locator('input');
  const number=row.getByRole('spinbutton');
  await name.fill('Anna modificata');
  await name.press('Tab');
  await expect.poll(()=>lastEdit(page)).toMatchObject({id:0,name:'Anna modificata'});
  await number.fill('-12.5');
  await number.press('Tab');
  await expect.poll(()=>lastEdit(page)).toMatchObject({amount:-12.5});
  await number.fill('0');
  await number.press('Tab');
  await expect.poll(()=>lastEdit(page)).toMatchObject({amount:0});
  await number.fill('');
  await number.press('Tab');
  await expect.poll(()=>lastEdit(page)).toMatchObject({amount:''});
});

test('native autocomplete searches object options, selects by keyboard and clears', async ({page}) => {
  await page.getByRole('button',{name:'Modifica celle',exact:true}).click();
  const row=bodyRows(page).first();
  const field=row.getByRole('combobox',{name:'Ruolo',exact:true});
  await field.fill('EDI');
  await expect(page.getByRole('option',{name:'Editor',exact:true})).toBeVisible();
  await field.press('ArrowDown');
  await field.press('Enter');
  await expect.poll(()=>lastEdit(page)).toMatchObject({role:{id:2,label:'Editor'}});
  await expect(field).toHaveValue('Editor');
  await expect(field).toHaveAttribute('aria-expanded','false');
  await row.locator('td').nth(2).getByRole('button',{name:'Cancella selezione'}).click();
  await expect.poll(()=>lastEdit(page)).toMatchObject({role:null});
  await expect(field).toHaveValue('');
  const required=row.getByRole('combobox',{name:'Ruolo obbligatorio',exact:true});
  await expect(row.locator('td').nth(3).getByRole('button',{name:'Cancella selezione'})).toHaveCount(0);
  await required.fill('lett');
  await page.getByRole('option',{name:'Lettore',exact:true}).click();
  await expect.poll(()=>lastEdit(page)).toMatchObject({requiredRole:'Lettore'});
});

test('native controls reflect external data and the configured theme', async ({page}) => {
  await page.getByRole('button',{name:'Modifica celle',exact:true}).click();
  await page.getByRole('button',{name:'Aggiorna dati esterni',exact:true}).click();
  const row=bodyRows(page).first();
  await expect(row.locator('td').nth(0).locator('input')).toHaveValue('Aggiornata');
  await expect(row.getByRole('spinbutton')).toHaveValue('42');
  await expect(row.getByRole('combobox',{name:'Ruolo',exact:true})).toHaveValue('Lettore');
  await expect(page.locator('output')).toHaveText('Nessuna modifica');
  await expect(page.locator('thead td').first()).toHaveCSS('color','rgb(107, 39, 126)');
});

test('native dialogs trap keyboard focus, close with Escape and restore the opener', async ({page}) => {
  await page.getByRole('button',{name:'Config. Colonne',exact:true}).click();
  const opener=page.getByRole('button',{name:'Configura colonne',exact:true});
  await opener.click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Chiudi',exact:true}).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button',{name:'Chiudi configurazione',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button',{name:'Chiudi',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await page.getByRole('button',{name:'Ordina & Filtra',exact:true}).click();
  const nameHeader=header(page,'Nome');
  await nameHeader.hover();
  const filter=nameHeader.locator('.filter-icon');
  await filter.click();
  await expect(page.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(filter).toBeFocused();
});

test('native select filters preserve zero, false, multiple options and dates', async ({page}) => {
  await page.getByRole('button',{name:'Modifica celle',exact:true}).click();
  async function openFilter(label){const cell=header(page,label);await cell.hover();await cell.locator('.filter-icon').click();return page.getByRole('dialog');}
  let dialog=await openFilter('Livello');
  await dialog.getByRole('combobox').selectOption('0');
  await expect(bodyRows(page)).toHaveCount(1);
  await expect(bodyRows(page).first().locator('td').nth(0).locator('input')).toHaveValue('Anna');
  await dialog.getByRole('button',{name:'Reset',exact:true}).click();
  dialog=await openFilter('Attivo');
  await dialog.getByRole('combobox').selectOption('1');
  await expect(bodyRows(page)).toHaveCount(2);
  await dialog.getByRole('button',{name:'Reset',exact:true}).click();
  dialog=await openFilter('Team');
  await dialog.getByRole('listbox').selectOption(['0','2']);
  await expect(bodyRows(page)).toHaveCount(2);
  await expect(bodyRows(page).last().locator('td').nth(0).locator('input')).toHaveValue('Carla');
  await dialog.getByRole('button',{name:'Reset',exact:true}).click();
  dialog=await openFilter('Data');
  await dialog.locator('input[type="date"]').fill('2026-01-11');
  await expect(bodyRows(page)).toHaveCount(1);
  await expect(bodyRows(page).first().locator('td').nth(0).locator('input')).toHaveValue('Bruno');
  await dialog.getByRole('button',{name:'Reset',exact:true}).click();
  await expect(bodyRows(page)).toHaveCount(3);
});


test('native autocomplete cancels unmatched text without changing the selected value',async({page})=>{
 await page.getByRole('button',{name:'Modifica celle',exact:true}).click();
 const field=bodyRows(page).first().getByRole('combobox',{name:'Ruolo',exact:true});
 await field.fill('nessuna corrispondenza');
 await expect(page.getByRole('status').filter({hasText:'Nessun risultato'})).toBeVisible();
 await field.press('Escape');
 await expect(field).toHaveValue('Amministratore');
 await expect(field).toBeFocused();
 await field.fill('altra ricerca');
 await page.getByRole('heading',{name:'Framework Tabelle - Demo'}).click();
 await expect(field).toHaveValue('Amministratore');
 await expect(field).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('output')).toHaveText('Nessuna modifica');
});

test('native pagination stays within a narrow viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Paginazione',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'Pagina successiva',exact:true}).click();
 await expect(bodyRows(page).first()).toContainText(MOCK_USERS[5].firstName);
});
