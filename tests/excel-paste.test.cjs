require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseExcelClipboard, previewExcelPaste } = require('../src/tables-framework/utils/excel-paste/excel-paste.ts');

const columns = [
  { id: 'name', label: 'Nome', type: 'input', validate: value => value.trim() ? null : 'Nome obbligatorio' },
  { id: 'amount', label: 'Quantità', type: 'input', inputType: 'number' },
];
const data = () => [{ id: 0, name: 'Anna', amount: 1 }, { id: 1, name: 'Bruno', amount: 2 }];
test('Excel TSV supports quoted tabs, multiline cells, escaped quotes, CRLF and empty cells', () => {
  assert.deepEqual(parseExcelClipboard('"a\tb"\t"c\r\nd"\r\n"say ""hi"""\t\r\n'), [['a\tb', 'c\r\nd'], ['say "hi"', '']]);
  assert.deepEqual(parseExcelClipboard('a\t\n\t'), [['a', ''], ['', '']]);
  assert.deepEqual(parseExcelClipboard('""'), [['']]);
});
test('malformed, ragged and oversized clipboard blocks fail before preview', () => {
  for (const text of ['', '"open', '"a"x', 'a\tb\nc', 'a'.repeat(1_000_001), Array(10002).fill('x').join('\t')]) {
    assert.throws(() => parseExcelClipboard(text));
  }
});
test('preview maps displayed row order to data, converts decimal comma and leaves originals intact', () => {
  const original = data(); original.forEach(Object.freeze); Object.freeze(original);
  const result = previewExcelPaste(original, [1, 0], columns, 'B\t12,5\nA\t0', 0, 0);
  assert.deepEqual(result.newData, [{ id: 0, name: 'A', amount: 0 }, { id: 1, name: 'B', amount: 12.5 }]);
  assert.deepEqual(result.updatedRows.map(row => row.id), [1, 0]);
  assert.equal(result.cells.filter(cell => cell.error).length, 0);
  assert.equal(original[0].name, 'Anna');
});
test('preview reports validation, read-only cells, bad numbers and overflow without mutating data', () => {
  const original = data();
  const cols = [{ ...columns[0], editable: row => row.id !== 1 }, columns[1]];
  const result = previewExcelPaste(original, [0, 1], cols, '\tNaN\nChanged\t5\nOverflow\t6', 0, 0);
  assert.match(result.cells[0].error, /Nome obbligatorio/);
  assert.match(result.cells[1].error, /valid number/);
  assert.match(result.cells[2].error, /read-only/);
  assert.match(result.cells[4].error, /exceeds/);
  assert.deepEqual(result.newData, original);
  assert.deepEqual(result.updatedRows, []);
  assert.deepEqual(original, data());
});
test('autocomplete resolves exact labels and validates the actual option and original row', () => {
  const option = { id: 10, label: 'Editor' };
  let received;
  const cols = [{ id: 'role', label: 'Ruolo', type: 'autocomplete', autocompleteOptions: [option],
    validate: (value, row) => { received = [value, row]; } }];
  const rows = [{ id: 0, role: option }];
  const result = previewExcelPaste(rows, [0], cols, 'Editor', 0, 0);
  assert.equal(result.cells[0].previous, option);
  assert.equal(result.updatedRows.length, 0);
  assert.deepEqual(received, [option, rows[0]]);
  assert.match(previewExcelPaste(rows, [0], cols, 'Unknown', 0, 0).cells[0].error, /options/);
  assert.match(previewExcelPaste(rows, [0], [{ ...cols[0], autocompleteOptions: [option, { ...option }] }], 'Editor', 0, 0).cells[0].error, /unique/);
  assert.match(previewExcelPaste(rows, [0], [{ ...cols[0], disableClearable: true }], '""', 0, 0).cells[0].error, /options/);
});
test('booleans, dates, nested paths and literal dotted keys preserve their types and structure', () => {
  const rows = [{ id: 0, profile: { name: 'A', extra: 7 }, 'a.b': 'old', active: false, date: '' }];
  const cols = [
    { id: 'name', dataKey: 'profile.name', label: 'Name', type: 'input' },
    { id: 'literal', dataKey: 'a.b', label: 'Literal', type: 'input' },
    { id: 'active', label: 'Active', type: 'input', inputType: 'boolean' },
    { id: 'date', label: 'Date', type: 'input', inputType: 'date' },
  ];
  const result = previewExcelPaste(rows, [0], cols, 'B\tnew\ttrue\t2028-02-29', 0, 0);
  assert.deepEqual(result.newData[0], { id: 0, profile: { name: 'B', extra: 7 }, 'a.b': 'new', active: true, date: '2028-02-29' });
  assert.match(previewExcelPaste(rows, [0], cols, 'B\tnew\tmaybe\t2026-02-29', 0, 0).cells[3].error, /valid date/);
});
test('read-only column types, thrown validators and missing or duplicate identities are errors', () => {
  const rows = data();
  assert.match(previewExcelPaste(rows, [0], [{ id: 'name', label: 'Nome' }], 'X', 0, 0).cells[0].error, /read-only/);
  assert.match(previewExcelPaste(rows, [0], [{ ...columns[0], validate: () => { throw Error('Business rule'); } }], 'X', 0, 0).cells[0].error, /Business rule/);
  for (const invalidRows of [[{ name: 'No id' }], [{ id: 0 }, { id: 0 }]]) {
    assert.match(previewExcelPaste(invalidRows, [0], columns, 'X', 0, 0).cells[0].error, /unique identifier/);
  }
});
test('paste cannot change row identity and does not report unchanged values as edits', () => {
  const cols = [{ id: 'id', label: 'ID', type: 'input', inputType: 'number' }];
  assert.match(previewExcelPaste(data(), [0], cols, '5', 0, 0).cells[0].error, /identifier/);
  assert.equal(previewExcelPaste(data(), [0, 1], columns, 'Anna\t1', 0, 0).updatedRows.length, 0);
  assert.throws(() => previewExcelPaste(data(), [0], columns, 'X', -1, 0));
});
