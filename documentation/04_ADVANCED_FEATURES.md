# 4. Advanced Features

This section explores the powerful built-in features of the `DynamicTable`.

## Sorting

Sorting is handled client-side by default.

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

If you need server-side sorting, you should manage the sort state externally and update the `data` prop accordingly. The table emits sort events (to be implemented via `onSortChange` in future versions, currently mostly handled internal or via custom interaction hooks).

## Filtering

The table supports per-column filtering.

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

## Pagination

The table comes with a robust pagination system.

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
