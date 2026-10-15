# 4. Advanced Features

This section explores the powerful built-in features of the `DynamicTable`.

## Sorting

Sorting is handled client-side by default. Zero and `false` are compared as
values. `null` and `undefined` are placed last in both directions; equal values
continue to the next configured sort column.

### Enable Sorting

To enable sorting for a column, set `sortable: true` in its `headerProps`.

```typescript
{
  id: "age",
  label: "Age",
  type: "number",
  headerProps: {
    sortable: true
  }
}
```

### Server-Side Sorting

Set `isServerSideSort: true` in the column's `headerProps` to request
server-side sorting. The table keeps the supplied row order in this mode.

```typescript
{
  id: "age",
  label: "Age",
  type: "number",
  headerProps: {
    sortable: true,
    isServerSideSort: true
  }
}
```

Use `onLayoutChange` to observe `layout.sorting`, fetch the sorted data, and
update the `data` prop. An empty sorting array means that sorting was cleared.
The optional `headerProps.onSortClick` callback reports the column key and
`"ASC"` or `"DESC"` when a direction is selected.

## Unified client and server query

Use one query object for page, page size, sorting and filters. A filter, sort
or page-size change resets the page to zero in the same `onQueryChange` call.
Column resizing/reordering/visibility do not change the query. Identical values
do not trigger another notification. The callback is for changes, not an
initial fetch: load data from an effect observing the query.

```tsx
import { useEffect, useState } from "react";
import { DynamicTable, type ITableQuery } from "@/tables-framework/components";

const [query, setQuery] = useState<ITableQuery>({
  page: 0, pageSize: 25, sorting: [], filters: [],
});
const [rows, setRows] = useState<User[]>([]);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [attempt, setAttempt] = useState(0);

useEffect(() => {
  const controller = new AbortController();
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users?query=" + encodeURIComponent(JSON.stringify(query)), {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unable to load users");
      const result = await response.json(); // { items: User[], totalItems: number }
      if (!controller.signal.aborted) {
        setRows(result.items);
        setTotal(result.totalItems);
      }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Request failed");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  void load();
  return () => controller.abort();
}, [query, attempt]);

<DynamicTable
  data={rows} columns={columns}
  dataMode="server" totalItems={total}
  query={query} onQueryChange={setQuery}
  pagination={{ enabled: true, limitOptions: [10, 25, 50] }}
  enableColumnFilters isLoading={loading} error={error}
  onRetry={() => setAttempt(value => value + 1)}
/>
```

Server mode renders the supplied rows in exactly their supplied order. It does
not filter, sort or slice the page a second time, including when sort entries
have `isServerSide: false`. The backend owns those operations and the matching
record count. Page numbers are zero-based; `totalItems` is the count before
pagination. Once loading finishes, a page beyond the supplied total is corrected
with a query update. The host owns fetching, cancellation and stale-response
protection; the table does not send network requests.

For client processing keep `dataMode="client"` (the default) and supply all rows.
Use `defaultQuery` instead of `query` for internal state with an optional
`onQueryChange` observer. `query` is controlled: update it in the callback.
Legacy `pagination.controlled`, `pagination.serverSide`, `layout` and
`onLayoutChange` retain their behavior when unified query props are not used.
Do not mix two controlled query sources. The existing server-side pagination
option alone skips slicing; use the new server mode to delegate all operations.

## Filtering

The table supports per-column filtering. Text search ignores case in both the
cell content and the search query. For example, `MARCO` matches `Marco`.

### Enable Filtering

1. Set `enableColumnFilters={true}` on the `DynamicTable`.
2. Configure `filterConfig` on specific columns.

```typescript
{
  id: "role",
  filterConfig: {
    type: "select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" }
    ]
  }
}
```

Supported filter types: `text` | `number` | `select` | `date`.

Number filters use numeric equality and support zero, negative numbers, and
decimals. Clearing the input removes the filter; invalid or non-finite numbers
do not replace the current filter.

## Virtualization

For thousands of loaded records without pagination, enable `virtualization`.
Only the visible rows and an overscan buffer mount their React components.
The feature is opt-in on both `DynamicTable` and `Table`.

```tsx
<DynamicTable
  data={rows}
  columns={columns}
  maxHeight={500}
  virtualization={{ rowHeight: 48, overscan: 5 }}
  stripedRows
  enableColumnFilters
/>
```

| Setting | Default | Meaning |
| :--- | :--- | :--- |
| `height` | `maxHeight` on DynamicTable, otherwise `400` | Scroll viewport height in pixels or a CSS height such as `"60vh"`. |
| `rowHeight` | `48` | Estimated/default row height in pixels. Choose a value close to ordinary rows. |
| `overscan` | `5` | Extra mounted rows before and after the visible range. |

Actual row heights are measured with `ResizeObserver`, so wrapped text,
validation messages and expanded content can grow beyond the estimate. The
height estimate is also the default CSS row height; an explicit row `style`
can override it. Widths use fixed table layout to keep columns stable as their
content leaves the viewport. Set column widths for predictable sizing.

Filtering and sorting still process the complete dataset before windowing.
Changing the visible record sequence (filter, sort, page or replaced dataset)
resets scroll to the first record. Editing a value without changing the record
sequence preserves scroll. With pagination enabled, the current page is
virtualized; with server mode, only the supplied server page is available.
Virtualization does not fetch records or eliminate the cost of parsing,
filtering or sorting large arrays.

Selection and export operate on the complete processed body, including
unmounted rows. Alternating colors, `getRowStyle` indices and `aria-rowindex`
use the full body index. `aria-rowcount` includes all loaded body rows plus
headers and any enabled footer; spacer rows are hidden from accessibility APIs.
`getRowStyle` should be pure, as it runs when a row enters the mounted window.

Focused rows and built-in editors with unsaved drafts, validation errors or
pending saves stay mounted outside the window until they can safely leave it.
They add a small number of rows beyond the overscan buffer. Other local state
in custom cells should be stored by stable record ID outside the cell if it
must survive unmounting. Use stable, unique IDs via `idKey` as with normal tables.

Custom rows must produce a top-level `<tr>` and forward `style`,
`data-virtual-row`, `data-virtual-index` and `aria-rowindex` to it. Custom table
components should avoid an additional scroll container: the virtual viewport
owns scrolling in both directions. Cross-row `rowSpan` layouts are not
supported. Use a constrained viewport height; percentage heights require a
parent with a defined height.

The **Virtualizzazione** demo uses 10,000 records, variable heights, fixed
columns, selection, filtering and editable quantities without pagination.

## Pagination

Client-side pagination runs after filtering and sorting the complete dataset. The
item and page counts reflect the filtered results. If filtering or removing data
makes the current page unavailable, the table moves to the last available page
(page zero when there are no results). In controlled mode, this correction is
reported through `controlled.onPageChange` and `onPaginationChange`.

With `serverSide.enabled`, the table uses the supplied page and
`serverSide.totalItems` without applying client-side pagination.

### Configuration

Pass a `pagination` object to the `DynamicTable`.

```typescript
pagination={{
  enabled: true,
  limit: 10,                 // Default page size
  limitOptions: [5, 10, 25], // Page size options
  position: "bottom",        // "top" | "bottom"
  alignment: "right",        // "left" | "center" | "right"
  onPaginationChange: ({ limit, offset }) => {
    // Callback for server-side handling or sync
  }
}}
```

### Persistence

You can persist pagination state (page number, limit) to `localStorage` automatically.

```typescript
pagination={{
  // ...
  persistence: {
    enabled: true,
    key: "my-table-id",      // Unique key for storage
    storage: "localStorage", // or "sessionStorage"
    persistLimit: true,
    persistPage: true
  }
}}
```

## Row Selection

### Modes

- **Single/Multi**: Handled by the check of checkboxes.
- **Select All**: Use the header checkbox of a `type: "checkbox"` column.

### Configuration

Add a column with `type: "checkbox"`.

```typescript
{
  id: "select",
  type: "checkbox",
  fixed: true,
  headerProps: { showHeaderCheckbox: true } // Enables "Select All"
}
```

Listen to changes:

```tsx
<DynamicTable
  // ...
  onRowSelectionChange={(selectedRows) => console.log(selectedRows)}
/>
```

## Column Management

Resizing, hiding, and reordering columns preserve active filters, sorting, and
pagination. External layout changes update only the sections that changed.

### Resizing

Enable globally: `isResizable={true}`.
Or per-column in `IColumnConfig`: `isResizable: true/false`.

### Reordering (Drag & Drop)

Enable globally: `enableColumnReorder={true}`.
Users can drag headers to reorder columns.

### Hiding

1. Enable globablly: `enableColumnHiding={true}` (shows eye icon in header).
2. Use the **Columns Configuration Modal**:
   - Enable `enableColumnConfig={true}`.
   - Shows a settings button that opens a modal to reorder and toggle visibility of columns.

### Example: Full Feature Set

```tsx
<DynamicTable
  data={data}
  columns={columns}
  enableColumnReorder={true}
  enableColumnConfig={true}
  enableColumnFilters={true}
  pagination={{
    enabled: true,
    limit: 25,
    persistence: { enabled: true, key: "users-table" },
  }}
/>
```
