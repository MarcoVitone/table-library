# 6. Theming and Styling

The table framework is designed to integrate seamlessly with **Material UI (MUI)**. It respects the global theme while offering granular control via props.

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

### Theme Integration

The components use the MUI `Theme` access. For example, the `StatusCell` and generic text cells will try to use palette colors if configured.

If you are using a custom theme, ensure your `ThemeProvider` wraps the application.

```tsx
import { ThemeProvider } from "@mui/material/styles";
import { defaultTheme } from "@/tables-framework/theme/theme";

const App = () => (
  <ThemeProvider theme={defaultTheme}>
    <MyTable />
  </ThemeProvider>
);
```

#### Custom Palette

The library's internal theme extends the standard MUI palette with:

- `neutral`: Grayscales for text and backgrounds.
- `blue`, `green`: Custom primary/secondary variations.

You can override these in your own theme creation if you want to change the library's default look globally.

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
