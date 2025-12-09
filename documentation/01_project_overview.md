# Project Overview & Architecture

## Introduction

The **Tables Framework** is a flexible and robust React library designed for rendering dynamic tables with advanced features such as sorting, filtering, pagination, selection, and infinite scrolling. It abstracts complex table logic into a set of reusable components and hooks, ensuring consistency and ease of use across the application.

## Directory Structure

The framework is organized into the following key directories within `src/tables-framework`:

- **`components/`**: Contains the core UI components.
  - `dynamic-table/`: The entry point component `DynamicTable`.
  - `table-parser/`: Components for parsing and rendering columns (`Column`, `HeaderCell`, `BodyCell`).
  - `table-renderer/`: The `TableRenderer` component responsible for the final table layout.
  - `cells/`: Reusable cell components (`BaseCell`, `CheckboxCell`, `StatusCell`, etc.).
  - `pagination/`: Pagination controls.
  - `infinite-scroll/`: Infinite scrolling implementation.
- **`hooks/`**: Custom hooks for table logic (`useTable`, `usePaginationPersistence`, `useChangeEvent`).
- **`utils/`**: Helper functions for data manipulation (`filter-utils`, `object-utils`, `array-utils`).
- **`defines/`**: Shared type definitions and constants.
- **`theme/`**: Theme configuration and styling utilities.

## Core Architecture

The framework operates on a **Configuration-Driven** approach. Instead of manually defining table headers and rows in every view, you provide a configuration array (`columns`) and a dataset (`data`).

### Key Components

### 1. `DynamicTable`

The `DynamicTable` component is the high-level wrapper that orchestrates the entire table functionality. It handles:

- **Column Configuration**: Maps the `columns` prop to specific cell components.
- **Data Processing**: Manage pagination, slicing data for the current view.
- **State Management**: Tracks current page, page size, and internal states.
- **Feature Integration**: Connects pagination, infinite scroll, and row selection logic.

**Example Usage:**

```tsx
<DynamicTable
  columns={columnsConfig}
  data={dataList}
  pagination={{ enabled: true, limit: 10 }}
  onRowSelectionChange={handleSelection}
/>
```

### 2. `TableParser` & `TableRenderer`

- **`TableParser`**: Responsible for interpreting the `columns` configuration. It determines which component to render for the header and body of each column.
- **`TableRenderer`**: Takes the parsed structure and renders the actual HTML `<table>` elements (or equivalent semantic divs), ensuring correct layout and styling.

### 3. Smart Cells

The framework includes a set of "Smart Cells" that handle common data types automatically:

- **`TextCell`** (Default): Renders simple text.
- **`checkbox`**: Renders a checkbox for row selection.
- **`action`**: Renders action buttons (edit, delete, etc.).
- **`status`**: Renders status badges with appropriate coloring.
- **`date`**: Formats and renders date strings.

## Data Flow

1.  **Input**: `DynamicTable` receives `data` (raw array) and `columns` (definitions).
2.  **Processing**:
    - If pagination is enabled (client-side), the data is sliced based on the current page and limit.
    - If server-side pagination is used, the data is expected to be pre-sliced.
3.  **Rendering**:
    - The `columns` config is iterated.
    - For each column, a `HeaderCell` is rendered.
    - For each row in the processed data, a `BodyCell` is rendered using the specified `component` or type.
