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

## Regression checks

Run `npm test` with Node.js 22.13 or newer after installing dependencies. The
suite includes isolated data tests and integration tests using real React, table
components, and hooks. It covers all demo renderings, pagination, filtering,
sorting, row identity, editing, and changes to externally supplied cell values.

`npm run test:unit` runs only the isolated data tests without application
dependencies. Integration tests use server rendering; browser layout, pointer
interactions, and client effects require a connected browser.

Run `npm run build` and `npm run lint` separately for TypeScript, bundling, and
lint checks once the application dependencies are installed.

## Browser checks with Playwright

Install the test runner and its dedicated Chromium browser once:

```bash
npm install --save-dev @playwright/test
npm run test:e2e:install
```

Run the browser tests:

```bash
npm run test:e2e
```

The configuration builds the app, starts a dedicated local production server on
port 4187, and runs 21 checks covering the nine demos, pagination, sorting,
text and numeric filtering, selection, repeated column resizing and minimum
widths, drag and drop, collapsing, column configuration, and custom actions.
The dedicated server stops when the suite finishes. Each test uses a fresh
browser context. Runtime JavaScript errors fail the test.

On failure, screenshots, video, and traces are stored in `test-results/`.
Open the HTML report with `npm run test:e2e:report`. Browser tests are separate
from `npm test`; installing Playwright is required before they can run.
