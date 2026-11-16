import { build } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const sizes = value => ({ bytes: Buffer.byteLength(value), gzip: gzipSync(value).length, brotli: brotliCompressSync(value).length });
const results = {};
for (const [name, contents] of Object.entries({
  DynamicTable: 'import { DynamicTable } from "library"; globalThis.measuredExport = DynamicTable;',
  TableButton: 'import { TableButton } from "library"; globalThis.measuredExport = TableButton;',
  all: 'import * as library from "library"; globalThis.measuredExport = library;',
})) {
  const entry = '\0bundle-measurement';
  const result = await build({ root, configFile: false, logLevel: 'error',
    plugins: [{ name: 'measure-consumer', resolveId(id) {
      if (id === entry) return id;
      if (id === 'library') return path.join(root, 'dist/index.js');
    }, load(id) { if (id === entry) return contents; } }],
    build: { write: false, minify: 'esbuild', target: 'es2020',
      rollupOptions: { input: entry, external: id => /^(react|react-dom)(\/|$)/.test(id) },
    },
  });
  results[name] = sizes(result.output.filter(item => item.type === 'chunk').map(item => item.code).join('\n'));
}
results.css = sizes(await readFile(path.join(root, 'dist/style.css')));
console.log(JSON.stringify({ note: 'Production consumer bundles; React and ReactDOM excluded. CSS listed separately. Sizes in bytes.', results }, null, 2));
if (process.argv.includes('--check')) {
  const gzipBudgets = { DynamicTable: 46000, TableButton: 4000, all: 49000, css: 2600 };
  for (const [name, limit] of Object.entries(gzipBudgets)) {
    assert.ok(results[name].gzip <= limit, `${name}: ${results[name].gzip} gzip bytes exceeds the ${limit}-byte budget.`);
  }
}
