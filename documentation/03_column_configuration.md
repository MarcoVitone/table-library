# Column Configuration

The `columns` prop in the `DynamicTable` is the central place for defining how your table looks and behaves. Each object in the `columns` array represents one column.

## Column Definition Object

```typescript
export interface IColumnConfig {
  id: string;
  label: string;
  dataKey?: string;
  type?: "text" | "action" | "checkbox" | "date" | "number" | "status";
  width?: string;
  headerProps?: TUserBaseCellProps;
  bodyProps?: TUserBaseCellProps;
  component?: ElementType;
  queryParam?: string;
  onHeaderClick?: (dataKey: string) => void;
}
```

### Key Properties

- **`id`**: Unique identifier for the column.
- **`label`**: The text displayed in the header.
- **`dataKey`**: The property name in your data object to bind to this column.
- **`width`**: Defines the column width (e.g., `"20%"`, `"150px"`).
- **`type`**: Specifies the type of cell to render (see [Cell Types](#cell-types)).
- **`component`**: Allows rendering a completely custom React component for this column's cells.

## Cell Types

The framework provides several built-in cell types to handle common data formats.

### 1. Text Cell (`type: "text"` or undefined)

The default cell type. Renders the data value directly as a string.

### 2. Checkbox Cell (`type: "checkbox"`)

Renders a checkbox for row selection.

- **Config**: Usually acts as the first column.
- **Behavior**:
  - Header checkbox: Selects/Deselects all rows.
  - Body checkbox: Selects/Deselects the individual row.
- **Note**: Requires `onRowSelectionChange` on `DynamicTable` to function.

### 3. Sorting Cell

Used in the header to enable sorting.

- **Icon**: Displays a sort arrow (up/down).
- **Interaction**: Clicking the header toggles the sort direction.
- **Props**:
  - `isServerSide`: Boolean to indicate if sorting triggers a server request.

### 4. Status Cell (`type: "status"`)

Renders a status badge. Useful for displaying states like "Active", "Pending", "Error".

### 5. Date Cell (`type: "date"`)

Formats a date string or object into a readable date format.

### 6. Number Cell (`type: "number"`)

Formats numeric values.

### 7. Action Cell (`type: "action"`)

Used for action buttons (e.g., Edit, Delete) for a row.

## Custom Header Configuration

You can customize the header cell by passing props via `headerProps` or providing a custom `onHeaderClick` handler.

### Sorting in Header

To enable sorting for a column, you typically don't set a `type` of "sorting" directly in `IColumnConfig`. Instead, the `DynamicTable` logic (or `SortingCell` usage in `headerProps`) handles it. _Note: Clarify implementation details based on `SortingCell` usage._

_Correction based on code inspection_: The `SortingCell` is a specific cell component. In the standard `DynamicTable` implementation seen, `HeaderCell` seems to handle the composition. If you want a column to be sortable, ensure you are using the correct header component or props.

**Example: sortable column**

```typescript
{
  id: "name",
  label: "Name",
  dataKey: "name",
  // Usage depends on table implementation specifics
}
```

(Note: The explored code shows `SortingCell` exists but `DynamicTable` uses `HeaderCell` which wraps `cell`. `HeaderCell` logic for auto-enabling sorting wasn't explicitly seen in `DynamicTable` map loop other than passing `headerProps`. You might need to explicitly pass `SortingCell` or props to enable it if it's not automatic.)

## Custom Body Component

For complex requirements, use the `component` property to pass a custom React component.

```tsx
const CustomUserCell = ({ data }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={data.avatar} alt="avatar" />
    <span>{data.name}</span>
  </div>
);

// In columns config
{
  id: "user",
  label: "User",
  component: CustomUserCell
}
```
