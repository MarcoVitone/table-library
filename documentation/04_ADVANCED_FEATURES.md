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
