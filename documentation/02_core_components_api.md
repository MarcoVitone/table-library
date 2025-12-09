# Core Components API

## 1. `DynamicTable`

The `DynamicTable` is the primary component for rendering tables. It accepts a generic type `T` representing the shape of the data objects.

### Props

| Prop                   | Type                    | Required | Description                                                  |
| :--------------------- | :---------------------- | :------- | :----------------------------------------------------------- |
| `columns`              | `IColumnConfig[]`       | Yes      | Array of column definitions.                                 |
| `data`                 | `T[]`                   | Yes      | Array of data objects to display.                            |
| `pagination`           | `IPaginationConfig`     | No       | Configuration for pagination features.                       |
| `infiniteScroll`       | `IInfiniteScrollConfig` | No       | Configuration for infinite scrolling.                        |
| `onRowSelectionChange` | `(data: T[]) => void`   | No       | Callback fired when row selection changes.                   |
| `...tableProps`        | `ITableProps`           | No       | Additional props passed to the underlying `Table` component. |

## 2. Column Configuration (`IColumnConfig`)

Each object in the `columns` array allows you to configure how a specific column is rendered and behaves.

### Interface

```typescript
interface IColumnConfig {
  id: string; // Unique identifier for the column
  label: string; // Header label associated with the column
  dataKey?: string; // Key to access data in the row object (e.g., 'user.name')
  type?: "text" | "action" | "checkbox" | "date" | "number" | "status"; // Cell type
  width?: string; // CSS width (e.g., '100px', '20%')
  headerProps?: TUserBaseCellProps; // Props passed to the Header Cell
  bodyProps?: TUserBaseCellProps; // Props passed to the Body Cell
  component?: ElementType; // Custom component to render for the body cell
  queryParam?: string; // Query parameter key for server-side operations
  onHeaderClick?: (dataKey: string) => void; // Callback when header is clicked
}
```

### Cell Types

The `type` property determines the default component used for rendering the cell:

- **`text`** (Default): Renders the value as a string.
- **`checkbox`**: Renders a checkbox (automatically handled if `type` is 'checkbox').
- **`date`**: Formats the value as a date.
- **`number`**: Formats the value as a number.
- **`status`**: Expects a status string and renders a styled badge.
- **`action`**: Use for action buttons (edit, delete) - requires a custom component or specific data structure.

## 3. Pagination Configuration (`IPaginationConfig`)

Configuration object for the `pagination` prop.

| Property             | Type                                             | Default           | Description                                |
| :------------------- | :----------------------------------------------- | :---------------- | :----------------------------------------- |
| `enabled`            | `boolean`                                        | `false`           | Enable/disable pagination.                 |
| `limit`              | `number`                                         | `10`              | Number of items per page.                  |
| `limitOptions`       | `number[]`                                       | `[5, 10, 25, 50]` | Options for the "Items per page" dropdown. |
| `position`           | `'top' \| 'bottom'`                              | `'bottom'`        | Position of the pagination controls.       |
| `alignment`          | `'left' \| 'center' \| 'right'`                  | `'right'`         | Alignment of the pagination controls.      |
| `onPaginationChange` | `(p: { limit: number; offset: number }) => void` | -                 | Callback when page or limit changes.       |

## 4. Common Types (`common.types.ts`)

Key shared type definitions used across the framework.

- **`ISorting`**: `{ key: string; dir: "asc" | "desc"; isServerSide: boolean; }`
- **`IFilter`**: `{ key: string; op: "eq" | "ne" | ...; val: any; }`
- **`IPagination`**: `{ limit: number | null; offset: number; ... }`
