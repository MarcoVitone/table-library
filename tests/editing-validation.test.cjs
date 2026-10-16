require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { InputCell } = require('../src/tables-framework/components/cells/input-cell/input-cell.tsx');

function control(node) {
  if (!React.isValidElement(node)) return undefined;
  if ('value' in node.props && node.props.onChange) return node;
  for (const child of React.Children.toArray(node.props.children)) {
    const result = control(child);
    if (result) return result;
  }
}
const row = { id: 0, locked: true };
const data = { id: 'cell', value: 'Before', row: { id: 'row', source: { id: '0', full: row } },
  column: { id: 'name', label: 'Name', props: {} } };
function edit(props) {
  function Probe() {
    const [step, setStep] = React.useState(0);
    const cell = InputCell({ data, ...props });
    const input = control(cell);
    if (step === 0) { input.props.onChange({ target: { value: 'After' } }); setStep(1); }
    else if (step === 1) { input.props.onBlur(); setStep(2); }
    return React.createElement('table', null, React.createElement('tbody', null, React.createElement('tr', null, cell)));
  }
  return renderToStaticMarkup(React.createElement(Probe));
}

test('validation receives the original record, rejects changes and links its message to the editor', () => {
  const changes = [];
  const html = edit({ validate: (value, original) => {
    assert.equal(value, 'After'); assert.equal(original, row); return 'Invalid value';
  }, onCellChange: value => changes.push(value) });
  assert.deepEqual(changes, []);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /role="alert">Invalid value/);
  const description = html.match(/aria-describedby="([^"]*)"/)[1];
  assert.ok(html.includes('id="' + description + '"'));
});

test('row editability blocks callbacks even when handlers are invoked directly', () => {
  let changes = 0;
  const html = edit({ editable: original => !original.locked, onCellChange: () => { changes++; } });
  assert.equal(changes, 0);
  assert.match(html, /readOnly=""/);
  assert.match(html, /value="Before"/);
});

test('synchronous save failures become cell errors without escaping the event handler', () => {
  const html = edit({ onCellChange: () => { throw new Error('Save failed'); } });
  assert.match(html, /role="alert">Save failed/);
  assert.match(html, /value="After"/);
});
