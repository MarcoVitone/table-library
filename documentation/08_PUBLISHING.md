# 8. Build and npm publication

The package is named **fabulous-table-library**. The current version is taken
from package.json. React and React DOM are peer dependencies (React 19.2+ in
the React 19 major); the consumer provides them.

## Generate the library

Run from the repository root:

```bash
npm install
npm run build
```

The npm build writes only the library to dist:

- index.js: ES module.
- index.cjs: CommonJS module.
- index.d.mts and index.d.cts: declaration entry points for both module formats.
- Nested declaration files: the public API and its referenced types.
- style.css: the table stylesheet.

The build externalizes runtime dependencies, including React and its JSX
runtime. Type declarations are emitted for both module formats with portable relative
imports; they do not require the repository's internal path aliases.

## Create the package archive

```bash
npm pack --dry-run
npm pack
```

The archive is named fabulous-table-library-2.0.0.tgz at the current version.
Only dist, documentation, README, LICENSE and package metadata are distributed. The
prepack hook rebuilds the library when npm pack or npm publish runs.

To try the archive in another React application:

```bash
npm install /path/to/fabulous-table-library-2.0.0.tgz
```

```tsx
import { DynamicTable, type IColumnConfig } from "fabulous-table-library";
import "fabulous-table-library/style.css";

const data = [{ id: 1, name: "Mario" }];
const columns: IColumnConfig<(typeof data)[number]>[] = [
  { id: "name", label: "Name", type: "text" },
];

export function Example() {
  return <DynamicTable data={data} columns={columns} />;
}
```

## Publish when ready

Ensure that the name is available on the target npm registry. The project uses
the MIT license; see [LICENSE](../LICENSE) for the full terms.

```bash
npm login
npm publish --access public
```

The prepack hook rebuilds the package. Each published name/version combination is
unique: increment the version before publishing a subsequent release.

The README links to documentation on the repository's `main` branch. Merge and
push the release documentation to `main` before publishing, preserving the exact
filename casing used by those links.

```bash
npm version patch
npm publish --access public
```

Publication is a separate action; building or packing does not publish anything.

## Build the demo

```bash
npm run build:demo
npm run preview
```

The standalone demo is written to dist-demo and is not included in the npm
package.
