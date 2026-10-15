require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { useLayout } = require('../src/tables-framework/components/table-parser/hooks/use-layout/use-layout.ts');
const { useTable } = require('../src/tables-framework/hooks/use-table/use-table.ts');
const { TableContext } = require('../src/tables-framework/components/table-renderer/table-renderer.tsx');
const { MOCK_USERS } = require('../src/demo/mock-data.ts');
const demos = [
  ['basic', 'BasicTable'], ['pagination', 'PaginationTable'], ['sorting-filtering', 'SortingFilteringTable'],
  ['custom-cells', 'CustomCellsTable'], ['selection', 'SelectionTable'], ['draggable', 'DraggableTable'],
  ['resizable', 'ResizableTable'], ['collapsible', 'CollapsibleTable'], ['column-config', 'ColumnConfigTable'],
];
const plain = value => JSON.parse(JSON.stringify(value));
function render(Component, props = {}) { return renderToStaticMarkup(React.createElement(Component, props)); }
function bodyRows(html) {
  const body = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
  return body ? [...body[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(match => match[1]) : [];
}
for (const [folder, name] of demos) {
  test('real React rendering: ' + name, () => {
    const Component = require('../src/demo/features/' + folder + '/' + name + '.tsx')[name];
    const html = render(Component);
    assert.match(html, /<table\b/);
    assert.ok(bodyRows(html).length > 0);
    if (name === 'BasicTable') assert.equal(bodyRows(html).length, MOCK_USERS.length);
  });
}
const columns = [{ id: 'name', label: 'Name', dataKey: 'name', type: 'text' }];
const rows = [
  { id: 0, name: 'Marco Z', amount: 0 },
  { id: 1, name: 'Anna', amount: -1 },
  { id: 2, name: 'Marco A', amount: 1 },
];
test('DynamicTable applies filtering and global sorting before a one-row page', () => {
  const html = render(DynamicTable, {
    data: rows, columns, pagination: { enabled: true, limit: 1, limitOptions: [1, 2] },
    layout: { filtering: [{ key: 'name', op: 'match', val: 'MARCO' }], sorting: [{ key: 'name', dir: 'asc', isServerSide: false }] },
  });
  const body = bodyRows(html);
  assert.equal(body.length, 1);
  assert.match(body[0], /Marco A/);
  assert.doesNotMatch(body[0], /Marco Z/);
});
test('DynamicTable renders the requested controlled page', () => {
  const html = render(DynamicTable, {
    data: rows, columns, pagination: { enabled: true, controlled: { page: 1, limit: 1, onPageChange() {}, onLimitChange() {} }, limitOptions: [1] },
  });
  assert.equal(bodyRows(html).length, 1);
  assert.match(bodyRows(html)[0], /Anna/);
});
test('server-side mode does not slice the supplied page a second time', () => {
  const html = render(DynamicTable, {
    data: [rows[2]], columns,
    pagination: { enabled: true, serverSide: { enabled: true, totalItems: 30 }, controlled: { page: 2, limit: 10, onPageChange() {}, onLimitChange() {} } },
  });
  assert.equal(bodyRows(html).length, 1);
  assert.match(bodyRows(html)[0], /Marco A/);
  assert.match(html, /30/);
});
test('empty table renders without failing', () => {
  const html = render(DynamicTable, { data: [], columns });
  assert.match(html, /class="tbl-state-row"/);
  assert.match(html, /Nessun dato disponibile/);
  assert.doesNotMatch(html.match(/<tbody[\s\S]*?<\/tbody>/)[0], /class="tbl-row"/);
});
test('nested input cells render their current value with ID zero', () => {
  const html = render(DynamicTable, { data: [{ id: 0, profile: { name: 'Nested' } }], columns: [{ id: 'name', label: 'Name', dataKey: 'profile.name', type: 'input' }] });
  assert.match(html, /value="Nested"/);
});
test('custom editing callback updates a nested numeric-ID row through the full component pipeline', () => {
  const data = [{ id: 0, profile: { name: 'Before' } }];
  const changes = [];
  function Editor({ data, onCellChange }) { onCellChange('After', data); return React.createElement('span', null, data.value); }
  render(DynamicTable, {
    data, columns: [{ id: 'name', label: 'Name', dataKey: 'profile.name', type: 'custom', component: Editor }],
    onDataChange: (...args) => changes.push(args),
  });
  assert.equal(changes.length, 1);
  assert.equal(changes[0][1].profile.name, 'After');
  assert.equal(changes[0][1].id, 0);
  assert.equal(changes[0][0][0], changes[0][1]);
  assert.equal(data[0].profile.name, 'Before');
});
const layoutColumns = [{ id: 'name', props: {} }, { id: 'amount', props: {} }];
const sorting = [{ key: 'name', dir: 'asc', isServerSide: false }];
const filtering = [{ key: 'name', op: 'match', val: 'marco' }];
const pagination = { limit: 10, offset: 20 };
for (const [name, changedColumns] of [
  ['resize', [{ id: 'name', props: { width: 200 } }, layoutColumns[1]]],
  ['hide', [{ id: 'name', props: { isHidden: true } }, layoutColumns[1]]],
  ['reorder', [layoutColumns[1], layoutColumns[0]]],
]) {
  test('real React hook state preserves query state after column ' + name, () => {
    let result;
    function Probe() {
      const [step, setStep] = React.useState(0);
      const api = useLayout({ externalLayout: { columnsLayout: step < 2 ? layoutColumns : changedColumns }, parsedColumns: [{ id: 'name' }, { id: 'amount' }] });
      if (step === 0) { api.setSorting(sorting); api.setFiltering(filtering); api.setPagination(pagination); setStep(1); }
      else if (step === 1) { api.setColumnsLayout(changedColumns); setStep(2); }
      else result = api;
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.deepEqual(plain(result.sorting), sorting);
    assert.deepEqual(plain(result.filtering), filtering);
    assert.deepEqual(plain(result.pagination), pagination);
    assert.deepEqual(plain(result.columnsLayout), changedColumns);
  });
}
test('selection API can select and clear a row with source ID zero', () => {
  const source = { body: { rows: [{ id: 'table-body-0', source: { id: '0', full: { id: 0 } } }] } };
  let status = { 'table-body-0': { isSelected: false } };
  let api;
  function Probe() { api = useTable(); return null; }
  function mount() {
    renderToString(React.createElement(TableContext.Provider, { value: { source, rowsStatus: status, setRowsStatus: updater => { status = updater(status); } } }, React.createElement(Probe)));
  }
  mount(); api.selectAllRows(); mount();
  assert.equal(api.selectedRows[0].source.full.id, 0);
  api.clearSelectedRows(); mount();
  assert.equal(api.selectedRows.length, 0);
});

const { InputCell } = require('../src/tables-framework/components/cells/input-cell/input-cell.tsx');
const { AutocompleteCell } = require('../src/tables-framework/components/cells/autocomplete-cell.tsx/autocomplete-cell.tsx');
function innerControl(node) {
  if (!React.isValidElement(node)) return undefined;
  if ('value' in node.props && typeof node.props.onChange === 'function') return node;
  for (const child of React.Children.toArray(node.props.children)) {
    const control = innerControl(child);
    if (control) return control;
  }
}
test('input cell reflects externally updated data', () => {
  let displayed;
  function Probe() {
    const [step, setStep] = React.useState(0);
    const cell = InputCell({ data: { value: step ? 'After' : 'Before' } });
    displayed = innerControl(cell).props.value;
    if (!step) setStep(1);
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(displayed, 'After');
});
test('numeric input commits a number instead of a string', () => {
  const changes = [];
  const cellData = { value: 1 };
  function Probe() {
    const [step, setStep] = React.useState(0);
    const input = innerControl(InputCell({ data: cellData, inputType: 'number', onCellChange: value => changes.push(value) }));
    if (!step) { input.props.onChange({ target: { value: '2.5' } }); setStep(1); }
    else input.props.onBlur();
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.deepEqual(changes, [2.5]);
});
test('autocomplete cell reflects externally updated data', () => {
  let displayed;
  function Probe() {
    const [step, setStep] = React.useState(0);
    const cell = AutocompleteCell({ data: { value: step ? 'After' : 'Before' } });
    displayed = innerControl(cell).props.value;
    if (!step) setStep(1);
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(displayed, 'After');
});

for (const [name, inputType, value, expected] of [
  ['numeric zero', 'number', '0', [0]],
  ['negative number', 'number', '-12', [-12]],
  ['empty numeric field', 'number', '', ['']],
  ['unchanged numeric value', 'number', '1', []],
  ['text preserving its type', 'text', '2.5', ['2.5']],
  ['non-finite numeric value', 'number', '1e309', []],
]) {
  test('input cell commit: ' + name, () => {
    const changes = [];
    const cellData = { value: 1 };
    function Probe() {
      const [step, setStep] = React.useState(0);
      const input = innerControl(InputCell({ data: cellData, inputType, onCellChange: val => changes.push(val) }));
      if (!step) { input.props.onChange({ target: { value } }); setStep(1); }
      else input.props.onBlur();
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.deepEqual(changes, expected);
  });
}
for (const nextValue of ['Chosen', null]) {
  test('autocomplete retains a local change before new data arrives: ' + nextValue, () => {
    const changes = [];
    let displayed;
    function Probe() {
      const [step, setStep] = React.useState(0);
      const control = innerControl(AutocompleteCell({ data: { value: 'Before' }, onCellChange: value => changes.push(value) }));
      displayed = control.props.value;
      if (!step) { control.props.onChange({}, nextValue); setStep(1); }
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.equal(displayed, nextValue);
    assert.deepEqual(changes, [nextValue]);
  });
}
