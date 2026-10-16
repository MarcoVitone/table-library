# 1. Introduction

Welcome to the official documentation of **Table Library**, a powerful and flexible React solution for building dynamic data tables.

## Overview

**Table Library** solves common challenges in managing complex tables, offering:

- **Efficient rendering** for large datasets.
- **Declarative configuration** of columns.
- **Built-in features** such as sorting, filtering, pagination, and row selection.
- **Advanced customization** via custom components and theming systems.
- **Responsive design** with fixed columns and horizontal scrolling.

## Installation

To use the library in your React project, ensure you have the necessary dependencies installed.

### Install the published package

Install with React 19.2 or newer within React 19:

```bash
npm install fabulous-table-library
```

Import the stylesheet once in your application:

```typescript
import "fabulous-table-library/style.css";
```

The UI uses **React**, native HTML, and CSS. Material UI and Emotion are not required.
Dates use native JavaScript `Date` and `Intl.DateTimeFormat`; no date library is required.

For this repository, install the dependencies with:

```bash
npm install
```

## Quick Start

Here is a minimal example to render your first table.

### 1. Define Data

Prepare an array of objects representing the table rows.

```typescript
const myData = [
  { id: 1, name: "Mario Rossi", role: "Admin" },
  { id: 2, name: "Luigi Verdi", role: "User" },
];
```

### 2. Configure Columns

Define the column structure using the `IColumnConfig` interface.

```typescript
import { IColumnConfig } from "fabulous-table-library";

const myColumns: IColumnConfig[] = [
  {
    id: "name",
    label: "Name",
    dataKey: "name",
    type: "text",
  },
  {
    id: "role",
    label: "Role",
    dataKey: "role",
    type: "text",
  },
];
```

### 3. Render Component

Use the `DynamicTable` component by passing `data` and `columns`.

```tsx
import { DynamicTable } from "fabulous-table-library";

const MyTable = () => {
  return (
    <div style={{ height: "400px" }}>
      <DynamicTable data={myData} columns={myColumns} stickyHeader={true} />
    </div>
  );
};

export default MyTable;
```

With just these few steps, you have created a fully functional table with a fixed header!
