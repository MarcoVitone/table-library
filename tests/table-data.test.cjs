const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

// Exercise the actual TypeScript data transformations without a browser or React renderer.
// Memoization is bypassed; component rendering and TypeScript type checking are separate checks.
const root = path.resolve(__dirname, '..');
function load(file, name, dependencies = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = stripTypeScriptTypes(source)
    .replace(/^import\s[\s\S]*?\sfrom\s*["'][^"']+["'];?\s*$/gm, '')
    .replace(/^export\s*\{[^}]*\};?\s*$/gm, '')
    .replace(/^export\s+/gm, '');
  return vm.runInNewContext(code + ';' + name, { console, ...dependencies });
}
const utils = 'src/tables-framework/utils/';
const serialize = load(utils + 'string-utils/serialize/serialize.ts', 'serialize');
const getEntries = load(utils + 'object-utils/get-entries/get-entries.ts', 'getEntries');
const forEach = load(utils + 'object-utils/for-each/for-each.ts', 'forEach', { getEntries });
const flatten = load(utils + 'object-utils/flatten/flatten.ts', 'flatten', { forEach });
const parseToken = load(utils + 'object-utils/parse-token/parse-token.ts', 'parseToken');
const setValueAtPath = load(utils + 'object-utils/set-value-at-path/set-value-at-path.ts', 'setValueAtPath', { parseToken });
const multiSorter = load(utils + 'filter-utils/multi-sorter/multi-sorter.ts', 'multiSorter');
const warnings = [];
const useData = load('src/tables-framework/components/table-parser/hooks/use-data/use-data.ts', 'useData', {
  useMemo: fn => fn(), ObjectUtils: { flatten, parseToken },
  StringUtils: { serialize }, FilterUtils: { multiSorter },
  console: { warn: message => warnings.push(message) },
});
function processData(data, { filtering = [], sorting = [], pagination, idKey = 'id', dataKey = 'name' } = {}) {
  return useData({ data, columns: [{ dataKey }], tableLayout: { filtering, sorting }, pagination, idKey });
}
const ids = result => Array.from(result.columns[0].data, cell => cell.source.id);
const values = result => Array.from(result.columns[0].data, cell => cell.value);
const plain = value => JSON.parse(JSON.stringify(value));
const sortBy = (dir = 'asc', key = 'value') => [{ key, dir, isServerSide: false }];
function edit(data, rowId, colKey, newValue, enabled = true) {
  const source = fs.readFileSync(path.join(root, 'src/tables-framework/components/dynamic-table/dynamic-table.tsx'), 'utf8');
  const start = source.indexOf('  const handleCellChange = useCallback(');
  const end = source.indexOf('  const measureColumn', start);
  assert.ok(start >= 0 && end > start);
  const code = stripTypeScriptTypes(source.slice(start, end));
  const calls = [];
  const handler = vm.runInNewContext(code + ';handleCellChange', {
    useCallback: fn => fn, data, setValueAtPath,
    onDataChange: enabled ? (...args) => calls.push(args) : undefined,
  });
  handler(rowId, colKey, newValue);
  return calls;
}

for (const query of ['marco', 'Marco', 'MARCO', 'mArCo']) {
  test('text search ignores case: ' + query, () => {
    const result = processData([{ id: 1, name: 'Marco' }, { id: 2, name: 'MARCO Rossi' }, { id: 3, name: 'Anna' }], {
      filtering: [{ key: 'name', op: 'match', val: query }],
    });
    assert.deepEqual(ids(result), ['1', '2']);
  });
}
test('partial text search ignores case', () => {
  const result = processData([{ id: 1, name: 'Marco' }], { filtering: [{ key: 'name', op: 'match', val: 'ARC' }] });
  assert.deepEqual(ids(result), ['1']);
});
test('text search still excludes nonmatching values', () => {
  assert.equal(processData([{ id: 1, name: 'Marco' }], { filtering: [{ key: 'name', op: 'match', val: 'anna' }] }).totalItems, 0);
});
test('text filtering and global sorting happen before pagination', () => {
  const result = processData([{ id: 1, name: 'Marco Z' }, { id: 2, name: 'Anna' }, { id: 3, name: 'Marco A' }], {
    filtering: [{ key: 'name', op: 'match', val: 'MARCO' }], sorting: sortBy('asc', 'name'), pagination: { limit: 1, offset: 0 },
  });
  assert.deepEqual(values(result), ['Marco A']);
  assert.equal(result.totalItems, 2);
});

for (const [dir, expected] of [['asc', [-1, 0, 1]], ['desc', [1, 0, -1]]]) {
  test('zero sorts numerically in ' + dir + ' order', () => {
    const rows = [{ value: 0 }, { value: -1 }, { value: 1 }];
    assert.deepEqual(rows.sort(multiSorter(sortBy(dir))).map(row => row.value), expected);
  });
}
test('false sorts before true in ascending order', () => {
  assert.deepEqual([{ value: true }, { value: false }].sort(multiSorter(sortBy())).map(row => row.value), [false, true]);
});
test('false sorts after true in descending order', () => {
  assert.deepEqual([{ value: false }, { value: true }].sort(multiSorter(sortBy('desc'))).map(row => row.value), [true, false]);
});
for (const dir of ['asc', 'desc']) {
  test('null and undefined stay last in ' + dir + ' order', () => {
    const rows = [{ value: null }, { value: 0 }, {}, { value: 1 }].sort(multiSorter(sortBy(dir)));
    assert.deepEqual(rows.slice(0, 2).map(row => row.value), dir === 'asc' ? [0, 1] : [1, 0]);
    assert.ok(rows.slice(2).every(row => row.value == null));
  });
}
test('equal zero values use the next sort column', () => {
  const rows = [{ value: 0, order: 2 }, { value: 0, order: 1 }];
  assert.deepEqual(rows.sort(multiSorter([...sortBy(), ...sortBy('asc', 'order')])).map(row => row.order), [1, 2]);
});
test('equal missing values use the next sort column', () => {
  const rows = [{ value: null, order: 2 }, { order: 1 }];
  assert.deepEqual(rows.sort(multiSorter([...sortBy(), ...sortBy('asc', 'order')])).map(row => row.order), [1, 2]);
});
test('epoch date sorts as zero rather than a missing value', () => {
  const rows = [{ value: '1970-01-01T00:00:00Z' }, { value: '1969-12-31T00:00:00Z' }, { value: '1970-01-02T00:00:00Z' }];
  assert.deepEqual(rows.sort(multiSorter(sortBy())).map(row => row.value), ['1969-12-31T00:00:00Z', '1970-01-01T00:00:00Z', '1970-01-02T00:00:00Z']);
});
test('multiSorter selector remains supported', () => {
  const rows = [{ nested: { value: 1 } }, { nested: { value: 0 } }];
  assert.deepEqual(rows.sort(multiSorter(sortBy(), row => row.nested)).map(row => row.nested.value), [0, 1]);
});

test('numeric ID zero remains distinct from other rows', () => {
  const warningCount = warnings.length;
  assert.deepEqual(ids(processData([{ id: 0, name: 'Zero' }, { id: 1, name: 'One' }])), ['0', '1']);
  assert.equal(warnings.length, warningCount);
});
test('custom idKey supports zero', () => {
  assert.deepEqual(ids(processData([{ _id: 0, name: 'Zero' }], { idKey: '_id' })), ['0']);
});
test('nested idKey supports zero', () => {
  assert.deepEqual(ids(processData([{ identity: { id: 0 }, name: 'Zero' }], { idKey: 'identity.id' })), ['0']);
});
test('null and absent IDs are still reported as missing', () => {
  const warningCount = warnings.length;
  assert.deepEqual(ids(processData([{ id: null, name: 'A' }, { name: 'B' }])), ['void', 'void']);
  assert.equal(warnings.length - warningCount, 2);
});
test('string and other numeric IDs remain supported', () => {
  assert.deepEqual(ids(processData([{ id: 'abc' }, { id: -2 }, { id: 2.5 }])), ['abc', '-2', '2.5']);
});
test('zero ID creates a distinct body row and cell ID', () => {
  const useBody = load('src/tables-framework/components/table-parser/hooks/use-body/use-body.ts', 'useBody', { useMemo: fn => fn() });
  const result = processData([{ id: 0, name: 'Zero' }, { id: 1, name: 'One' }]);
  result.columns[0].id = 'name';
  result.columns[0].cells = { body: null };
  const body = useBody({ columns: result.columns, cell: null, row: null });
  assert.deepEqual(Array.from(body.rows, row => row.id), ['table-body-0', 'table-body-1']);
  assert.equal(body.rows[0].cells[0].id, 'table-body-0-name');
});

test('nested editing changes the nested field instead of creating a literal key', () => {
  const original = { id: 1, profile: { name: 'Before', age: 30 } };
  const [[rows, updated]] = edit([original], '1', 'profile.name', 'After');
  assert.equal(updated.profile.name, 'After');
  assert.equal(updated.profile.age, 30);
  assert.equal(Object.hasOwn(updated, 'profile.name'), false);
  assert.equal(rows[0], updated);
  assert.equal(original.profile.name, 'Before');
});
test('nested editing copies only the changed branch', () => {
  const sibling = Object.freeze({ city: 'Rome' });
  const original = Object.freeze({ id: 1, profile: Object.freeze({ name: 'Before', sibling }), unrelated: sibling });
  const other = Object.freeze({ id: 2 });
  const data = Object.freeze([original, other]);
  const [[rows, updated]] = edit(data, '1', 'profile.name', 'After');
  assert.notEqual(rows, data);
  assert.notEqual(updated, original);
  assert.notEqual(updated.profile, original.profile);
  assert.equal(updated.profile.sibling, sibling);
  assert.equal(updated.unrelated, sibling);
  assert.equal(rows[1], other);
});
test('editing array paths preserves arrays and unchanged entries', () => {
  const first = Object.freeze({ name: 'First' });
  const second = Object.freeze({ name: 'Second' });
  const original = Object.freeze({ id: 0, items: Object.freeze([first, second]) });
  const [[, updated]] = edit([original], '0', 'items[1].name', 'Changed');
  assert.ok(Array.isArray(updated.items));
  assert.notEqual(updated.items, original.items);
  assert.equal(updated.items[0], first);
  assert.equal(updated.items[1].name, 'Changed');
  assert.equal(second.name, 'Second');
});
test('editing creates missing nested objects', () => {
  const [[, updated]] = edit([{ id: 1 }], '1', 'profile.name', 'New');
  assert.deepEqual(plain(updated), { id: 1, profile: { name: 'New' } });
});
test('editing creates missing nested arrays', () => {
  const [[, updated]] = edit([{ id: 1 }], '1', 'items[0].name', 'New');
  assert.ok(Array.isArray(updated.items));
  assert.deepEqual(plain(updated.items), [{ name: 'New' }]);
});
test('null intermediate values can be replaced by nested objects', () => {
  const original = { id: 1, profile: null };
  const [[, updated]] = edit([original], '1', 'profile.name', 'New');
  assert.equal(updated.profile.name, 'New');
  assert.equal(original.profile, null);
});
test('existing literal keys containing dots remain editable', () => {
  const [[, updated]] = edit([{ id: 1, 'profile.name': 'Before' }], '1', 'profile.name', 'After');
  assert.equal(updated['profile.name'], 'After');
  assert.equal(Object.hasOwn(updated, 'profile'), false);
});
test('top-level editing with numeric ID zero remains supported', () => {
  const [[, updated]] = edit([{ id: 0, name: 'Before' }], '0', 'name', 'After');
  assert.equal(updated.name, 'After');
  assert.equal(updated.id, 0);
});
test('string _id editing remains supported', () => {
  const [[, updated]] = edit([{ _id: 'abc', name: 'Before' }], 'abc', 'name', 'After');
  assert.equal(updated.name, 'After');
});
test('unknown IDs and missing edit callback remain safe', () => {
  assert.equal(edit([{ id: 1 }], '9', 'name', 'After').length, 0);
  assert.equal(edit([{ id: 1 }], '1', 'name', 'After', false).length, 0);
});
test('empty update path leaves the object unchanged', () => {
  const original = { name: 'Before' };
  assert.equal(setValueAtPath(original, '', 'After'), original);
});
test('nested update does not modify inherited prototype objects', () => {
  const result = setValueAtPath({}, '__proto__.polluted', true);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(Object.hasOwn(result, '__proto__'), true);
  assert.equal(result.__proto__.polluted, true);
  assert.equal(Object.getPrototypeOf(result).polluted, undefined);
});
test('nested update does not modify constructor prototypes', () => {
  const result = setValueAtPath({}, 'constructor.prototype.polluted', true);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(result.constructor.prototype.polluted, true);
});
test('numeric equality still distinguishes numbers from numeric strings', () => {
  const result = processData([{ id: 0, amount: 0 }, { id: 1, amount: '0' }], { dataKey: 'amount', filtering: [{ key: 'amount', op: 'eq', val: 0 }] });
  assert.deepEqual(ids(result), ['0']);
});
test('editing an array preserves existing sparse entries', () => {
  const items = [];
  items[2] = { name: 'Before' };
  const updated = setValueAtPath({ items }, 'items[2].name', 'After');
  assert.equal(0 in updated.items, false);
  assert.equal(1 in updated.items, false);
  assert.equal(updated.items[2].name, 'After');
  assert.equal(items[2].name, 'Before');
});

test('nested editing, zero ID, text filtering, numeric sorting and pagination work together', () => {
  const original = [
    { id: 0, profile: { name: 'Marco', score: -2 } },
    { id: 1, profile: { name: 'MARCO', score: 1 } },
    { id: 2, profile: { name: 'marco', score: -1 } },
  ];
  const [[updated]] = edit(original, '0', 'profile.score', 0);
  const result = processData(updated, {
    dataKey: 'profile.score',
    filtering: [{ key: 'profile.name', op: 'match', val: 'MARCO' }],
    sorting: sortBy('asc', 'profile.score'),
    pagination: { offset: 1, limit: 1 },
  });
  assert.deepEqual(ids(result), ['0']);
  assert.deepEqual(values(result), [0]);
  assert.equal(result.totalItems, 3);
  assert.equal(original[0].profile.score, -2);
});
