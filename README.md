# Table Library

A powerful, flexible, and completely data-driven React Table Library. Designed to handle complex scenarios with ease, offering a declarative configuration approach.

## 🚀 Key Features

- **Dynamic Columns**: Fully configurable columns via JSON-like structure.
- **Rich Cell Types**: Built-in support for Text, Number, Date, Status, Currency, Autocomplete, and Actions.
- **Advanced Filtering**: Per-column filtering with multiple operators.
- **Sorting**: Client-side and server-side support.
- **Pagination**: Built-in pagination with persistence capabilities (localStorage).
- **Sticky Headers & Columns**: Native support for freezing columns and headers.
- **Customizable**: Easy theming and support for custom cell components.

## 📚 Documentation

Detailed documentation is available in the `documentation/` folder:

1.  [**Introduction**](./documentation/01_INTRODUCTION.md) - Installation and Quick Start.
2.  [**DynamicTable Component**](./documentation/02_DYNAMIC_TABLE.md) - Core component API and props.
3.  [**Column Configuration**](./documentation/03_COLUMN_CONFIGURATION.md) - How to define columns and use different cell types.
4.  [**Advanced Features**](./documentation/04_ADVANCED_FEATURES.md) - Sorting, Filtering, Pagination, and Column Management.
5.  [**Hooks**](./documentation/05_HOOKS.md) - Programmatic control via `useTable`.
6.  [**Theming and Styling**](./documentation/06_THEMING_AND_STYLING.md) - Customizing borders, colors, and layouts.
7.  [**Practical Examples**](./documentation/07_EXAMPLES.md) - Copy-pasteable code examples.

## 📦 Quick Start

```tsx
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";

const MyTable = () => {
  const data = [{ id: 1, name: "Hello World" }];
  const columns = [
    { id: "name", label: "Title", dataKey: "name", type: "text" },
  ];

  return <DynamicTable data={data} columns={columns} />;
};
```

## 🛠️ Development

This project uses **React** + **TypeScript** + **Vite**.

```bash
npm install
npm run dev
```
