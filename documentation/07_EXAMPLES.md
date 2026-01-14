# 7. Practical Examples

## Basic Table

A minimal example to get started.

```tsx
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";

const BasicTable = () => {
  const data = [
    { id: 1, name: "John Doe", role: "Developer" },
    { id: 2, name: "Jane Smith", role: "Designer" },
  ];

  const columns = [
    { id: "name", label: "Name", dataKey: "name", type: "text" },
    { id: "role", label: "Role", dataKey: "role", type: "text" },
  ];

  return <DynamicTable data={data} columns={columns} />;
};
```

## Complex Table

A comprehensive example demonstrating:

- Fixed columns (checkbox, name)
- Different cell types (Status, Action, Date, Currency, Autocomplete)
- Filtering, Pagination, and Column Configuration
- Custom Components

```tsx
import { useState, useMemo } from "react";
import { Check, Visibility, Edit, Delete } from "@mui/icons-material";
import {
  DynamicTable,
  IColumnConfig,
} from "@/tables-framework/components/dynamic-table/dynamic-table";
import { useTable } from "@/tables-framework/components";

const ComplexTable = () => {
  const [users, setUsers] = useState(MOCK_USERS);

  // 1. Define Custom Status Config
  const statusConfig = useMemo(
    () => ({
      1: { label: "Active", backgroundColor: "#e6fffa", textColor: "green" },
      2: { label: "Pending", backgroundColor: "#fffaf0", textColor: "orange" },
      3: { label: "Inactive", backgroundColor: "#fff5f5", textColor: "red" },
    }),
    []
  );

  // 2. Define Columns
  const columns: IColumnConfig[] = useMemo(
    () => [
      {
        id: "select",
        type: "checkbox",
        fixed: true,
        headerProps: { showHeaderCheckbox: true },
      },
      {
        id: "name",
        label: "Name",
        dataKey: "name",
        type: "text",
        fixed: true,
        headerProps: { sortable: true },
        filterConfig: { type: "text" },
      },
      {
        id: "role",
        label: "Role",
        dataKey: "role",
        type: "autocomplete",
        autocompleteOptions: ["Admin", "User", "Editor"],
        filterConfig: {
          type: "select",
          options: [{ label: "Admin", value: "Admin" }],
        },
      },
      {
        id: "status",
        label: "Status",
        dataKey: "statusId",
        type: "status",
        statusConfig: statusConfig,
      },
      {
        id: "salary",
        label: "Salary",
        dataKey: "salary",
        type: "currency",
        currencySymbol: "$",
        headerProps: { sortable: true },
      },
      {
        id: "actions",
        label: "Actions",
        type: "action",
        bodyProps: {
          actions: [
            {
              icon: <Visibility />,
              onAction: (row) => console.log("View", row),
            },
            { icon: <Edit />, onAction: (row) => console.log("Edit", row) },
            {
              icon: <Delete />,
              color: "error",
              onPrompt: () => confirm("Delete user?"),
              onAction: (row) => console.log("Deleted", row.id),
            },
          ],
        },
      },
    ],
    [statusConfig]
  );

  return (
    <DynamicTable
      data={users}
      columns={columns}
      maxHeight={600}
      stickyHeader={true}
      // Features
      enableColumnConfig={true}
      enableColumnHiding={true}
      enableColumnReorder={true}
      enableColumnFilters={true}
      // Styling
      headerBorder={{ show: true, color: "#ccc", width: "1px" }}
      bodyBorder={{ show: true, color: "#eee", width: "1px" }}
      // Events
      onDataChange={(newData) => setUsers(newData)}
      onRowSelectionChange={(selected) => console.log(selected)}
      // Pagination
      pagination={{
        enabled: true,
        limit: 10,
        limitOptions: [5, 10, 25],
        persistence: { enabled: true, key: "complex-table-demo" },
      }}
    />
  );
};

export default ComplexTable;
```
