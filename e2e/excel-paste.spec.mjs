import { test, expect } from '@playwright/test';

const dialog = page => page.getByRole('dialog', { name: 'Incolla da Excel', exact: true });
const errorsByPage = new WeakMap();
async function openPaste(page, text, column = '0', row = '0') {
  await page.getByRole('button', { name: 'Incolla da Excel', exact: true }).click();
  await dialog(page).getByRole('combobox', { name: 'Riga iniziale' }).selectOption(row);
  await dialog(page).getByRole('combobox', { name: 'Colonna iniziale' }).selectOption(column);
  await dialog(page).getByRole('textbox', { name: 'Celle da Excel' }).fill(text);
  await dialog(page).getByRole('button', { name: 'Anteprima', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Modifica celle', exact: true }).click();
});
test.afterEach(async ({ page }) => expect(errorsByPage.get(page)).toEqual([]));

test('English locale reaches the paste dialog, validation and accessible controls while preserving column labels', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Lingua / Language' }).selectOption('en');
  await expect(page.getByRole('button', { name: 'Sort column', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Paste from Excel', exact: true }).click();
  const englishDialog = page.getByRole('dialog', { name: 'Paste from Excel', exact: true });
  await englishDialog.getByRole('combobox', { name: 'Starting column' }).selectOption('1');
  await englishDialog.getByRole('textbox', { name: 'Cells from Excel' }).fill('invalid');
  await englishDialog.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(englishDialog.getByRole('table', { name: 'Paste preview' })).toContainText('Enter a valid number.');
  await expect(englishDialog.getByRole('table')).toContainText('Quantità');
  await expect(englishDialog.getByRole('status')).toHaveText('1 cell, 1 error.');
  await expect(englishDialog.getByRole('button', { name: 'Apply block' })).toBeDisabled();
  await englishDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('combobox', { name: 'Lingua / Language' }).selectOption('it');
  await expect(page.getByRole('button', { name: 'Incolla da Excel', exact: true })).toBeVisible();
});

test('paste follows sorted rows and filters instead of the original data order', async ({ page }) => {
  const nameHeader = page.getByRole('columnheader').filter({ has: page.getByText('Nome', { exact: true }) });
  await nameHeader.getByRole('button', { name: 'Ordina colonna' }).click();
  await nameHeader.getByRole('button', { name: 'Ordina colonna' }).click();
  await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  await openPaste(page, '99', '1');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).first()).toHaveValue('99');
  await expect(page.getByRole('status').filter({ hasText: 'Blocco applicato' })).toBeVisible();
  await expect(page.getByLabel('Ultima modifica')).toContainText('"name":"Carla"');
  await nameHeader.getByRole('button', { name: 'Filtra colonna' }).click();
  await page.getByRole('dialog').getByRole('textbox').fill('Anna');
  await page.getByRole('dialog').getByRole('textbox').press('Escape');
  await openPaste(page, '88', '1');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(page.getByLabel('Ultima modifica')).toContainText('"name":"Anna"');
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true })).toHaveValue('88');
});

test('preview shows validation and read-only errors and cancellation changes nothing', async ({ page }) => {
  await openPaste(page, '\tbad\nCannot edit\t8');
  await expect(dialog(page).getByRole('table')).toContainText('Il nome è obbligatorio');
  await expect(dialog(page).getByRole('table')).toContainText('Inserisci un numero valido');
  await expect(dialog(page).getByRole('table')).toContainText('Cella non modificabile');
  await expect(dialog(page).getByRole('button', { name: 'Applica blocco' })).toBeDisabled();
  await dialog(page).getByRole('button', { name: 'Annulla', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Nome', exact: true }).first()).toHaveValue('Anna');
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).nth(1)).toHaveValue('12');
});

test('a valid rectangle converts numbers and autocomplete options and commits only after confirmation', async ({ page }) => {
  await openPaste(page, '3,5\tEditor\n7\tLettore', '1');
  await expect(dialog(page).getByRole('status')).toHaveText('4 celle, 0 errori.');
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).first()).toHaveValue('0');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).first()).toHaveValue('3.5');
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).nth(1)).toHaveValue('7');
  await expect(page.getByRole('combobox', { name: 'Ruolo', exact: true }).first()).toHaveValue('Editor');
  await expect(page.getByRole('combobox', { name: 'Ruolo', exact: true }).nth(1)).toHaveValue('Lettore');
  await expect(page.getByRole('status').filter({ hasText: 'Blocco applicato:' })).toHaveText('Blocco applicato: 2 righe aggiornate.');
});

test('async save failures retain preview and data, prevent duplicate submission, and allow retry', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Salvataggio asincrono' }).check();
  await page.getByRole('checkbox', { name: 'Simula errore salvataggio' }).check();
  await openPaste(page, 'New Anna\t4');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(dialog(page).getByRole('button', { name: 'Applica blocco' })).toBeDisabled();
  await expect(dialog(page).getByRole('button', { name: 'Annulla' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByRole('alert')).toContainText('Salvataggio rifiutato');
  await expect(page.getByRole('textbox', { name: 'Nome', exact: true }).first()).toHaveValue('Anna');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(dialog(page).getByRole('alert')).toContainText('Salvataggio rifiutato');
  await dialog(page).getByRole('button', { name: 'Annulla' }).click();
  await page.getByRole('checkbox', { name: 'Simula errore salvataggio' }).uncheck();
  await openPaste(page, 'New Anna\t4');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Nome', exact: true }).first()).toHaveValue('New Anna');
});

test('overflow is rejected and changes to data require a new preview', async ({ page }) => {
  await openPaste(page, '1\n2\n3\n4', '1');
  await expect(dialog(page).getByRole('table')).toContainText('supera le righe');
  await expect(dialog(page).getByRole('button', { name: 'Applica blocco' })).toBeDisabled();
  await dialog(page).getByRole('textbox', { name: 'Celle da Excel' }).fill('8');
  await dialog(page).getByRole('button', { name: 'Anteprima', exact: true }).click();
  // Simulate an external update while the user is reviewing the preview.
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Aggiorna dati esterni').click());
  await expect(dialog(page).getByRole('alert')).toContainText('Genera una nuova anteprima');
  await expect(dialog(page).getByRole('button', { name: 'Applica blocco' })).toBeDisabled();
  await dialog(page).getByRole('button', { name: 'Anteprima', exact: true }).click();
  await expect(dialog(page).getByRole('table')).toContainText('42');
  await dialog(page).getByRole('button', { name: 'Applica blocco' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Quantità', exact: true }).first()).toHaveValue('8');
});
