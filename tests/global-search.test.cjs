require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup, renderToString } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { createSearchAccessor, normalizeSearch, matchesGlobalSearch } = require('../src/tables-framework/utils/global-search/global-search.ts');
const { useTableQuery } = require('../src/tables-framework/hooks/use-table-query/use-table-query.ts');
const columns = [{ id: 'name', label: 'Name' }, { id: 'city', dataKey: 'address.city', label: 'City' }];
const data = [
  { id: 1, name: 'José Rossi', address: { city: 'Roma' }, secret: 'private' },
  { id: 2, name: 'Anna', address: { city: 'Roma' } },
  { id: 3, name: 'Zoe', address: { city: 'Milano' } },
];
const render = props => renderToStaticMarkup(React.createElement(DynamicTable, { data, columns, ...props }));
const body = html => html.match(/<tbody[\s\S]*?<\/tbody>/)[0];

test('global search supports accents, whitespace and words across multiple nested columns', () => {
  const html = render({ globalSearch: { defaultValue: ' JOSE   roma ' } });
  assert.match(body(html), /José Rossi/);
  assert.doesNotMatch(body(html), /Anna|Zoe/);
  assert.match(html, /type="search"/);
});

test('searches only configured data columns and supports explicit restrictions', () => {
  assert.match(render({ globalSearch: { defaultValue: 'private' } }), /Nessun risultato/);
  assert.match(render({ globalSearch: { columns: ['name'], defaultValue: 'Roma' } }), /Nessun risultato/);
  assert.match(body(render({ globalSearch: { columns: ['secret'], defaultValue: 'private' } })), /José/);
});

test('zero, false, arrays and nested objects are searchable; nulls and React internals are not', () => {
  const circular = { label: 'Ready' }; circular.self = circular;
  const read = createSearchAccessor(['zero', 'flag', 'items[0].name', 'status', 'empty', 'jsx']);
  const values = read({ zero: 0, flag: false, items: [{ name: 'Array' }], status: circular, empty: null,
    jsx: React.createElement('span', { title: 'Secret' }, 'Hidden') });
  for (const word of ['0', 'false', 'array', 'ready']) assert.equal(matchesGlobalSearch(values, [word]), true);
  for (const word of ['null', 'undefined', 'secret', 'hidden', '[object object]']) assert.equal(matchesGlobalSearch(values, [word]), false);
  assert.equal(normalizeSearch('CITTÀ'), 'citta');
});

test('search intersects column filters before sorting, counting and pagination', () => {
  const html = render({ globalSearch: true, data: [...data, { id: 4, name: 'Bruno', address: { city: 'Roma' } }],
    query: { page: 1, pageSize: 1, search: 'roma', sorting: [{ key: 'name', dir: 'asc', isServerSide: false }],
      filters: [{ key: 'name', op: 'ne', val: 'Anna' }] }, pagination: { enabled: true, limitOptions: [1] } });
  assert.match(body(html), /José/);
  assert.doesNotMatch(body(html), /Bruno|Anna|Zoe/);
});

test('controlled standalone search and query search take precedence over defaults', () => {
  assert.match(body(render({ globalSearch: { value: 'Anna', defaultValue: 'Zoe' } })), /Anna/);
  const html = render({ globalSearch: { value: 'Anna' }, query: { page: 0, pageSize: 25, search: 'Zoe', sorting: [], filters: [] } });
  assert.match(body(html), /Zoe/);
  assert.doesNotMatch(body(html), /Anna/);
  assert.match(html, /value="Zoe"/);
});

test('blank search restores rows, while active search uses the customizable no-results state', () => {
  assert.match(body(render({ globalSearch: { defaultValue: '  ' } })), /Anna/);
  assert.match(render({ globalSearch: { defaultValue: 'absent' }, noResultsContent: 'No matches' }), /No matches/);
  assert.match(render({ data: [], globalSearch: true }), /Nessun dato disponibile/);
});

test('server query search never filters the supplied page locally', () => {
  const html = render({ dataMode: 'server', globalSearch: true,
    query: { page: 5, pageSize: 1, search: 'absent', sorting: [], filters: [] } });
  assert.match(body(html), /José/);
  assert.match(body(html), /Anna/);
  assert.match(body(html), /Zoe/);
});

test('changing search resets the page once and preserves search through other query updates', () => {
  let api; const changes = [];
  function Probe() {
    const [step, setStep] = React.useState(0);
    api = useTableQuery({ defaultQuery: { page: 4 }, onQueryChange: next => changes.push(next) });
    if (step === 0) { api.updateQuery({ search: 'Roma' }); setStep(1); }
    else if (step === 1) { api.updateQuery({ search: 'Roma' }); api.updateQuery({ page: 2 }); setStep(2); }
    else if (step === 2) { api.updateQuery({ filters: [{ key: 'name', op: 'eq', val: 'Anna' }] }); setStep(3); }
    return null;
  }
  renderToString(React.createElement(Probe));
  assert.equal(changes.length, 3);
  assert.equal(changes[0].page, 0);
  assert.equal(changes[1].page, 2);
  assert.equal(changes[2].search, 'Roma');
  assert.equal(changes[2].page, 0);
});
