# Bundle size

Production consumer measurements, using Vite/Rollup with minification and tree shaking:

| Import | JavaScript | gzip | Brotli |
| --- | ---: | ---: | ---: |
| `DynamicTable` | 121.5 kB | 41.7 kB | 36.7 kB |
| `TableButton` | 6.2 kB | 2.9 kB | 2.5 kB |
| All exports | 127.8 kB | 43.9 kB | 38.5 kB |
| Shared CSS (separate) | 7.4 kB | 2.2 kB | 1.8 kB |

kB means 1,000 bytes. React and ReactDOM are peer dependencies and excluded from
these figures. All other runtime code is included. Results vary with the consumer's
bundler, configuration and actual usage. The npm archive also contains declarations,
documentation and both module formats; its disk size is not the browser payload.

To reproduce after source changes:

```sh
npm run build
npm run size
npm run size:check
```

`size` reports uncompressed, gzip and Brotli sizes in bytes for representative
consumer imports. `size:check` runs the same measurements and fails if the gzip
budgets are exceeded: 46 kB for `DynamicTable`, 4 kB for `TableButton`, 49 kB for
all exports and 2.6 kB for CSS. These commands measure the existing `dist` build.

The package has no additional runtime dependencies beyond its React peers.
Sorting indicators use CSS transitions and respect reduced-motion preferences.
CSV export accepts a plain translation callback for `true`, `false`, `yes` and
`no`; applications can pass their existing translator without installing i18next
for the table library.

Pure annotations on component factories, contexts, icons and the default
translator allow consumer bundlers to remove unused initialization code. Keep
these annotations when changing factory calls; do not mark functions that perform
observable side effects as pure. Named ESM imports allow unused exports to be
removed; using all exports or CommonJS can retain more code. Import
`fabulous-table-library/style.css` once in the application.
