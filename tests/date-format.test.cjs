require('./helpers/register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { formatDate } = require('../src/tables-framework/utils/date-utils/format-date.ts');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DynamicTable } = require('../src/tables-framework/components/dynamic-table/dynamic-table.tsx');

test('missing and invalid dates stay empty, while the epoch remains valid', () => {
  for (const value of [undefined, null, '', '  ', 'invalid', false, {}, [], NaN, Infinity, new Date(NaN)]) {
    assert.equal(formatDate(value), '');
  }
  assert.equal(formatDate(0), '01/01/1970');
  assert.equal(formatDate(new Date(0)), '01/01/1970');
});

test('Rome formatting crosses midnight and follows both daylight saving transitions', () => {
  const pattern = 'yyyy-MM-dd HH:mm:ss';
  for (const [input, expected] of [
    ['2026-01-01T23:30:00Z', '2026-01-02 00:30:00'],
    ['2026-07-01T22:30:00Z', '2026-07-02 00:30:00'],
    ['2026-03-29T00:59:59Z', '2026-03-29 01:59:59'],
    ['2026-03-29T01:00:00Z', '2026-03-29 03:00:00'],
    ['2026-10-25T00:59:59Z', '2026-10-25 02:59:59'],
    ['2026-10-25T01:00:00Z', '2026-10-25 02:00:00'],
  ]) assert.equal(formatDate(input, pattern), expected);
});

test('common patterns retain padding, names, 12-hour time and escaped literals', () => {
  const date = '2026-01-02T00:03:04.005Z';
  assert.equal(formatDate(date, "yyyyMMdd'T'HHmmss.SSS", 'UTC'), '20260102T000304.005');
  assert.equal(formatDate(date, 'yy-M-d H:m:s h hh a', 'UTC'), '26-1-2 0:3:4 12 12 AM');
  assert.equal(formatDate('2026-01-02T12:03:04Z', 'h hh a', 'UTC'), '12 12 PM');
  assert.equal(formatDate(date, "EEE EEEE MMM MMMM 'o''clock' ''", 'UTC'), "Fri Friday Jan January o'clock '");
  assert.equal(formatDate(date, 'MMMM EEEE', 'UTC', 'it-IT'), 'gennaio venerdì');
  assert.equal(formatDate(date, ''), '');
  assert.throws(() => formatDate(date, 'yyyy QQQ'), /Unsupported date format token: QQQ/);
  assert.throws(() => formatDate(date, "yyyy 'unfinished"), /Unsupported date format token/);
});

test('native options support locale, timezone labels and an explicit timezone override', () => {
  const value = '2026-07-01T22:30:00Z';
  const options = { dateStyle: 'long', timeStyle: 'short' };
  assert.equal(formatDate(value, options, 'Europe/Rome', 'it-IT'),
    new Intl.DateTimeFormat('it-IT', { ...options, timeZone: 'Europe/Rome' }).format(new Date(value)));
  const withZone = { hour: '2-digit', timeZoneName: 'short', timeZone: 'UTC' };
  assert.equal(formatDate(value, withZone, 'Europe/Rome'),
    new Intl.DateTimeFormat('en-US', withZone).format(new Date(value)));
});

test('explicit instants and ISO date-only inputs are independent of the host timezone', () => {
  const script = `
    require('./tests/helpers/register-typescript.cjs');
    const { formatDate } = require('./src/tables-framework/utils/date-utils/format-date.ts');
    process.stdout.write(JSON.stringify([
      formatDate('2026-07-01T22:30:00Z', 'yyyy-MM-dd HH:mm'),
      formatDate('2026-07-02T00:30:00+02:00', 'yyyy-MM-dd HH:mm'),
      formatDate('2026-07-01', 'yyyy-MM-dd HH:mm'),
      formatDate(0, 'yyyy-MM-dd HH:mm'),
    ]));
  `;
  for (const TZ of ['UTC', 'America/New_York', 'Asia/Tokyo']) {
    const output = execFileSync(process.execPath, ['-e', script], {
      cwd: require('node:path').resolve(__dirname, '..'), env: { ...process.env, TZ }, encoding: 'utf8',
    });
    assert.deepEqual(JSON.parse(output), ['2026-07-02 00:30', '2026-07-02 00:30', '2026-07-01 02:00', '1970-01-01 01:00']);
  }
});

test('date cell forwards native formatting settings without leaking them to the DOM', () => {
  const html = renderToStaticMarkup(React.createElement(DynamicTable, {
    data: [{ id: 1, date: '2026-07-01T22:30:00Z' }],
    columns: [{ id: 'date', label: 'Date', type: 'date', bodyProps: {
      locale: 'it-IT', timeZone: 'UTC', format: { day: 'numeric', month: 'long', year: 'numeric' },
    } }],
  }));
  assert.match(html, /1 luglio 2026/);
  assert.doesNotMatch(html, /\s(?:locale|timeZone|format)=/i);
});
