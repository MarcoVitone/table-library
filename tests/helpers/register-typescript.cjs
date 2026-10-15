const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const sourceRoot = path.join(root, 'src');
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  // Load the real icons lazily, matching the production bundler's named imports.
  if (request === '@mui/icons-material') return path.join(__dirname, 'icons.cjs');
  let candidate;
  if (request.startsWith('@/')) candidate = path.join(sourceRoot, request.slice(2));
  else if (parent?.filename.startsWith(sourceRoot) && request.startsWith('.')) candidate = path.resolve(path.dirname(parent.filename), request);
  if (candidate) {
    const base = candidate.replace(/\.(?:jsx?|tsx?)$/, '');
    const match = [candidate, base + '.ts', base + '.tsx', path.join(candidate, 'index.ts'), path.join(candidate, 'index.tsx')]
      .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
    if (match) return resolveFilename.call(this, match, parent, ...rest);
  }
  return resolveFilename.call(this, request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(compiled.outputText, filename);
  };
}
require.extensions['.css'] = () => {};
