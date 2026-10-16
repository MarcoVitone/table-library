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
- **Virtualization**: Optional row windowing with measured heights for large loaded datasets.
- **Saved Views**: Named filters, sorting, column layouts, search and page size with browser or controlled persistence.
- **Bulk Actions**: Typed actions on selected records, with async pending/error feedback.

## 📚 Documentation

Detailed documentation is available on GitHub and included in the package's `documentation/` folder:

1.  [**Introduction**](https://github.com/MarcoVitone/table-library/blob/main/documentation/01_INTRODUCTION.md) - Installation and Quick Start.
2.  [**DynamicTable Component**](https://github.com/MarcoVitone/table-library/blob/main/documentation/02_DYNAMIC_TABLE.md) - Core component API and props.
3.  [**Column Configuration**](https://github.com/MarcoVitone/table-library/blob/main/documentation/03_column_configuration.md) - How to define columns and use different cell types.
4.  [**Advanced Features**](https://github.com/MarcoVitone/table-library/blob/main/documentation/04_ADVANCED_FEATURES.md) - Sorting, Filtering, Pagination, and Column Management.
5.  [**Hooks**](https://github.com/MarcoVitone/table-library/blob/main/documentation/05_HOOKS.md) - Programmatic control via `useTable`.
6.  [**Theming and Styling**](https://github.com/MarcoVitone/table-library/blob/main/documentation/06_THEMING_AND_STYLING.md) - Customizing borders, colors, and layouts.
7.  [**Practical Examples**](https://github.com/MarcoVitone/table-library/blob/main/documentation/07_EXAMPLES.md) - Copy-pasteable code examples.

## 📦 Quick Start

```tsx
import { DynamicTable, type IColumnConfig } from "fabulous-table-library";
import "fabulous-table-library/style.css";

const MyTable = () => {
  const data = [{ id: 1, name: "Hello World" }];
  const columns: IColumnConfig<{ id: number; name: string }>[] = [
    { id: "name", label: "Title", dataKey: "name", type: "text" },
  ];

  return <DynamicTable data={data} columns={columns} />;
};
```

## 🛠️ Development

This project uses **React** + **TypeScript** + **Vite**. Its UI uses native HTML, scoped CSS, and SVG icons; Material UI and Emotion are not required.

See [Theming and migration notes](https://github.com/MarcoVitone/table-library/blob/main/documentation/06_THEMING_AND_STYLING.md) for the native theme provider and Material-specific styling differences.

```bash
npm install
npm run dev
```

## Upgrading to 2.0

Date cells now use native JavaScript `Date` and `Intl.DateTimeFormat`. The
default remains `dd/MM/yyyy` in `Europe/Rome`. Common format patterns are
supported; the complete token syntax of the previous formatter is no longer
available. You can also pass native formatting options, `locale` and `timeZone`.

Strings follow JavaScript date parsing. Prefer ISO 8601 with an explicit offset
for instants, timestamps in milliseconds, or `Date` objects. ISO date-only
strings are parsed at midnight UTC; date-time strings without an offset use
the host's local timezone. Use text or custom cells for values already formatted
by your application. See
[date cell configuration](https://github.com/MarcoVitone/table-library/blob/main/documentation/03_column_configuration.md#7-date)
for supported tokens and examples.

## License

MIT. See [LICENSE](https://github.com/MarcoVitone/table-library/blob/main/LICENSE).
