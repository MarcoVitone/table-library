require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { BaseRow } = require('../src/tables-framework/components/rows/base-row/base-row.tsx');
const { SelectionRow } = require('../src/tables-framework/components/rows/selection-row/selection-row.tsx');

const data = [
  { id: 0, name: 'Zoe', urgent: false },
  { id: 1, name: 'Anna', urgent: true },
  { id: 2, name: 'Marco', urgent: false },
];
const columns = [
  { id: 'name', dataKey: 'name', label: 'Name', fixed: true },
  { id: 'urgent', dataKey: 'urgent', label: 'Urgent' },
];
function styleOf(tag) {
  const style = tag.match(/style="([^"]*)"/)?.[1] ?? '';
  return Object.fromEntries(style.split(';').filter(Boolean).map(rule => {
    const colon = rule.indexOf(':');
    return [rule.slice(0, colon), rule.slice(colon + 1)];
  }));
}
function render(props = {}) {
  const html = renderToStaticMarkup(React.createElement(DynamicTable, { data, columns, ...props }));
  const body = html.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/(<tr\b[^>]*>)([\s\S]*?)<\/tr>/g)].map(match => ({
    style: styleOf(match[1]),
    cells: [...match[2].matchAll(/<td\b[^>]*>/g)].map(cell => styleOf(cell[0])),
    html: match[0],
  }));
  return { html, rows };
}

test('row styling is opt-in and keeps existing cell and fixed-column defaults', () => {
  const { rows } = render();
  assert.equal(rows[0].style['background-color'], undefined);
  assert.equal(rows[0].cells[0]['background-color'], '#fff');
  assert.equal(rows[0].cells[1]['background-color'], 'transparent');
  assert.equal(render({ stripedRows: false }).rows[1].style['background-color'], undefined);
});

test('stripedRows uses default or custom colors across all cells including fixed columns', () => {
  for (const [stripedRows, expected] of [
    [true, ['#ffffff', '#f5f7fa', '#ffffff']],
    [{ oddColor: '#112233', evenColor: '#445566' }, ['#112233', '#445566', '#112233']],
    [{ evenColor: '#445566' }, ['#ffffff', '#445566', '#ffffff']],
  ]) {
    const { html, rows } = render({ stripedRows });
    assert.deepEqual(rows.map(row => row.style['background-color']), expected);
    rows.forEach((row, index) => row.cells.forEach(cell => assert.equal(cell['background-color'], expected[index])));
    assert.equal(rows[0].cells[0].position, 'sticky');
    assert.doesNotMatch(html.match(/<thead[\s\S]*?<\/thead>/)[0], /#112233|#445566|#f5f7fa/);
    assert.doesNotMatch(html, /stripedRows=|getRowStyle=|rowBackgroundColor=/);
  }
});

test('getRowStyle receives original data once per visible row and overrides stripes', () => {
  const calls = [];
  const { rows } = render({ stripedRows: true, getRowStyle: (row, index) => {
    calls.push([row, index]);
    return row.urgent ? { backgroundColor: '#fff3cd', color: '#123456', height: 48 } : undefined;
  } });
  assert.equal(calls.length, 3);
  calls.forEach(([row, index]) => assert.equal(row, data[index]));
  assert.deepEqual(calls.map(([, index]) => index), [0, 1, 2]);
  assert.equal(rows[1].style['background-color'], '#fff3cd');
  assert.equal(rows[1].style.height, '48px');
  rows[1].cells.forEach(cell => {
    assert.equal(cell['background-color'], '#fff3cd');
    assert.equal(cell.color, '#123456');
  });
  assert.equal(rows[0].style['background-color'], '#ffffff');
});

test('conditional styling works without stripes and tolerates null or undefined results', () => {
  const { rows } = render({ getRowStyle: row => row.urgent ? { backgroundColor: '#fff3cd' } : null });
  assert.equal(rows[1].cells[0]['background-color'], '#fff3cd');
  assert.equal(rows[0].cells[0]['background-color'], '#fff');
  assert.equal(rows[0].cells[1]['background-color'], 'transparent');
});

test('cell color and inline style overrides, sorting and selection keep priority over row colors', () => {
  const { rows } = render({
    stripedRows: true,
    columns: [
      { ...columns[0], bodyProps: { backgroundColor: '#111111', fontColor: '#222222' } },
      { ...columns[1], bodyProps: { style: { backgroundColor: '#333333' } } },
    ],
    getRowStyle: () => ({ backgroundColor: '#444444', color: '#555555' }),
    rowSelectedColor: '#666666',
    rowStatusMapper: row => ({ isSelected: row.id === 1 }),
  });
  assert.equal(rows[0].cells[0]['background-color'], '#111111');
  assert.equal(rows[0].cells[0].color, '#222222');
  assert.equal(rows[0].cells[1]['background-color'], '#333333');
  assert.equal(rows[1].cells[0]['background-color'], '#666666');
  const sorted = render({ stripedRows: true,
    columns: [{ ...columns[0], bodyProps: { sortable: true, backgroundColorSort: '#777777' } }],
    layout: { sorting: [{ key: 'name', dir: 'asc', isServerSide: false }] },
  });
  assert.equal(sorted.rows[0].cells[0]['background-color'], '#777777');
});

test('row indices and stripes follow filtering, sorting and the visible page', () => {
  const calls = [];
  const { rows } = render({ stripedRows: true,
    layout: { filtering: [{ key: 'name', op: 'match', val: 'a' }], sorting: [{ key: 'name', dir: 'asc', isServerSide: false }] },
    pagination: { enabled: true, controlled: { page: 1, limit: 1, onPageChange() {}, onLimitChange() {} }, limitOptions: [1] },
    getRowStyle: (row, index) => { calls.push([row.name, index]); },
  });
  assert.deepEqual(calls, [['Marco', 0]]);
  assert.equal(rows[0].cells[0]['background-color'], '#ffffff');
});

test('row styles compose with existing custom row styles and native row elements', () => {
  for (const body of [[BaseRow, { style: { height: 40, backgroundColor: '#111111' } }], 'tr', [SelectionRow, { singleSelect: true }]]) {
    const { rows } = render({ rows: { header: BaseRow, body, footer: BaseRow }, stripedRows: true,
      getRowStyle: () => ({ backgroundColor: '#abcdef' }),
    });
    assert.equal(rows[0].style['background-color'], '#abcdef');
    assert.equal(rows[0].cells[0]['background-color'], '#abcdef');
    if (Array.isArray(body) && body[0] === BaseRow) assert.equal(rows[0].style.height, '40px');
  }
});

test('empty tables do not invoke getRowStyle', () => {
  let calls = 0;
  const { html } = render({ data: [], stripedRows: true, getRowStyle: () => { calls++; } });
  assert.match(html, /Nessun dato disponibile/);
  assert.equal(calls, 0);
});
