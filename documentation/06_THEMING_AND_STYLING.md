# 6. Theming and Styling

The table framework uses native HTML controls, scoped CSS, and its own React theme context. Material UI and Emotion are not required.

## Borders

You can customize the borders of the header and the body independently using `IBorderConfig`.

### `IBorderConfig` Interface

```typescript
interface IBorderConfig {
  show?: boolean; // Enable/Disable border
  color?: string; // Border color (hex, rgb, etc.)
  width?: string; // Border width (e.g. "1px", "2px")
  style?: "solid" | "dashed" | "dotted"; // CSS border-style
}
```

### Usage

```tsx
<DynamicTable
  // ...
  // Grid effect: Show borders on both header and body
  headerBorder={{ show: true, color: "#ccc", width: "1px" }}
  bodyBorder={{ show: true, color: "#ccc", width: "1px" }}
  // Outer container border
  externalBorderColor="#000"
/>
```

Note: These settings typically control the **bottom** and **right** borders of cells to create a grid. To customize specific sides per-column, use `headerProps` and `bodyProps` in your Column Config.

## Colors

### Selected Rows

Customize the background color of selected rows:

```tsx
<DynamicTable
  rowSelectedColor="rgba(0, 73, 135, 0.1)" // A soft blue
  // ...
/>
```

### Native theme

Import the provider from the table framework. The default theme works without a provider.

```tsx
import { ThemeProvider, createTheme } from "@/tables-framework/theme/theme";

const theme = createTheme({
  palette: {
    primary: { main: "#6b277e", dark: "#6b277e" },
    background: { paper: "#ffffff" },
  },
  typography: { fontFamily: "Arial, sans-serif" },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <MyTable />
  </ThemeProvider>
);
```

Partial palette and typography objects are merged with defaults. Each theme is independent; creating or editing one does not mutate another. The palette retains primary, secondary, error, info, success, warning, neutral, blue, green, text, background, and divider entries.

Native dialogs and autocomplete option lists keep this theme when rendered through a portal. The components also set local CSS variables: `--table-primary`, `--table-surface`, and `--table-text`.

### Migrating from Material UI

The public table, column, filtering, sorting, selection, pagination, editing, and layout props are unchanged. TableButton retains its variations, variant, color, size, icons, disabled state, className, style, and HTML/ARIA attributes. Checkbox callbacks retain `onChange(event, checked)`. Status chips retain labels, colors, icons, and delete callbacks.

Use the framework's ThemeProvider in place of the Material provider for these components. Existing palette and typography values can be reused. Material-specific `components.Mui*` overrides, `.Mui*` CSS selectors, ripple effects, and arbitrary Material slot components are not implemented by the native UI.

The compatibility `sx` prop accepts flat CSS properties and spacing shorthands (`m`, `mx`, `my`, `p`, `px`, `py`, and their directional variants). Numeric shorthand spacing uses 8px units. Nested selectors, responsive arrays, theme callback functions, and Material palette paths in `sx` should be converted to a CSS class, a normal `style` object, or native theme values.

Internal CSS uses the `tbl-` prefix and is imported with the components. Ensure your bundler includes CSS imports when consuming the source. There is no application-wide CSS reset. Icons can be any React node, including your own SVGs.

### Browser behavior

Column settings and filters use the native `dialog` element with Escape handling, keyboard focus cycling, and focus restoration. Autocomplete uses a text input and an ARIA listbox, supports string/object options, arrow keys, Enter, Escape, clearing, and `disableClearable`. Expanded rows use native `details` and `summary` elements. Use browsers with native dialog/showModal support; browser checks currently run on Chromium.

## Layout & Sizing

### Fixed Widths

Columns can have fixed widths.

```typescript
{
  id: "actions",
  width: "100px" // Fixed width
}
```

### Resizing

If `isResizable={true}` is set on the table (or column), users can adjust these widths. The table handles the `table-layout: fixed` behavior to ensure cells respect these dimensions.

### Sticky Headers

Pass `maxHeight` and `stickyHeader={true}` to create a scrollable area with a fixed header.

```tsx
<DynamicTable
  maxHeight={600} // px
  stickyHeader={true}
/>
```
