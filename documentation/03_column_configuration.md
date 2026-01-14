# 3. Column Configuration

The `columns` prop is the backbone of the `DynamicTable`. It defines what data to show, how to render it, and how users can interact with it.

Each object in the array must subscribe to the `IColumnConfig` interface.

## The `IColumnConfig` Interface

Here are the main properties you can configure for a column:

```typescript
interface IColumnConfig<T> {
  // Core
  id: string;               // Unique ID for the column
  label: string;            // Header label
  dataKey?: string;         // key in the data object to extract value from
  width?: string;           // Fixed or min width (e.g. "200px", "10rem")

  // Functionality
  type?: "text" | "number" | "date" | "status" | "action" | "input" | ...;
  fixed?: boolean;          // If true, the column is sticky on the left
  sortable?: boolean;       // Enable sorting (via headerProps)
  filterConfig?: IFilterConfig; // Enable column-specific filters

  // Customization
  headerProps?: TUserBaseCellProps; // Props for the header cell
  bodyProps?: TUserBaseCellProps;   // Props for the body cell
  component?: ElementType;          // Custom React Component for the cell
}
```

## Supported Cell Types

Depending on the `type` property, the column accepts specific additional configurations.

### 1. Text (Default)

Renders a string. Supports links.

- **Config**:
  ```typescript
  link?: {
    types: "native" | "react-router" | "nextjs";
    to: (row: T) => string;
    target?: "_blank" | "_self";
  }
  ```

### 2. Status

Renders a colored chip/badge based on a value ID.

- **Config**: `statusConfig: TStatusConfig`
- **Definition**:
  ```typescript
  type TStatusConfig = Record<
    string | number,
    {
      label?: string;
      backgroundColor: string;
      textColor: string;
      iconColor?: string;
      iconChip?: ReactElement;
    }
  >;
  ```
- **Example**:
  ```typescript
  const statusConfig = {
    active: {
      label: "Active",
      backgroundColor: "#e6fffa",
      textColor: "#007f5f",
    },
    inactive: {
      label: "Inactive",
      backgroundColor: "#fff5f5",
      textColor: "#c53030",
    },
  };
  ```

### 3. Action

Renders a set of buttons/icons for operations (Edit, Delete, etc.).

- **Pass Actions via `bodyProps`**:
  ```typescript
  bodyProps: {
    actions: [
      {
        icon: <EditIcon />,
        label: "Edit",
        onAction: (item) => console.log("Edit", item),
      },
      {
        icon: <DeleteIcon />,
        label: "Delete",
        component: "button", // Renders a Button instead of IconButton
        variant: "contained",
        color: "error",
        onPrompt: () => confirm("Are you sure?"),
        onAction: (item) => performDelete(item.id),
      },
    ];
  }
  ```

### 4. Input

Renders an editable input field.

- **Config**:
  - `inputType`: `"text" | "number" | "date" | "email"`
  - `onCellChange`: `(val, cellConfig) => void`
- **Example**:
  ```typescript
  {
    type: "input",
    inputType: "text",
    onCellChange: (val, cell) => updateData(cell.row.id, val)
  }
  ```

### 5. Currency

Formats numbers as currency.

- **Config**:
  - `currencySymbol`: e.g. `"€"`, `"$"`
  - `symbolPosition`: `"left" | "right"`
  - `decimals`: number (default 2)

### 6. Autocomplete

Renders a selectable dropdown (Combobox).

- **Config**:
  - `autocompleteOptions`: Array of strings or objects.
  - `getOptionLabel`: Function to derive the label from an option.
  - `isOptionEqualToValue`: Function to compare matching options.
  - `disableClearable`: Prevent clearing the selection.

### 7. Date

Formats a date string/object (requires `date-fns` integration if utilizing built-in helpers, or passes raw if custom). Defaults to standard locale formatting.

## Header & Body Props

`headerProps` and `bodyProps` allow you to inject styles and standard overrides into the underlying `BaseCell`.

Common properties:

- `textAlignment`: `"left" | "center" | "right"`
- `textTransform`: `"uppercase" | "capitalize" | ...`
- `backgroundColor`
- `fontColor`
- `fontSize`
- `padding`
- `borderRight`, `borderBottom`: Override global table borders for specific cells/areas.

## Custom Components

If built-in types aren't enough, use `type: "custom"` and provide a `component`.

```typescript
const MyCustomCell = ({ data }) => (
  <div style={{ fontWeight: 'bold' }}>
    Prefix: {data.value}
  </div>
);

// In column config:
{
  id: "customCol",
  type: "custom",
  component: MyCustomCell
}
```
