require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup, renderToString } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { useSavedViews } = require('../src/tables-framework/hooks/use-saved-views/use-saved-views.ts');
const { useTableQuery } = require('../src/tables-framework/hooks/use-table-query/use-table-query.ts');
const { useLayout } = require('../src/tables-framework/components/table-parser/hooks/use-layout/use-layout.ts');
const { serializeSavedViews, parseSavedViews, cloneTableViewState, reconcileTableViewState, tableViewSignature } = require('../src/tables-framework/utils/saved-views/saved-views.ts');

const state = () => ({ columnsLayout: [
  { id: 'name', props: { isHidden: false, width: 220 } },
  { id: 'amount', props: { isHidden: true, width: '0px', savedWidth: 180 } },
], sorting: [{ key: 'name', dir: 'desc', isServerSide: false }],
  filters: [{ key: 'name', op: 'regexp', val: /marco/iu }, { key: 'amount', op: 'in', val: [0, false, 'x'] }],
  search: 'Roma', pageSize: 25 });
const view = () => ({ id: 'v1', name: 'Roma', state: state() });

test('saved views round-trip full layout, typed filters and regular expressions', () => {
  const restored = parseSavedViews(serializeSavedViews([view()]));
  assert.deepEqual(restored, [view()]);
  assert.equal(restored[0].state.filters[0].val.test('MARCO'), true);
  assert.equal(restored[0].state.columnsLayout[1].props.savedWidth, 180);
});

test('saved view snapshots do not share mutable filters or column props', () => {
  const original = state(); const copied = cloneTableViewState(original);
  original.columnsLayout[0].props.width = 900;
  original.filters[1].val.push('new');
  assert.equal(copied.columnsLayout[0].props.width, 220);
  assert.deepEqual(copied.filters[1].val, [0, false, 'x']);
  assert.notEqual(original.filters[0].val, copied.filters[0].val);
});

test('saved view reconciliation drops removed fields and appends new columns without mutating storage', () => {
  const original = state();
  const next = reconcileTableViewState(original, [{ id: 'name' }, { id: 'city', dataKey: 'address.city' }]);
  assert.deepEqual(next.columnsLayout.map(column => column.id), ['name', 'city']);
  assert.equal(next.filters.length, 1);
  assert.equal(next.sorting.length, 1);
  next.columnsLayout[0].props.width = 100;
  assert.equal(original.columnsLayout[0].props.width, 220);
  const server = reconcileTableViewState({ ...state(), sorting: [{ key: 'server_name', dir: 'asc', isServerSide: true }] },
    [{ id: 'name', queryParam: 'server_name' }]);
  assert.equal(server.sorting[0].key, 'server_name');
});

test('canonical view signatures ignore missing defaults and track actual changes including regex', () => {
  const a = { columnsLayout: [{ id: 'name', props: {} }], sorting: [], filters: [], pageSize: 25 };
  const b = { ...a, search: '', columnsLayout: [{ id: 'name', props: { isHidden: false, width: null } }] };
  assert.equal(tableViewSignature(a), tableViewSignature(b));
  assert.notEqual(tableViewSignature(a), tableViewSignature({ ...b, pageSize: 50 }));
  assert.notEqual(tableViewSignature({ ...a, filters: [{ key: 'name', op: 'regexp', val: /a/i }] }),
    tableViewSignature({ ...a, filters: [{ key: 'name', op: 'regexp', val: /b/i }] }));
});

test('applying a different regular-expression filter updates the unified query and resets its page', () => {
  let api; const changes = [];
  function Probe() {
    const [step, setStep] = React.useState(0);
    api = useTableQuery({ defaultQuery: { page: 3, filters: [{ key: 'name', op: 'regexp', val: /anna/i }] },
      onQueryChange: next => changes.push(next) });
    if (!step) { api.updateQuery({ filters: [{ key: 'name', op: 'regexp', val: /marco/i }] }); setStep(1); }
    else if (step === 1) { api.updateQuery({ filters: [{ key: 'name', op: 'regexp', val: /marco/i }] }); setStep(2); }
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(changes.length, 1);
  assert.equal(api.query.page, 0);
  assert.equal(api.query.filters[0].val.source, 'marco');
});

test('external view changes synchronize regular-expression filters through the legacy layout hook', () => {
  let api;
  function Probe() {
    const [step, setStep] = React.useState(0);
    api = useLayout({ parsedColumns: [{ id: 'name' }], externalLayout: {
      filtering: [{ key: 'name', op: 'regexp', val: step ? /marco/i : /anna/i }],
    } });
    if (!step) setStep(1);
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(api.filtering[0].val.source, 'marco');
});

for (const invalid of [
  '{', 'null', JSON.stringify({ version: 99, views: [] }),
  JSON.stringify({ version: 1, views: [{ ...view(), state: { ...state(), pageSize: 0 } }] }),
  JSON.stringify({ version: 1, views: [{ ...view(), state: { ...state(), filters: [{ key: 'name', op: 'invalid', val: 'x' }] } }] }),
  serializeSavedViews([view(), view()]),
]) {
  test('rejects invalid or incompatible saved view storage: ' + invalid.slice(0, 45), () => {
    assert.throws(() => parseSavedViews(invalid));
  });
}

function withStorage(storage, run) {
  const previous = globalThis.window;
  globalThis.window = { localStorage: storage, sessionStorage: storage };
  try { run(); } finally {
    if (previous === undefined) delete globalThis.window; else globalThis.window = previous;
  }
}

test('saved views hook loads and writes a namespaced list without touching legacy pagination', () => {
  const map = new Map([['table_views_customers', serializeSavedViews([view()])], ['pagination_customers', 'legacy']]);
  const calls = [];
  withStorage({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }, () => {
    let api;
    function Probe() {
      const [step, setStep] = React.useState(0);
      api = useSavedViews({ key: 'customers', onViewsChange: next => calls.push(next) });
      if (!step) { assert.equal(api.views.length, 1); api.changeViews([]); setStep(1); }
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.deepEqual(api.views, []);
    assert.deepEqual(parseSavedViews(map.get('table_views_customers')), []);
    assert.equal(map.get('pagination_customers'), 'legacy');
    assert.equal(calls.length, 1);
  });
});

test('unavailable storage falls back to in-memory views and reports the failed persistence', () => {
  const storage = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); } };
  withStorage(storage, () => {
    let api;
    function Probe() {
      const [step, setStep] = React.useState(0);
      api = useSavedViews({ key: 'blocked' });
      if (!step) { assert.match(api.error, /leggere/); api.changeViews([view()]); setStep(1); }
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.equal(api.views.length, 1);
    assert.match(api.error, /memoria/);
  });
});

test('controlled saved lists notify the owner and never write browser storage', () => {
  const calls = [];
  withStorage({ getItem() { throw new Error('Unexpected read'); }, setItem() { throw new Error('Unexpected write'); } }, () => {
    let api;
    function Probe() {
      const [step, setStep] = React.useState(0);
      api = useSavedViews({ key: 'controlled', views: [], onViewsChange: next => calls.push(next) });
      if (!step) { api.changeViews([view()]); setStep(1); }
      return null;
    }
    renderToString(React.createElement(Probe));
    assert.equal(api.views.length, 0);
    assert.equal(calls.length, 1);
    assert.equal(api.error, '');
  });
});

const data = [{ id: 0, name: 'Marco', locked: false }, { id: 1, name: 'Anna', locked: true }];
const columns = [{ id: 'selection', label: 'Select', type: 'checkbox' }, { id: 'name', label: 'Name' }];
const render = props => renderToStaticMarkup(React.createElement(DynamicTable, { data, columns, ...props }));

test('bulk toolbar is opt-in, hidden without selection, and receives current typed records including ID zero', () => {
  const checks = [];
  const bulkActions = [{ id: 'archive', label: 'Archive', onAction() {}, disabled: rows => { checks.push(rows); return rows.some(row => row.locked); } }];
  assert.doesNotMatch(render({ bulkActions }), /Azioni sulle righe selezionate/);
  assert.doesNotMatch(render({ rowStatusMapper: () => ({ isSelected: true }) }), /Azioni sulle righe selezionate/);
  const html = render({ rowStatusMapper: () => ({ isSelected: true }), bulkActions });
  assert.match(html, /role="toolbar" aria-label="Azioni sulle righe selezionate"/);
  assert.match(html, /2 righe selezionate/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Archive<\/button>/);
  assert.deepEqual(checks[0], data);
});

test('bulk actions are disabled while loading or showing an error', () => {
  for (const status of [{ isLoading: true }, { error: 'Failed' }]) {
    const html = render({ ...status, rowStatusMapper: () => ({ isSelected: true }),
      bulkActions: [{ id: 'edit', label: 'Edit', onAction() {} }] });
    assert.match(html, /<button[^>]*disabled=""[^>]*>Edit<\/button>/);
  }
});

test('saved view controls render safely without browser storage or rows', () => {
  const html = render({ data: [], savedViews: { key: 'ssr', defaultViews: [view()] } });
  assert.match(html, /Gestione viste salvate/);
  assert.match(html, /<option value="v1">Roma/);
  assert.match(html, /Nessun dato disponibile/);
});
