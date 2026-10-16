require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { useParser } = require('../src/tables-framework/components/table-parser/hooks/use-parser/use-parser.ts');
const { Column } = require('../src/tables-framework/components/table-parser/components/column/column.tsx');
const { HeaderCell } = require('../src/tables-framework/components/table-parser/components/header-cell/header-cell.tsx');
const { BodyCell } = require('../src/tables-framework/components/table-parser/components/body-cell/body-cell.tsx');
function column(id, label = id) {
  return React.createElement(Column, { id },
    React.createElement(HeaderCell, { label }),
    React.createElement(BodyCell, { dataKey: id }));
}
test('freezing columns retains the previous source and unfreezing applies the latest source', () => {
  const original = column('original');
  const changed = column('changed');
  const snapshots = new Map();
  function Probe() {
    const [step, setStep] = React.useState(0);
    const parsed = useParser({ src: step ? changed : original, freeze: step === 1 });
    snapshots.set(step, parsed.map(item => item.id));
    if (step < 2) setStep(step + 1);
    return null;
  }
  renderToStaticMarkup(React.createElement(Probe));
  assert.deepEqual(snapshots.get(0), ['original']);
  assert.deepEqual(snapshots.get(1), ['original']);
  assert.deepEqual(snapshots.get(2), ['changed']);
});
test('equivalent column trees keep their descriptors while real changes replace them', () => {
  const sources = [column('name'), column('name'), column('name', 'Updated')];
  const snapshots = new Map();
  function Probe() {
    const [step, setStep] = React.useState(0);
    const parsed = useParser({ src: sources[step], freeze: false });
    snapshots.set(step, parsed);
    if (step < 2) setStep(step + 1);
    return null;
  }
  renderToStaticMarkup(React.createElement(Probe));
  assert.equal(snapshots.get(0), snapshots.get(1));
  assert.notEqual(snapshots.get(1), snapshots.get(2));
  assert.equal(snapshots.get(2)[0].label, 'Updated');
});
