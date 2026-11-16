require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { TableLocalizationProvider } = require('../src/tables-framework/localization/localization.tsx');
const { createTableTranslator } = require('../src/tables-framework/localization/messages.ts');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { previewExcelPaste, parseExcelClipboard } = require('../src/tables-framework/utils/excel-paste/excel-paste.ts');
const h = React.createElement;
const data = [{ id: 0, name: 'Alice' }];
const columns = [{ id: 'name', label: 'Customer', type: 'input', headerProps: { sortable: true } }];
const table = props => h(DynamicTable, { data, columns, enableColumnConfig: true, globalSearch: true,
  pagination: { enabled: true, limit: 5 }, excelPaste: { onApply() {} }, ...props });

test('library defaults are English and supplied column/input labels remain unchanged', () => {
  const html = renderToStaticMarkup(table());
  assert.match(html, /aria-label="Sort column"/);
  assert.match(html, /aria-label="Customer"/);
  assert.match(html, /Paste from Excel/);
  assert.match(html, /Rows per page:/);
  assert.match(html, /Global search/);
  assert.doesNotMatch(html, /Incolla da Excel|Ordina colonna|Ricerca globale/);
});
test('table localization selects Italian and supports arbitrary language overrides', () => {
  const italian = renderToStaticMarkup(table({ localization: { locale: 'it-IT' } }));
  assert.match(italian, /aria-label="Ordina colonna"/);
  assert.match(italian, /Incolla da Excel/);
  assert.match(italian, /Righe per pagina:/);
  const german = renderToStaticMarkup(table({ localization: { locale: 'de', messages: {
    'paste.open': 'Aus Excel einfügen', 'a11y.sort': 'Spalte sortieren',
  } } }));
  assert.match(german, /Aus Excel einfügen/);
  assert.match(german, /aria-label="Spalte sortieren"/);
  assert.match(german, /Global search/);
});
test('nested providers merge dictionaries and explicit accessibility/input labels win', () => {
  const html = renderToStaticMarkup(h(TableLocalizationProvider, { value: { locale: 'it', messages: { 'paste.open': 'Importa celle' } } },
    table({ localization: { messages: { 'a11y.sort': 'Ordina campo' } }, globalSearch: { label: 'Trova clienti' },
      accessibility: { slotProps: { sortButton: { 'aria-label': 'Ordine personalizzato' } } } })));
  assert.match(html, /Importa celle/);
  assert.match(html, /Ordine personalizzato/);
  assert.match(html, /Trova clienti/);
  assert.doesNotMatch(html, /aria-label="Ordina campo"/);
});
test('translation placeholders and clipboard validation errors use the selected dictionary', () => {
  const t = createTableTranslator({ locale: 'fr', messages: {
    'paste.summary': '{count} cellules, {errors} erreurs.', 'paste.number': 'Nombre invalide', 'paste.rectangle': 'Bloc non rectangulaire',
  } });
  assert.equal(t('paste.summary', { count: 4, errors: 2 }), '4 cellules, 2 erreurs.');
  assert.throws(() => parseExcelClipboard('a\tb\nc', t), /Bloc non rectangulaire/);
  const result = previewExcelPaste([{ id: 0, count: 1 }], [0], [{ id: 'count', label: 'Total', type: 'input', inputType: 'number' }], 'bad', 0, 0, 'id', t);
  assert.equal(result.cells[0].column, 'Total');
  assert.equal(result.cells[0].error, 'Nombre invalide');
  assert.equal(createTableTranslator({ messages: { 'paste.help': '' } })('paste.help'), '');
  assert.equal(createTableTranslator()('paste.summary', { count: 1, errors: 1 }), '1 cell, 1 error.');
  assert.equal(createTableTranslator({ locale: 'it' })('paste.summary', { count: 1, errors: 0 }), '1 cella, 0 errori.');
  assert.equal(createTableTranslator({ messages: { 'paste.applied': ({ count }) => `${count} imports` } })('paste.applied', { count: 2 }), '2 imports');
});
