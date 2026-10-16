require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { BaseRow } = require('../src/tables-framework/components/rows/base-row/base-row.tsx');
const { SelectionRow } = require('../src/tables-framework/components/rows/selection-row/selection-row.tsx');
const { normalizeVirtualization, virtualRange, findVirtualRow } = require('../src/tables-framework/hooks/use-virtual-rows/use-virtual-rows.ts');
const { renderRows } = require('../src/tables-framework/components/table-renderer/utils/render-rows/render-rows.tsx');

test('virtual ranges use measured heights, header offsets, overscan and exact row boundaries', () => {
  const offsets = [0, 40, 140, 180, 220, 260, 300];
  assert.equal(findVirtualRow(offsets, 40), 1);
  assert.equal(findVirtualRow(offsets, 139), 1);
  assert.equal(findVirtualRow(offsets, 140), 2);
  assert.deepEqual(virtualRange(offsets, 140, 80, 40, 40, 0), { start: 2, end: 3 });
  assert.deepEqual(virtualRange(offsets, 140, 80, 40, 0, 0), { start: 1, end: 3 });
  assert.deepEqual(virtualRange(offsets, 140, 80, 40, 40, 1), { start: 1, end: 4 });
  assert.deepEqual(virtualRange([0], 1000, 400, 40, 40, 5), { start: 0, end: 0 });
  assert.deepEqual(virtualRange(offsets, 99999, 400, 40, 40, 5), { start: 0, end: 6 });
});

test('virtualization defaults and invalid numeric settings are normalized safely', () => {
  assert.equal(normalizeVirtualization(false).enabled, false);
  assert.deepEqual(normalizeVirtualization(true), { enabled: true, height: 400, rowHeight: 48, overscan: 5 });
  assert.deepEqual(normalizeVirtualization({ rowHeight: -1, overscan: -3 }), { enabled: true, height: 400, rowHeight: 1, overscan: 0 });
  assert.equal(normalizeVirtualization({ rowHeight: NaN, overscan: Infinity }).rowHeight, 48);
});

test('server rendering mounts a bounded set of cells while preserving full row count', () => {
  const data = Array.from({ length: 2000 }, (_, id) => ({ id, name: 'Row ' + id }));
  let mounted = 0;
  function Cell({ data }) { mounted++; return React.createElement('span', null, data.value); }
  const columns = [{ id: 'name', dataKey: 'name', label: 'Name', type: 'custom', component: Cell }];
  const render = props => renderToStaticMarkup(React.createElement(DynamicTable, { data, columns, ...props }));
  const html = render({ virtualization: { rowHeight: 40, overscan: 2 }, maxHeight: 200 });
  assert.equal(mounted, 7);
  assert.match(html, /aria-rowcount="2001"/);
  assert.match(html, /aria-rowindex="2"/);
  assert.match(html, /height:200px/);
  assert.match(html, /class="tbl-virtual-spacer" aria-hidden="true" role="presentation"/);
  assert.doesNotMatch(html, /Row 1999/);
  mounted = 0;
  render({ virtualization: false });
  assert.equal(mounted, 2000);
});

test('row styling and accessibility indices use the complete body index', () => {
  let received;
  const row = { id: 'row-15', area: 'body', cells: [], component: [BaseRow, {}], source: { full: { id: 15 } } };
  const [node] = renderRows([row], undefined, { stripedRows: true, startIndex: 15, virtualRowHeight: 48, rowIndexOffset: 2,
    getRowStyle: (_data, index) => { received = index; },
  });
  assert.equal(received, 15);
  assert.equal(node.props.style.backgroundColor, '#f5f7fa');
  assert.equal(node.props['aria-rowindex'], 18);
  assert.equal(node.props['data-virtual-index'], 15);
});

test('selection rows forward virtualization metadata and empty tables keep their state message', () => {
  const columns = [{ id: 'name', dataKey: 'name', label: 'Name' }];
  const html = renderToStaticMarkup(React.createElement(DynamicTable, {
    data: [{ id: 0, name: 'Row 0' }], columns, virtualization: true,
    rows: { header: BaseRow, body: [SelectionRow, { singleSelect: true }], footer: BaseRow },
  }));
  assert.match(html, /data-virtual-row="table-body-0"/);
  assert.match(html, /aria-rowindex="2"/);
  const empty = renderToStaticMarkup(React.createElement(DynamicTable, { data: [], columns, virtualization: true }));
  assert.match(empty, /Nessun dato disponibile/);
  assert.doesNotMatch(empty, /tbl-virtual-spacer/);
});
