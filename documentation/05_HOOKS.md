# 5. Hooks: useTable

The `useTable` hook exposes the internal API of the `DynamicTable`. This allows you to control the table properties (filtering, sorting, selection) from outside the component, enabling the creation of custom toolbars or external controls.

## Usage

Ideally, you use `useTable` within a component that is a **child** of the table context. However, `DynamicTable` encapsulates the context. To access the API **outside** the table (e.g., a sibling toolbar), you typically pass `before` or `after` props to `DynamicTable`, which renders components **inside** the context.

### Example Structure

```tsx
const TableControls = () => {
  const { exportCSV, selectAllRows } = useTable();

  return (
    <div>
      <button onClick={exportCSV}>Download CSV</button>
      <button onClick={selectAllRows}>Select All</button>
    </div>
  );
};

// Main Component
<DynamicTable
  data={data}
  columns={columns}
  before={<TableControls />} // Rendered INSIDE the provider
/>;
```

## API Reference

The object returned by `useTable()` contains methods and state.

### Actions

| Method                               | Description                                       |
| :----------------------------------- | :------------------------------------------------ |
| `setFiltering((prev) => newFilters)` | Update active filters.                            |
| `setSorting((prev) => newSorting)`   | Update active sorting.                            |
| `setPagination((prev) => newPag)`    | Update pagination state.                          |
| `exportCSV()`                        | Trigger browser download of current data as CSV.  |
| `exportJSON()`                       | Trigger browser download of current data as JSON. |
| `selectAllRows()`                    | Select all visible rows.                          |
| `clearSelectedRows()`                | Deselect all rows.                                |
| `resetLayout()`                      | Reset column order and visibility to default.     |

### State Access

| Property       | Type          | Description                                        |
| :------------- | :------------ | :------------------------------------------------- |
| `selectedRows` | `T[]`         | Array of currently selected row objects.           |
| `filtering`    | `IFilter[]`   | Current active filters.                            |
| `sorting`      | `ISorting[]`  | Current active sorting rules.                      |
| `pagination`   | `IPagination` | Current pagination state (page, limit).            |
| `rowsStatus`   | `TRowsStatus` | Internal status mapping (selection, pinned state). |

## Advanced: Accessing Row/Cell Context

If `useTable` is called **inside a custom Cell component**, passing the `data` prop allows access to context specific to that row/column.

```tsx
const MyCell = ({ data }: IBaseCellProps) => {
  const { rowStatus, setRowStatus } = useTable(data);
  // rowStatus.isSelected checks if THIS specific row is selected
};
```
