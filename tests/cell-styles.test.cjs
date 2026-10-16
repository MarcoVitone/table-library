require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');
const { BaseCell } = require('../src/tables-framework/components/cells/base-cell/base-cell.tsx');
const { TableContext } = require('../src/tables-framework/components/table-renderer/table-renderer.tsx');

function cellStyle(html, area) {
  const section = html.match(new RegExp('<' + area + '\\b[^>]*>([\\s\\S]*?)</' + area + '>'));
  assert.ok(section, area + ' exists');
  const cell = section[1].match(/<t[dh]\b[^>]*style="([^"]*)"/);
  assert.ok(cell, area + ' has a styled cell');
  return Object.fromEntries(cell[1].split(';').filter(Boolean).map(rule => {
    const colon = rule.indexOf(':');
    return [rule.slice(0, colon), rule.slice(colon + 1)];
  }));
}

function renderCell(props = {}, context = {}) {
  const data = { column: { id: 'name', dataKey: 'name', props: {} }, row: { id: 'row' } };
  return renderToStaticMarkup(React.createElement(TableContext.Provider, { value: context },
    React.createElement('table', null, React.createElement('tbody', null,
      React.createElement('tr', null, React.createElement(BaseCell, { data, area: 'body', ...props }, 'Name'))))));
}

test('DynamicTable preserves header and body color, borders, padding and overflow props', () => {
  const border = { show: true, width: '2px', style: 'dotted', color: '#abcdef' };
  const props = {
    borderTop: border, borderRight: border, borderBottom: border, borderLeft: border,
    padding: '7px', overFlow: 'scroll', fontColor: '#345678', fontSize: '15px',
  };
  const html = renderToStaticMarkup(React.createElement(DynamicTable, {
    data: [{ id: 1, name: 'Name' }],
    columns: [{ id: 'name', dataKey: 'name', label: 'Name', type: 'text',
      headerProps: { ...props, backgroundColor: '#123456' },
      bodyProps: { ...props, backgroundColor: '#654321' } }],
  }));
  for (const [area, color] of [['thead', '#123456'], ['tbody', '#654321']]) {
    const style = cellStyle(html, area);
    assert.equal(style['background-color'], color);
    for (const side of ['top', 'right', 'bottom', 'left']) assert.equal(style['border-' + side], '2px dotted #abcdef');
    assert.equal(style.padding, '7px');
    assert.equal(style.overflow, 'scroll');
    assert.equal(style.color, '#345678');
    assert.equal(style['font-size'], '15px');
  }
});

test('BaseCell retains default padding and ellipsis constraints', () => {
  const style = cellStyle(renderCell({ ellipsis: true, maxWidth: '120px' }), 'tbody');
  assert.equal(style.padding, '.5rem .75rem');
  assert.equal(style['max-width'], '120px');
  assert.equal(style.overflow, 'hidden');
  assert.equal(style['text-overflow'], 'ellipsis');
});

test('BaseCell preserves fixed, sorted and selected background precedence', () => {
  for (const [props, context, expected] of [
    [{ fixed: true }, {}, '#fff'],
    [{ fixed: true, backgroundColor: '#123456' }, {}, '#123456'],
    [{ sortable: true, backgroundColor: '#123456', backgroundColorSort: '#abcdef' }, { sorting: [{ key: 'name', dir: 'asc' }] }, '#abcdef'],
    [{ sortable: true, backgroundColor: '#123456', backgroundColorSort: '#abcdef', rowSelectedColor: '#654321' }, { sorting: [{ key: 'name', dir: 'asc' }], rowsStatus: { row: { isSelected: true } } }, '#654321'],
  ]) {
    assert.equal(cellStyle(renderCell(props, context), 'tbody')['background-color'], expected);
  }
});

test('explicit inline styles keep priority over cell props and defaults', () => {
  const style = cellStyle(renderCell({ backgroundColor: '#123456', padding: '7px',
    style: { backgroundColor: '#abcdef', borderTop: '3px solid red', padding: '12px', overflow: 'visible', maxWidth: '90px' } }), 'tbody');
  assert.equal(style['background-color'], '#abcdef');
  assert.equal(style['border-top'], '3px solid red');
  assert.equal(style.padding, '12px');
  assert.equal(style.overflow, 'visible');
  assert.equal(style['max-width'], '90px');
});
