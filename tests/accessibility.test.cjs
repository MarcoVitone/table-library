require('./helpers/register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { resolveAccessibilityProps } = require('../src/tables-framework/accessibility/accessibility-config.ts');
const { AccessibilityProvider, AccessibilityScope, useTableAccessibility } = require('../src/tables-framework/accessibility/index.ts');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { TableButton } = require('../src/tables-framework/components/table-sub-components/button/button.tsx');

const h = React.createElement;
const data = [{ id: 0, name: 'Anna' }, { id: 1, name: 'Marco' }];
const columns = [{ id: 'name', label: 'Nome', dataKey: 'name', headerProps: { sortable: true } }];
const render = (props = {}, children) => renderToStaticMarkup(h(DynamicTable, { data, columns, ...props }, children));

test('accessibility keeps defaults unless overridden and resolves the final callback last', () => {
  const defaults = { 'aria-label': 'Default', title: 'Help', tabIndex: 0, role: 'button' };
  assert.deepEqual(resolveAccessibilityProps(undefined, 'sortButton', defaults), defaults);
  const result = resolveAccessibilityProps({
    slotProps: { sortButton: (context, base) => {
      assert.equal(base.title, 'Help');
      return { 'aria-label': context.label, title: undefined };
    } },
    getProps(slot, resolved, context) {
      assert.equal(slot, 'sortButton');
      assert.equal(resolved['aria-label'], context.label);
      assert.equal(resolved.title, undefined);
      return { 'aria-label': 'Final', role: undefined, tabIndex: -1 };
    },
  }, 'sortButton', defaults, { label: 'Consumer' });
  assert.deepEqual(result, { 'aria-label': 'Final', title: undefined, role: undefined, tabIndex: -1 });
  assert.equal(defaults.title, 'Help');
});

test('opting out strips generated semantics and focus props while preserving native behavior', () => {
  const onClick = () => {};
  const result = resolveAccessibilityProps({ useDefaults: false, slotProps: { checkbox: { 'aria-label': 'Custom' } } }, 'checkbox', {
    role: 'switch', 'aria-checked': true, 'aria-describedby': 'help', title: 'Tip', tabIndex: 0,
    autoFocus: true, focusable: 'false', scope: 'col', headers: 'header', disabled: true, type: 'checkbox', onClick,
  });
  for (const key of ['role', 'aria-checked', 'aria-describedby', 'title', 'tabIndex', 'autoFocus', 'focusable', 'scope', 'headers']) assert.equal(result[key], undefined);
  assert.equal(result['aria-label'], 'Custom');
  assert.equal(result.disabled, true);
  assert.equal(result.type, 'checkbox');
  assert.equal(result.onClick, onClick);
});

test('DynamicTable applies table, cell and control overrides with real row/column context', () => {
  const seen = [];
  const html = render({ tableLabel: 'Default table', enableColumnReorder: true, isResizable: true,
    pagination: { enabled: true, limit: 1, limitOptions: [1, 2] },
    accessibility: {
      slotProps: {
        table: { 'aria-label': undefined, 'aria-labelledby': 'custom-heading' },
        cell: ({ area, columnId, rowId }) => ({ 'aria-label': `${area}:${columnId}:${rowId}` }),
        sortButton: ({ columnId }) => ({ 'aria-label': `Sort ${columnId}`, title: undefined }),
        pageButton: ({ index }) => ({ 'aria-label': `Page ${index + 1}`, 'aria-current': undefined }),
      },
      getProps(slot, _props, context) {
        seen.push([slot, context]);
        return slot === 'resizeHandle' ? { 'aria-label': `Resize ${context.columnId}` } : undefined;
      },
    },
  });
  assert.match(html, /aria-labelledby="custom-heading"/);
  assert.doesNotMatch(html, /aria-label="Default table"/);
  assert.match(html, /aria-label="body:name:0"/);
  assert.match(html, /aria-label="Sort name"/);
  assert.match(html, /aria-label="Resize name"/);
  assert.match(html, /aria-label="Page 1"/);
  assert.doesNotMatch(html, /aria-current=/);
  assert.ok(seen.some(([slot, context]) => slot === 'row' && context.area === 'body' && context.rowId === '0' && context.index === 0));
});

test('useDefaults=false reaches all built-in controls and permits explicit consumer semantics', () => {
  const props = { tableLabel: 'Default table', enableColumnReorder: true, enableColumnFilters: true, isResizable: true,
    enableColumnConfig: true, enableColumnHiding: true, globalSearch: true,
    pagination: { enabled: true, limit: 1, limitOptions: [1, 2] },
    savedViews: { key: 'accessibility', storage: 'none' },
  };
  const html = render({ ...props, accessibility: { useDefaults: false } });
  assert.match(html, /<table\b/);
  assert.match(html, /<th\b/);
  assert.match(html, /Anna/);
  assert.doesNotMatch(html, /\s(?:aria-[\w-]+|role|scope|headers|tabindex|title|autofocus|focusable)=/);
  const custom = render({ ...props, accessibility: { useDefaults: false, slotProps: {
    table: { 'aria-label': 'Consumer table' },
    globalSearchInput: { 'aria-label': 'Find records' },
    savedViewSaveButton: { 'aria-label': 'Save current layout' },
  } } });
  assert.match(custom, /aria-label="Consumer table"/);
  assert.match(custom, /aria-label="Find records"/);
  assert.match(custom, /aria-label="Save current layout"/);
});

test('selection and row actions receive the original row even when its ID is zero', () => {
  const html = render({ columns: [
    { id: 'select', label: 'Select', type: 'checkbox', headerProps: { showHeaderCheckbox: true } },
    ...columns,
    { id: 'actions', label: 'Actions', type: 'action', bodyProps: { actions: [{ label: 'Open', onAction() {} }] } },
  ], accessibility: { slotProps: {
    rowCheckbox: ({ rowId }) => ({ 'aria-label': `Select ${rowId}` }),
    rowAction: ({ row, index }) => ({ 'aria-label': `Action ${index}: ${row.source.full.name}` }),
  } } });
  assert.match(html, /aria-label="Select 0"/);
  assert.match(html, /aria-label="Action 0: Anna"/);
  assert.match(html, /aria-label="Action 0: Marco"/);
});

test('provider configuration merges per table, including partial dialog settings', () => {
  let settings;
  function Probe() { settings = useTableAccessibility(); return null; }
  const html = renderToStaticMarkup(h(AccessibilityProvider, { value: {
    useDefaults: false, dialog: { modal: false, restoreFocus: false },
    slotProps: { table: { 'aria-label': 'Inherited' }, globalSearchInput: { 'aria-label': 'Inherited search' } },
    messages: { selectionCount: 'Inherited selection' },
  } }, h(AccessibilityProvider, { value: { dialog: { trapFocus: false } } }, h(Probe)),
  h(DynamicTable, { data, columns, globalSearch: true, accessibility: { slotProps: { table: { 'aria-label': 'Local' } } } })));
  assert.deepEqual(settings.dialog, { modal: false, restoreFocus: false, trapFocus: false });
  assert.equal(settings.message('selectionCount', 'Default'), 'Inherited selection');
  assert.equal(settings.message('saving', 'Default saving'), '');
  assert.match(html, /aria-label="Local"/);
  assert.match(html, /aria-label="Inherited search"/);
});

test('message callbacks and custom controls inherit normalized row and column context', () => {
  let announcement;
  function CustomControl() {
    const { message } = useTableAccessibility();
    announcement = message('saving', 'Saving');
    return h(TableButton, { label: 'Custom' });
  }
  const html = renderToStaticMarkup(h(AccessibilityProvider, { value: {
    slotProps: { button: ({ rowId, columnId }) => ({ 'aria-label': `${rowId}:${columnId}` }) },
    messages: { saving: ({ rowId, columnId }) => `Saving ${rowId}:${columnId}` },
  } }, h(AccessibilityScope, { context: { row: { source: { id: '0' } }, column: { id: 'name' } } }, h(CustomControl))));
  assert.equal(announcement, 'Saving 0:name');
  assert.match(html, /aria-label="0:name"/);
});

test('input controls can remove generated validation links and supply their own names', () => {
  const html = render({ columns: [{ id: 'name', label: 'Name', type: 'input' }], accessibility: { slotProps: {
    cellInput: ({ rowId }) => ({ 'aria-label': undefined, 'aria-labelledby': `record-${rowId}`, 'aria-describedby': undefined }),
  } } });
  assert.match(html, /aria-labelledby="record-0"/);
  assert.match(html, /aria-labelledby="record-1"/);
  assert.doesNotMatch(html, /aria-label="Name"/);
});
