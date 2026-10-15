# 2. DynamicTable Component

The `DynamicTable` is the core component of the library. It orchestrates data rendering, column configuration, pagination, and interaction events.

## Imports

```typescript
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
```

## Props

Below is the complete list of properties accepted by the `DynamicTable` component.

### Core Configuration

| Prop                  | Type                 | Required | Description                                                                                |
| :-------------------- | :------------------- | :------- | :----------------------------------------------------------------------------------------- |
| `data`                | `T[]`                | Yes      | Array of data objects to be rendered.                                                      |
| `columns`             | `IColumnConfig<T>[]` | Yes      | Array of column configurations.                                                            |
| `maxHeight`           | `string \| number`   | No       | Max height of the table container (e.g., `"500px"`). Enables vertical scrolling.           |
| `stickyHeader`        | `boolean`            | No       | Valid only if `maxHeight` is set. Keeps the header fixed while scrolling. Default: `true`. |
| `externalBorderColor` | `string`             | No       | Color of the external border of the table container.                                       |
| `rowSelectedColor`    | `string`             | No       | Background color for selected rows.                                                        |

### Feature Flags

| Prop                   | Type                  | Default    | Description                                                        |
| :--------------------- | :-------------------- | :--------- | :----------------------------------------------------------------- |
| `isResizable`          | `boolean`             | `false`    | Enables column resizing globally.                                  |
| `enableColumnReorder`  | `boolean`             | `false`    | Enables drag-and-drop column reordering.                           |
| `enableColumnHiding`   | `boolean`             | `false`    | Shows an icon in the header to hide columns.                       |
| `enableColumnConfig`   | `boolean`             | `false`    | Shows a settings button to open the "Columns Configuration" modal. |
| `enableColumnFilters`  | `boolean`             | `false`    | Enables filter inputs in column headers.                           |
| `dragHandleVisibility` | `"always" \| "hover"` | `"always"` | Controls visibility of the drag handle for reordering.             |

### Styling

| Prop           | Type            | Description                                           |
| :------------- | :-------------- | :---------------------------------------------------- |
| `headerBorder` | `IBorderConfig` | Configuration for header cell borders (bottom/right). |
| `bodyBorder`   | `IBorderConfig` | Configuration for body cell borders (bottom/right).   |
| `stripedRows` | `boolean \| IStripedRowsConfig` | Alternating body row backgrounds. Default: `false`. |
| `getRowStyle` | `(row: T, rowIndex: number) => CSSProperties \| null \| undefined` | Styles based on the original row data and zero-based visible page index. |

`stripedRows={true}` uses `#ffffff` for the first/third rows and `#f5f7fa` for
the second/fourth rows. Customize them with
`stripedRows={{ oddColor: "#ffffff", evenColor: "#eef4ff" }}`.
`getRowStyle` overrides the alternating styles; return `undefined` or `null`
to keep them. See [row styling examples](./06_THEMING_AND_STYLING.md#conditional-and-alternating-rows).

#### `IBorderConfig` Interface

```typescript
interface IBorderConfig {
  show?: boolean;      // Enable border
  color?: string;      // Border color (hex, rgb, etc.)
  width?: string;      // Border width (e.g. "1px")
  style?: "solid" | "dashed" | "dotted" | ...; // Border style
}
```

### Loading, errors and empty results

These props work with or without pagination and are also available on `Table`:

| Prop | Type | Default / behavior |
| :--- | :--- | :--- |
| `tableLabel` | `string` | Accessible name of the table. |
| `isLoading` | `boolean` | `false`; shows a loading row and sets `aria-busy`. |
| `error` | `ReactNode` | An error message or component; `null`/`undefined`/`false` clears it. |
| `onRetry` | `() => void` | Displays a **Riprova** button when an error is shown. |
| `loadingContent` | `ReactNode` | `Caricamento…` |
| `emptyContent` | `ReactNode` | `Nessun dato disponibile` |
| `noResultsContent` | `ReactNode` | `Nessun risultato per i filtri applicati` |

Priority is loading, error, then data or the appropriate empty state. Loading
and errors replace stale body rows. The header stays available. Empty messages
span the visible columns and use valid table markup. Active filters select the
no-results message. The existing `empty` prop remains a complete custom empty
renderer; it takes priority over the built-in empty messages.

Top-level `isLoading` takes priority over legacy
`pagination.serverSide.isLoading`. Pass a rendered message such as
`error={requestError?.message}` rather than an `Error` object.

```tsx
<DynamicTable
  data={rows}
  columns={columns}
  tableLabel="Customers"
  isLoading={isLoading}
  error={errorMessage}
  onRetry={reload}
  emptyContent="No customers yet"
  noResultsContent="No matching customers"
/>
```

### Unified query state

| Prop | Type | Description |
| :--- | :--- | :--- |
| `dataMode` | `"client" \| "server"` | Defaults to `client`. Server mode skips all local filtering, sorting and pagination. |
| `query` | `ITableQuery` | Controlled page, page size, sorting and filters. |
| `defaultQuery` | `Partial<ITableQuery>` | Initial values for an uncontrolled query. |
| `onQueryChange` | `(query: ITableQuery) => void` | One combined update for a user action. |
| `totalItems` | `number` | Total matching records supplied by the server, before pagination. |

See [the server example](./04_ADVANCED_FEATURES.md#unified-client-and-server-query).
The unified API is enabled by `query`, `defaultQuery`, `onQueryChange` or
`dataMode="server"`. It takes priority over legacy pagination control and layout
sorting/filtering; use one source of truth. Existing pagination APIs continue
to work when the unified API is not used.

### Events

| Prop                   | Type                                    | Description                                                  |
| :--------------------- | :-------------------------------------- | :----------------------------------------------------------- |
| `onDataChange`         | `(newData: T[], updatedRow: T) => void \| Promise<void>` | Accepted edit; return a promise to expose saving/error state. |
| `onRowSelectionChange` | `(selectedData: T[]) => void`           | Triggered when row selection changes.                        |
| `onRowDoubleClick`     | `IRowNavigationConfig`                  | Configuration for row double-click actions.                  |

## Configuration Details

### Data (`data`)

The `data` prop accepts a simple array of objects. Each row should have a unique
identifier. The default `idKey` is `"id"`; set `idKey="_id"` for rows using `_id`.
Numeric IDs, including `0`, and string IDs are supported. IDs are serialized
to strings internally, so `0` and `"0"` refer to the same row identity.

```typescript
const users = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" },
];
```

### Row Navigation (`onRowDoubleClick`)

This prop enables navigation when a row is double-clicked.

```typescript
<DynamicTable
  // ...
  onRowDoubleClick={{
    baseUrl: "/users", // Base URL for navigation
    targetKey: "id", // Key to read from the row data (appended to URL)
    onNavigate: (path) => console.log("Navigating to:", path),
    // Or use internal router integration if available
  }}
/>
```

With `targetKey: "id"`, double-clicking Alice (id: 1) would navigate to `/users/1`.

## Full Example

```tsx
<DynamicTable
  data={users}
  columns={columns}
  maxHeight={600}
  stickyHeader={true}
  enableColumnReorder={true}
  enableColumnHiding={true}
  headerBorder={{ show: true, color: "#ccc", width: "1px" }}
  bodyBorder={{ show: true, color: "#eee", width: "1px" }}
  onRowSelectionChange={(selected) => console.log(selected)}
/>
```
