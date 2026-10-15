# 3. Column Configuration

The `columns` prop is the backbone of the `DynamicTable`. It defines what data to show, how to render it, and how users can interact with it.

Each object in the array must subscribe to the `IColumnConfig` interface.

## The `IColumnConfig` Type

`IColumnConfig<T>` is a union of the supported cell types. This example shows
shared styles and the settings specific to a numeric editor:

```typescript
const columns: IColumnConfig<User>[] = [{
  id: "age",
  label: "Age",
  dataKey: "age",
  type: "input",
  inputType: "number",
  width: "120px",
  minWidth: 80,
  isResizable: true,
  headerProps: { sortable: true },
  bodyProps: { textAlignment: "right" },
}];
```

With resizing enabled, dragging the right edge changes the column width in both
directions. Header and body stay aligned, and the other columns keep their
current widths. The configured `minWidth` is respected (50 pixels by default).

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

`dataKey` supports nested objects and arrays, such as `profile.name` and
`items[0].name`. With `DynamicTable`, edits are reported through `onDataChange`
using a new data array and updated row. Objects and arrays along the edited
path are copied; the original row and unrelated branches remain unchanged.
Numeric inputs commit finite numbers; clearing them commits an empty string.
Input and autocomplete cells also reflect values updated by their parent.

- **Config**:
  - `inputType`: `"text" | "number" | "date" | "email"`
  - `editable`: boolean or row predicate.
  - `validate`: error message or no error for a candidate value.
  - Use table `onDataChange` to receive accepted changes.
- **Example**:
  ```typescript
  {
    id: "name",
    label: "Name",
    dataKey: "profile.name",
    type: "input",
    inputType: "text",
    validate: value => String(value).trim() ? undefined : "Name is required",
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

### Column type inference

`IColumnConfig<T>` is a discriminated union keyed by `type`. Common styles are
available everywhere. Each `bodyProps` also exposes the props of its own cell:
`actions` for action columns, `format` for dates, `labelKey` for status cells,
and editor settings for input/autocomplete cells. Action callbacks receive `T`.

```tsx
const columns = [
  { id: "name", label: "Name", type: "input", inputType: "text" },
  { id: "actions", label: "Actions", type: "action", bodyProps: {
    actions: [{ label: "Open", component: "button", onAction: user => openUser(user.id) }],
  } },
] satisfies IColumnConfig<User>[];
```

Prefer an explicit annotation or `satisfies IColumnConfig<User>[]` so literal
column types stay narrow. Currency settings on text columns and actions on
input columns now produce compiler errors. Custom columns require `component`
and can pass additional settings through `bodyProps`. `IColumnConfig` remains
importable from its existing path, but is now a type alias; compose extensions
with an intersection instead of `interface extends IColumnConfig`.

The table owns editor `onCellChange`; use `onDataChange` to receive edits.
Type-specific settings may be provided at column level where supported or in
`bodyProps`; explicit column-level values take priority.

### Validation and saving

Input and autocomplete columns accept `editable` (a boolean or row predicate)
and `validate(value, row)` (a synchronous error message, `null` or `undefined`).
Both receive the original row object, including nested data. An invalid edit
does not call `onDataChange`. Errors are displayed beside the editor and linked
with `aria-invalid`/`aria-describedby`.

```tsx
const columns: IColumnConfig<User>[] = [{
  id: "name", label: "Name", dataKey: "profile.name", type: "input",
  editable: user => !user.locked,
  validate: value => String(value).trim() ? undefined : "Name is required",
}];

<DynamicTable data={users} columns={columns} onDataChange={async (_next, updated) => {
  await saveUser(updated); // Throw/reject to show the error in the editor.
  setUsers(previous => previous.map(user => user.id === updated.id ? updated : user));
}} />
```

Enter or leaving an input commits it. Escape restores its source value without
committing. Autocomplete commits a selection/clear; Escape restores a rejected
selection. While a returned save promise is pending the editor is disabled and
shows `Salvataggio…`; repeated submissions are ignored and other built-in editors
on the same row are read-only until it completes. A rejected save leaves
the draft available for correction or retry. Apply remote data after success
and merge into current state as above when multiple rows can save concurrently.
Escape cancels a draft; it does not cancel an in-flight backend request.

Validators operate on converted values: numeric input emits finite numbers,
clearing emits `""`, and autocomplete preserves objects or `null`. Built-in
input validity (for example email syntax) is checked before committing.
Custom editor components receive the editing callback and implement their own
validation and feedback.

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

### Missing dates and fixed columns

Date cells render an empty value for missing, blank or invalid dates; valid
values, including timestamp zero, keep the configured format and timezone.

Set `fixed: true` on each column that should remain sticky on the left.
The flag stays attached to that column when it is reordered. Offsets follow
the current visual order of visible fixed columns; hidden columns take no space.
