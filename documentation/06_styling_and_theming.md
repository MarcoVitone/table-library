# Styling & Theming

The framework is built using **Material UI (MUI)** and leverages its theming system. It includes a custom theme configuration that extends the default MUI palette.

## 1. Theme Configuration

The theme is defined in `src/tables-framework/theme/theme.ts`. It customizes:

- **Palette**: Adds custom colors (`blue`, `neutral`, `green`) and extends existing ones with `ultraLight` and `border` properties.
- **Typography**: Sets "Noto Sans" as the default font family.
- **Components**: Overrides default styles for `MuiButton`, `MuiChip`, `MuiTab`, etc.

### Extended Palette

To support the custom design system, the MUI types are extended in `extended-theme.module.ts`.

```typescript
interface PaletteColor {
  ultraLight?: string;
  border?: string;
}
// Usage
theme.palette.neutral.border;
theme.palette.blue.ultraLight;
```

## 2. Styling Components

- **Styled Components**: The framework uses `@emotion/styled` (or MUI's `styled` utility) for component-level styling.
- **CSS Modules**: Some components may use standard CSS/SCSS (e.g., `App.css`), but the core framework relies heavily on MUI's JS-in-CSS solution.

## 3. Customizing the Look

To customize the table's appearance in your application:

1.  **Theme Provider**: Ensure your app is wrapped in a `ThemeProvider` passing the `defaultTheme` (or your override).
2.  **Class Names**: Most components accept a `className` prop for CSS overrides.
3.  **Slots**: Use the `slots` prop in `DynamicTable` or `Pagination` to replace entire sub-components with your own implementation.
