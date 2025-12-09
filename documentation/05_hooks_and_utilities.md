# Hooks & Utilities

## 1. Hooks

### `useTable`

The `useTable` hook provides access to the table's internal state and context. It must be used within a component that is a child of the `TableContext.Provider` (effectively inside the `DynamicTable`).

#### Return Value (`TFullTableAPI`)

```typescript
const {
  sorting, // Current sorting state
  setSorting, // Function to update sorting
  filtering, // Current filtering state
  setFiltering, // Function to update filtering
  pagination, // Current pagination state
  setPagination, // Function to update pagination
  rowsStatus, // Status of all rows (selection, etc.)
  setRowsStatus, // Function to update row status
  selectedRows, // Array of currently selected rows
  selectAllRows, // Function to select all rows
  clearSelectedRows, // Function to deselect all rows
  exportCSV, // Function to trigger CSV export
  // ... other API methods
} = useTable();
```

### `usePaginationPersistence`

A hook to persist pagination state (page number and limit) to `localStorage` or `sessionStorage`. This is used internally by `DynamicTable` if the `persistence` option is enabled, but can be used standalone.

#### Options

```typescript
interface IUsePaginationPersistenceOptions {
  enabled: boolean;
  key: string; // Unique key for storage
  storage?: "localStorage" | "sessionStorage";
  persistLimit?: boolean;
  persistPage?: boolean;
}
```

## 2. Utilities

The framework includes several utility modules to assist with data manipulation.

### `FilterUtils`

Helper functions for filtering data arrays.

- **`filterData(data, filters)`**: Returns filtered data based on an array of filter objects.

### `ArrayUtils`

Utilities for array operations.

### `ObjectUtils`

Utilities for object manipulation, deep cloning, etc.

### `totalAggregator`

A helper to calculate totals for a column.
