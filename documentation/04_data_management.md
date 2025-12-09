# Data Management & Features

This section covers how the framework handles large datasets and user interactions like sorting, filtering, and pagination.

## 1. Pagination

The framework supports both client-side and server-side pagination through the `pagination` prop on `DynamicTable`.

### Configuration (`IPaginationConfig`)

```typescript
interface IPaginationConfig {
  enabled?: boolean; // Enable pagination
  limit?: number; // Items per page
  limitOptions?: number[]; // Options for page size selector
  position?: "top" | "bottom"; // Control position
  alignment?: "left" | "center" | "right"; // Control alignment
  onPaginationChange?: (params: { limit: number; offset: number }) => void; // Callback
  // Customization
  visibility?: {
    showInfo?: boolean;
    showPageSizeSelector?: boolean;
    showPrevNext?: boolean;
    showFirstLast?: boolean;
    showPageNumbers?: boolean;
    showGoToPage?: boolean;
  };
}
```

### Modes

- **Client-Side**: If `serverSide` is not enabled, the `DynamicTable` automatically slices the `data` array based on the current page and limit.
- **Server-Side**: If configured, the table expects `data` to contain only the items for the current page. You must handle `onPaginationChange` to fetch new data.

### Sub-components

The `Pagination` component is modular and exposes sub-components for custom layouts using slots (`slots` prop):

- `PaginationInfoDisplay`: "1-10 of 100"
- `PageSizeSelector`: Dropdown for limit
- `NavButton`: Previous/Next buttons
- `PageNumbersList`: 1, 2, ..., 10
- `GoToPage`: Direct page input

## 2. Infinite Scroll

For continuous data loading, use the `infiniteScroll` configuration.

### Configuration (`IInfiniteScrollConfig`)

```typescript
interface IInfiniteScrollConfig {
  enabled: boolean;
  hasMore: boolean; // Is there more data to load?
  loadMore: () => void; // Function to load next batch
  isLoading?: boolean; // Loading state
  threshold?: number; // Pixel threshold to trigger load (default: 100)
  mode?: "auto" | "button"; // "auto" (scroll) or "button" (manual click)
  buttonText?: string;
  endMessage?: ReactNode; // Message when no more data
}
```

### Usage

```tsx
<DynamicTable
  // ...
  infiniteScroll={{
    enabled: true,
    hasMore: hasMoreData,
    loadMore: fetchNextPage,
    isLoading: isFetching,
  }}
/>
```

## 3. Sorting

Sorting is handled via the `SortingCell` or configured headers.

### Client-Side Sorting

(Implementation details depend on `useTable` or external state). Typically, you pass `onSort` callbacks or manage the data order before passing it to the table.

### Server-Side Sorting

Use `isServerSide: true` in your column sorting config. Listening to sort events allows you to trigger API calls with new sort parameters.

## 4. Filtering

The framework provides utility functions in `src/tables-framework/utils/filter-utils` to help with client-side filtering.

- **`filterData`**: A helper to filter an array of objects based on a set of criteria.

```typescript
const filtered = filterData(data, [
  { key: "name", op: "match", val: "John" },
  { key: "age", op: "gt", val: 21 },
]);
```

- **Operators supported**: `eq` (equal), `ne` (not equal), `gt` (greater than), `lt`, `gte`, `lte`, `match` (partial string match).

## 5. Selection

Row selection is enabled by adding a "checkbox" column.

```tsx
<DynamicTable
  columns={[{ type: "checkbox", id: "select" }, ...cols]}
  onRowSelectionChange={(selectedRows) => console.log(selectedRows)}
/>
```
