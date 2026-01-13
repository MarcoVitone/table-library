import { useCallback, useMemo, useState } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/tables-framework/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const SelectionTable = () => {
  const [selectedRows, setSelectedRows] = useState<IMockUser[]>([]);

  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "checkbox",
        label: "",
        type: "checkbox",
        width: "50px",
        fixed: true,
        headerProps: {
          textAlignment: "center",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
          showHeaderCheckbox: true,
        },
        bodyProps: {
          textAlignment: "center",
          padding: "0.5rem",
        },
      },
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "left", padding: "0.5rem" },
      },
      {
        id: "lastName",
        label: "Cognome",
        dataKey: "lastName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "left", padding: "0.5rem" },
      },
      {
        id: "email",
        label: "Email",
        dataKey: "email",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "left", padding: "0.5rem" },
      },
    ],
    []
  );

  const handleRowSelection = useCallback((selected: unknown[]) => {
    console.log("Selection changed:", selected);
    setSelectedRows(selected as IMockUser[]);
  }, []);

  const headerBorder = useMemo(
    () => ({
      show: true,
      color: "#ddd",
      width: "1px",
      style: "solid" as const,
    }),
    []
  );

  const bodyBorder = useMemo(
    () => ({
      show: true,
      color: "#eee",
      width: "1px",
      style: "solid" as const,
    }),
    []
  );

  return (
    <div style={{ height: "600px", width: "100%", border: "1px solid #ddd" }}>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#e3f2fd",
          marginBottom: "10px",
        }}
      >
        <strong>Selected Rows:</strong> {selectedRows.length}
      </div>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={550}
        onRowSelectionChange={handleRowSelection}
        rowSelectedColor={defaultTheme.palette.primary.light}
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
