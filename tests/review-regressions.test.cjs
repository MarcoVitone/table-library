require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { Table } = require('../src/tables-framework/components/table/table.tsx');
const { useTable } = require('../src/tables-framework/hooks/use-table/use-table.ts');
const { useExport } = require('../src/tables-framework/components/table-parser/hooks/use-export/use-export.ts');
const { usePaginationPersistence } = require('../src/tables-framework/hooks/use-pagination-persistence/use-pagination-persistence.ts');
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

for (const [name, idKey, rows, target] of [
  ['id and _id collisions', 'id', [{ id: 1, _id: 2 }, { id: 2, _id: 3 }], '2'],
  ['explicit _id with conflicting id', '_id', [{ id: 2, _id: 1 }, { id: 1, _id: 2 }], '2'],
  ['custom key', 'uuid', [{ uuid: 'first' }, { uuid: 'second' }], 'second'],
  ['nested key with zero', 'identity.id', [{ identity: { id: 1 } }, { identity: { id: 0 } }], '0'],
  ['literal dotted key', 'identity.id', [{ 'identity.id': 1 }, { 'identity.id': 0 }], '0'],
]) {
  test('editing resolves only the configured identity: ' + name, () => {
    const data = rows.map(row => ({ ...row, profile: { name: 'Before' } }));
    const changes = [];
    function Editor({ data, onCellChange }) {
      if (data.row.source.id === target) onCellChange('After', data);
      return null;
    }
    render(DynamicTable, { data, idKey,
      columns: [{ id: 'name', label: 'Name', dataKey: 'profile.name', type: 'custom', component: Editor }],
      onDataChange: (...args) => changes.push(args) });
    assert.equal(changes.length, 1);
    const [next, updated] = changes[0];
    assert.equal(next[0], data[0]);
    assert.equal(next[1], updated);
    assert.equal(updated.profile.name, 'After');
    assert.deepEqual(data.map(row => row.profile.name), ['Before', 'Before']);
  });
}

for (const value of [null, undefined, '', '   ', 'invalid-date', false, NaN, Infinity]) {
  test('date cells tolerate missing or invalid values: ' + String(value), () => {
    const html = render(DynamicTable, {
      data: [{ id: 1, date: value }, { id: 2, date: '2024-03-01T12:00:00Z' }],
      columns: [{ id: 'date', label: 'Date', type: 'date' }],
    });
    const rows = [...html.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g)][0][1]
      .match(/<tr\b[\s\S]*?<\/tr>/g);
    assert.equal(rows.length, 2);
    assert.doesNotMatch(rows[0].replace(/<[^>]+>/g, ''), /\S/);
    assert.match(rows[1], /01\/03\/2024/);
  });
}
test('timestamp zero keeps its valid date and custom format', () => {
  const html = render(DynamicTable, { data: [{ id: 0, date: 0 }],
    columns: [{ id: 'date', label: 'Date', type: 'date', bodyProps: { format: 'yyyy-MM-dd' } }] });
  assert.match(html, /1970-01-01/);
});

test('before and after share the table API and remain outside its scroll container', () => {
  const seen = [];
  function Controls({ position }) {
    const api = useTable();
    seen.push(api);
    return React.createElement('output', { 'data-position': position }, api.source.body.rows.length);
  }
  const html = render(DynamicTable, {
    data: [{ id: 0, name: 'Anna' }], columns: [{ id: 'name', label: 'Name' }], maxHeight: 100,
    before: React.createElement(Controls, { position: 'before' }),
    after: React.createElement(Controls, { position: 'after' }),
  });
  assert.equal(seen.length, 2);
  assert.equal(seen[0].source, seen[1].source);
  assert.equal(seen[0].setFiltering, seen[1].setFiltering);
  for (const api of seen) {
    assert.equal(typeof api.exportCSV, 'function');
    assert.equal(typeof api.setFiltering, 'function');
    assert.equal(typeof api.setSorting, 'function');
    assert.equal(typeof api.setRowsStatus, 'function');
    assert.equal(api.source.body.rows[0].source.full.name, 'Anna');
  }
  assert.ok(html.indexOf('data-position="before"') < html.indexOf('overflow-x:auto'));
  assert.ok(html.indexOf('</table>') < html.indexOf('data-position="after"'));
});

async function withGlobals(descriptors, run) {
  const previous = new Map(Object.keys(descriptors).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, descriptor] of Object.entries(descriptors)) {
    Object.defineProperty(globalThis, key, { configurable: true, ...descriptor });
  }
  try { return await run(); } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}
function persistence(options = {}) {
  let api;
  function Probe() { api = usePaginationPersistence({ enabled: true, key: 'review', persistPage: true, ...options }); return null; }
  render(Probe);
  return api;
}
for (const storage of ['localStorage', 'sessionStorage']) {
  test('pagination survives blocked access to ' + storage, async () => withGlobals({
    window: { value: {} },
    [storage]: { get() { throw new Error('SecurityError'); } },
  }, () => {
    const api = persistence({ storage });
    assert.equal(api.initialLimit, undefined);
    assert.doesNotThrow(() => api.persistState({ limit: 10, page: 1 }));
    assert.doesNotThrow(() => api.clearState());
    assert.doesNotThrow(() => render(DynamicTable, { data: [{ id: 1, name: 'A' }],
      columns: [{ id: 'name', label: 'Name' }], pagination: { enabled: true, persistence: { enabled: true, key: 'review', storage } } }));
  }));
}
test('pagination survives storage read, write and remove failures', async () => withGlobals({
  window: { value: {} },
  localStorage: { value: {
    getItem() { throw new Error('Read denied'); },
    setItem() { throw new Error('Quota exceeded'); },
    removeItem() { throw new Error('Remove denied'); },
  } },
}, () => {
  const api = persistence();
  assert.equal(api.initialColumnsLayout, undefined);
  assert.doesNotThrow(() => api.persistState({ limit: 10 }));
  assert.doesNotThrow(() => api.clearState());
}));
for (const stored of [
  '{', 'null', '[]', '{"limit":0,"page":-1,"columnsLayout":{}}',
  '{"limit":"10","page":1.5,"columnsLayout":[null]}',
  '{"limit":-1,"page":"2","columnsLayout":[{"id":"a","props":null}]}',
  '{"columnsLayout":[{"id":"a","props":{"isHidden":"false"}}]}',
  '{"columnsLayout":[{"id":"a","props":{"width":{}}}]}',
  '{"columnsLayout":[{"id":"a","props":{"savedWidth":-10}}]}',
  '{"columnsLayout":[{"id":"a","props":{}},{"id":"a","props":{}}]}',
]) {
  test('pagination ignores invalid saved state: ' + stored, async () => {
    let saved = stored;
    await withGlobals({
      window: { value: {} },
      localStorage: { value: { getItem: () => saved, setItem: (_key, value) => { saved = value; } } },
    }, () => {
      const api = persistence();
      assert.equal(api.initialLimit, undefined);
      assert.equal(api.initialPage, undefined);
      assert.equal(api.initialColumnsLayout, undefined);
      assert.doesNotThrow(() => render(DynamicTable, { data: [{ id: 1, name: 'A' }],
        columns: [{ id: 'name', label: 'Name' }], pagination: { enabled: true, persistence: { enabled: true, key: 'review' } } }));
      api.persistState({ limit: 20, page: 2 });
      assert.deepEqual(JSON.parse(saved), { limit: 20, page: 2 });
    });
  });
}
test('valid saved pagination and layout survive updates and respect persistence flags', async () => {
  const layout = [{ id: 'name', props: { isHidden: false, width: '10rem', savedWidth: 120 } }];
  let saved = JSON.stringify({ limit: 5, page: 3, columnsLayout: layout });
  await withGlobals({
    window: { value: {} },
    sessionStorage: { value: { getItem: () => saved, setItem: (_key, value) => { saved = value; }, removeItem: () => { saved = null; } } },
  }, () => {
    const api = persistence({ storage: 'sessionStorage' });
    assert.equal(api.initialLimit, 5);
    assert.equal(api.initialPage, 3);
    assert.deepEqual(api.initialColumnsLayout, layout);
    api.persistState({ limit: 10 });
    assert.deepEqual(JSON.parse(saved), { limit: 10, page: 3, columnsLayout: layout });
    const disabled = persistence({ storage: 'sessionStorage', persistLimit: false, persistPage: false, persistLayout: false });
    assert.equal(disabled.initialLimit, undefined);
    assert.equal(disabled.initialPage, undefined);
    assert.equal(disabled.initialColumnsLayout, undefined);
    disabled.persistState({ limit: 50, page: 8, columnsLayout: [] });
    assert.deepEqual(JSON.parse(saved), { limit: 10, page: 3, columnsLayout: layout });
    api.clearState();
    assert.equal(saved, null);
  });
});

function parseCSV(text, delimiter) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) { row.push(field); field = ''; }
    else if (!quoted && (char === '\r' || char === '\n')) {
      row.push(field); rows.push(row); row = []; field = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else field += char;
  }
  assert.equal(quoted, false, 'CSV has balanced quotes');
  row.push(field); rows.push(row);
  return rows;
}
async function exportText(t, api, simple = false, translation) {
  let blob;
  t.mock.method(URL, 'createObjectURL', value => { blob = value; return 'blob:review'; });
  return withGlobals({ open: { value: () => {} } }, async () => {
    assert.equal(api.exportCSV(simple, translation), true);
    return blob.text();
  });
}
for (const simple of [false, true]) {
  test('CSV preserves separators, quotes, newlines, percent, zero and false; simple=' + simple, async t => {
    let api;
    function Controls() { api = useTable(); return null; }
    const special = 'He said "ciao"; 50%\r\nSecond line\nThird\rfourth';
    render(DynamicTable, {
      data: [{ id: 1, name: 'Rossi, Marco', note: special, amount: 0, active: false, blank: null }],
      columns: ['name', 'note', 'amount', 'active', 'blank'].map(id => ({ id, label: id })),
      before: React.createElement(Controls),
    });
    const csv = await exportText(t, api, simple);
    assert.deepEqual(parseCSV(csv, simple ? ';' : ','), [
      ['name', 'note', 'amount', 'active', 'blank'],
      ['Rossi, Marco', special, '0', 'false', ''],
      ['', '', '', '', ''],
    ]);
  });
}
test('simple CSV omits untitled columns consistently and preserves translations and footer alignment', async t => {
  let api;
  const row = values => ({ cells: values.map(value => ({ value, colSpan: 1 })) });
  function Probe() {
    api = useExport({ source: {
      header: { rows: [row(['', 'Count', 'Enabled', 'Code'])] },
      body: { rows: [row(['skip', 0, false, 'Y'])] },
      footer: { rows: [row(['skip', 0, false, null])] },
    } });
    return null;
  }
  render(Probe);
  const csv = await exportText(t, api, true, key => ({ true: 'Yes', false: 'No; never', yes: 'Y, yes', no: 'N' })[key]);
  assert.deepEqual(parseCSV(csv, ';'), [
    ['Count', 'Enabled', 'Code'], ['0', 'No; never', 'Y, yes'], ['0', 'No; never', ''],
  ]);
});

function findTable(node) {
  if (!React.isValidElement(node)) return undefined;
  if (node.type === Table) return node;
  return React.Children.toArray(node.props.children).map(findTable).find(Boolean);
}
for (const [name, layout, expected] of [
  ['non-leading fixed columns', ['plain', 'a', 'b', 'tail'], { a: '0px', b: '100px' }],
  ['reordered fixed columns', ['b', 'plain', 'a', 'tail'], { b: '0px', a: '150px' }],
  ['hidden fixed column', ['plain', 'a', 'b', 'tail'], { b: '0px' }],
]) {
  test('fixed identity and offsets follow visible layout: ' + name, () => {
    let snapshot;
    function Probe() {
      const [measured, setMeasured] = React.useState(false);
      const columns = ['plain', 'a', 'b', 'tail'].map(id => ({ id, label: id, fixed: id === 'a' || id === 'b' }));
      const tree = DynamicTable({
        data: [{ id: 1 }], columns,
        layout: { columnsLayout: layout.map(id => ({ id, props: { isHidden: name === 'hidden fixed column' && id === 'a' } })) },
      });
      const table = findTable(tree);
      const children = React.Children.toArray(table.props.children);
      if (!measured) {
        for (const column of children) {
          const header = React.Children.toArray(column.props.children)[0];
          header.props.cell[1].measuredRef?.({ getBoundingClientRect: () => ({ width: column.props.id === 'a' ? 100 : 150 }) });
        }
        setMeasured(true);
      } else {
        snapshot = children.map(column => {
          const [header, body] = React.Children.toArray(column.props.children);
          return { id: column.props.id, hidden: column.props.isHidden, header: header.props.cell[1], body: body.props.cell[1] };
        });
      }
      return null;
    }
    render(Probe);
    assert.deepEqual(snapshot.map(column => column.id), layout);
    for (const column of snapshot) {
      for (const props of [column.header, column.body]) {
        assert.equal(props.fixed, column.id === 'a' || column.id === 'b');
        if (!column.hidden) assert.equal(props.stickyLeft, expected[column.id]);
      }
    }
  });
}
