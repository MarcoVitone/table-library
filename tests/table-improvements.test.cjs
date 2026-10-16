require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup, renderToString } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { useTableQuery, normalizeTableQuery } = require('../src/tables-framework/hooks/use-table-query/use-table-query.ts');
const columns = [{ id: 'name', label: 'Name', dataKey: 'name', headerProps: { sortable: true } }];
const data = [{ id: 0, name: 'Zoe' }, { id: 1, name: 'Anna' }];
const render = props => renderToStaticMarkup(React.createElement(DynamicTable, { data, columns, ...props }));

test('headers have column semantics, accessible table name and sorting state', () => {
  const html = render({ tableLabel: 'Customers', layout: { sorting: [{ key: 'name', dir: 'desc', isServerSide: false }] } });
  assert.match(html, /<table[^>]*aria-label="Customers"/);
  assert.match(html, /<th[^>]*scope="col"[^>]*aria-sort="descending"/);
  assert.match(render({}), /aria-sort="none"/);
  assert.doesNotMatch(html.match(/<tbody[\s\S]*?<\/tbody>/)[0], /aria-sort=/);
});

test('loading and error replace stale body data with accessible, valid table rows', () => {
  const loading = render({ isLoading: true, error: 'Failed', onRetry() {} });
  assert.match(loading, /<table[^>]*aria-busy="true"/);
  assert.match(loading, /<tbody><tr class="tbl-state-row"><td colSpan="1"/);
  assert.match(loading, /role="status">Caricamento/);
  assert.doesNotMatch(loading, /Zoe|Anna|Riprova|Failed/);
  const error = render({ error: 'Failed', onRetry() {} });
  assert.match(error, /role="alert">Failed/);
  assert.match(error, />Riprova<\/button>/);
  assert.doesNotMatch(error, /Zoe|Anna|aria-busy="true"/);
});

test('empty and no-results states have independent customizable content', () => {
  assert.match(render({ data: [] }), /Nessun dato disponibile/);
  const noResults = render({ layout: { filtering: [{ key: 'name', op: 'match', val: 'absent' }] } });
  assert.match(noResults, /Nessun risultato per i filtri applicati/);
  assert.doesNotMatch(noResults, /Nessun dato disponibile/);
  assert.match(render({ isLoading: true, loadingContent: 'Please wait' }), /Please wait/);
  assert.match(render({ data: [], emptyContent: 'No customers' }), /No customers/);
  assert.match(render({ data: [], noResultsContent: 'No matches', layout: { filtering: [{ key: 'name', op: 'match', val: 'x' }] } }), /No matches/);
  assert.match(render({ data: [], empty: React.createElement('tbody', null, React.createElement('tr', null, React.createElement('td', null, 'Legacy empty'))) }), /Legacy empty/);
});

test('server mode does not filter, reorder or slice the supplied server page', () => {
  const html = render({ dataMode: 'server', totalItems: 50,
    query: { page: 3, pageSize: 2, sorting: [{ key: 'name', dir: 'asc', isServerSide: false }], filters: [{ key: 'name', op: 'match', val: 'absent' }] },
    pagination: { enabled: true, limitOptions: [2] },
  });
  const body = html.match(/<tbody[\s\S]*?<\/tbody>/)[0];
  assert.ok(body.indexOf('Zoe') < body.indexOf('Anna'));
  assert.match(body, /Zoe/);
  assert.match(body, /Anna/);
  assert.match(html, /50/);
});

test('unified client query applies filtering and sorting before pagination', () => {
  const html = render({ query: { page: 1, pageSize: 1,
    sorting: [{ key: 'name', dir: 'asc', isServerSide: false }], filters: [] },
    pagination: { enabled: true, limitOptions: [1] },
  });
  const body = html.match(/<tbody[\s\S]*?<\/tbody>/)[0];
  assert.match(body, /Zoe/);
  assert.doesNotMatch(body, /Anna/);
});

test('query changes reset the page atomically, omit no-op notifications and preserve unrelated fields', () => {
  let api;
  const changes = [];
  const filters = [{ key: 'name', op: 'match', val: 'a' }];
  function Probe() {
    const [step, setStep] = React.useState(0);
    api = useTableQuery({ defaultQuery: { page: 4, pageSize: 2 }, onQueryChange: next => changes.push(next) });
    if (step === 0) { api.updateQuery({ filters }); setStep(1); }
    else if (step === 1) { api.updateQuery({ filters }); api.updateQuery({ page: 2 }); setStep(2); }
    else if (step === 2) { api.updateQuery({ pageSize: 5 }); setStep(3); }
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(changes.length, 3);
  assert.equal(changes[0].page, 0);
  assert.equal(changes[1].page, 2);
  assert.deepEqual(changes[2], { page: 0, pageSize: 5, sorting: [], filters });
  assert.deepEqual(api.query, changes[2]);
});

test('controlled queries notify the owner and follow external changes', () => {
  let api;
  const initial = { page: 2, pageSize: 2, sorting: [], filters: [] };
  const changes = [];
  function Probe() {
    const [query, setQuery] = React.useState(initial);
    const [step, setStep] = React.useState(0);
    api = useTableQuery({ query, onQueryChange: next => changes.push(next) });
    if (step === 0) { api.updateQuery({ page: 3 }); setStep(1); }
    else if (step === 1) { assert.equal(api.query.page, 2); setQuery(changes[0]); setStep(2); }
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(api.query.page, 3);
  assert.equal(changes.length, 1);
  assert.deepEqual(normalizeTableQuery({ page: -4, pageSize: 0 }), { page: 0, pageSize: 1, sorting: [], filters: [] });
});

test('uncontrolled unified query restores saved pagination', () => {
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  globalThis.window = {};
  globalThis.localStorage = { getItem: () => JSON.stringify({ page: 1, limit: 1 }) };
  try {
    const html = render({ defaultQuery: {}, pagination: { enabled: true, limitOptions: [1],
      persistence: { enabled: true, key: 'test-query', persistPage: true } } });
    const body = html.match(/<tbody[\s\S]*?<\/tbody>/)[0];
    assert.match(body, /Anna/);
    assert.doesNotMatch(body, /Zoe/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
});
