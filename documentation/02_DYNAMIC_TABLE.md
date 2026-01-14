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

#### `IBorderConfig` Interface

```typescript
interface IBorderConfig {
  show?: boolean;      // Enable border
  color?: string;      // Border color (hex, rgb, etc.)
  width?: string;      // Border width (e.g. "1px")
  style?: "solid" | "dashed" | "dotted" | ...; // Border style
}
```

### Events

| Prop                   | Type                                    | Description                                                  |
| :--------------------- | :-------------------------------------- | :----------------------------------------------------------- |
| `onDataChange`         | `(newData: T[], updatedRow: T) => void` | Triggered when a cell value is edited (e.g., via InputCell). |
| `onRowSelectionChange` | `(selectedData: T[]) => void`           | Triggered when row selection changes.                        |
| `onRowDoubleClick`     | `IRowNavigationConfig`                  | Configuration for row double-click actions.                  |

## Configuration Details

### Data (`data`)

The `data` prop accepts a simple array of objects. It is recommended that each object has a unique identifier (e.g., `id` or `_id`) for correct row handling.

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
