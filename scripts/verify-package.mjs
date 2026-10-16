import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'vite';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const temporaryRoot = path.join(root, 'node_modules', '.tmp');
await mkdir(temporaryRoot, { recursive: true });
const temporary = await mkdtemp(path.join(temporaryRoot, 'verify-package-'));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout;
}

try {
  assert.ok(process.env.npm_execpath, 'Run this check through npm run test:package.');
  const [packed] = JSON.parse(run(process.execPath, [process.env.npm_execpath,
    'pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root));
  const files = new Set(packed.files.map(file => file.path));
  for (const file of ['index.js', 'index.cjs', 'index.d.mts', 'index.d.cts', 'style.css']) {
    assert.ok(files.has('dist/' + file), 'Missing published artifact: ' + file);
  }
  assert.ok(![...files].some(file => /^(src|e2e|tests|node_modules|dist-demo)\//.test(file)), 'Development files leaked into the package.');

  const consumer = path.join(temporary, 'consumer');
  const installed = path.join(consumer, 'node_modules', pkg.name);
  await mkdir(installed, { recursive: true });
  run('tar', ['-xzf', path.join(temporary, packed.filename), '-C', installed, '--strip-components=1'], root);
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({ name: 'package-consumer-check', private: true, type: 'module' }));
  const installedPackage = JSON.parse(await readFile(path.join(installed, 'package.json'), 'utf8'));
  assert.equal(installedPackage.name, pkg.name);
  for (const file of ['index.js', 'index.cjs', 'index.d.mts', 'index.d.cts']) {
    const content = await readFile(path.join(installed, 'dist', file), 'utf8');
    assert.ok(!content.includes('@/tables-framework'), 'Unresolved source alias in ' + file);
    assert.ok(!content.includes(root.replaceAll('\\', '/')), 'Local repository path in ' + file);
  }

  // Only the library is extracted from the tarball; external dependencies resolve
  // from the development installation, without repository aliases.
  const esm = [
    'import assert from "node:assert/strict";',
    'import React from "react";',
    'import { renderToStaticMarkup } from "react-dom/server";',
    'import { DynamicTable } from ' + JSON.stringify(pkg.name) + ';',
    'const html = renderToStaticMarkup(React.createElement(DynamicTable, { data: [{id:0,name:"Packed ESM"}], columns: [{id:"name",label:"Name"}] }));',
    'assert.match(html, /Packed ESM/);',
  ].join('\n');
  const cjs = [
    'const assert = require("node:assert/strict");',
    'const React = require("react");',
    'const { renderToStaticMarkup } = require("react-dom/server");',
    'const { DynamicTable } = require(' + JSON.stringify(pkg.name) + ');',
    'const html = renderToStaticMarkup(React.createElement(DynamicTable, { data: [{id:0,name:"Packed CJS"}], columns: [{id:"name",label:"Name"}] }));',
    'assert.match(html, /Packed CJS/);',
  ].join('\n');
  for (const [file, content] of [['smoke.mjs', esm], ['smoke.cjs', cjs]]) {
    await writeFile(path.join(consumer, file), content);
    run(process.execPath, [file], consumer);
  }

  const types = [
    'import { DynamicTable, type IColumnConfig, type ITableQuery } from ' + JSON.stringify(pkg.name) + ';',
    'import { createElement } from "react";',
    'interface Row { id: number; name: string }',
    'const columns: IColumnConfig<Row>[] = [{id:"name",label:"Name",type:"text"}];',
    'const query: ITableQuery = {page:0,pageSize:10,sorting:[],filters:[]};',
    'createElement(DynamicTable<Row>, {data:[{id:0,name:"Typed"}],columns,query});',
    '// @ts-expect-error Published column variants must reject unsupported types.',
    'const invalid: IColumnConfig<Row> = {id:"x",label:"X",type:"unsupported"};',
    'void invalid;',
  ].join('\n');
  await writeFile(path.join(consumer, 'consumer.mts'), types);
  await writeFile(path.join(consumer, 'consumer.cts'), types);
  run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'),
    '--noEmit', '--strict', '--module', 'NodeNext', '--moduleResolution', 'NodeNext',
    '--target', 'ES2022', '--esModuleInterop', '--skipLibCheck', 'false',
    'consumer.mts', 'consumer.cts'], consumer);

  await writeFile(path.join(consumer, 'index.html'), '<div id="root"></div><script type="module" src="/main.js"></script>');
  await writeFile(path.join(consumer, 'main.js'), [
    'import { DynamicTable } from ' + JSON.stringify(pkg.name) + ';',
    'import ' + JSON.stringify(pkg.name + '/style.css') + ';',
    'globalThis.packedTable = DynamicTable;',
  ].join('\n'));
  const bundled = await build({ root: consumer, configFile: false, logLevel: 'error', build: { write: false } });
  assert.ok(bundled.output.some(file => file.type === 'chunk' && file.code.includes('packedTable')));
  assert.ok(bundled.output.some(file => file.type === 'asset' && file.fileName.endsWith('.css') && String(file.source).includes('.tbl-cell')));
  console.log('Package verified: archive contents, ESM, CommonJS, both declaration formats and consumer CSS build.');
} finally {
  const relative = path.relative(temporaryRoot, temporary);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Refusing cleanup outside the temporary workspace.');
  await rm(temporary, { recursive: true, force: true });
}
