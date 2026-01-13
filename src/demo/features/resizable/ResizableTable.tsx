import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/tables-framework/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const ResizableTable = () => {
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome (Resizable)",
        dataKey: "firstName",
        type: "text",
        width: "150px",
        minWidth: "100px",
        isResizable: true,
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#fff3e0",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
      },
      {
        id: "lastName",
        label: "Cognome (Resizable)",
        dataKey: "lastName",
        type: "text",
        width: "150px",
        isResizable: true,
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#fff3e0",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
      },
      {
        id: "email",
        label: "Email",
        dataKey: "email",
        type: "text",
        width: "250px",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#fff3e0",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
      },
    ],
    []
  );

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
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontStyle: "italic", fontSize: "0.9rem", margin: "0" }}>
          Trascina il bordo destro delle colonne "Nome" e "Cognome" per
          ridimensionarle.
        </p>
      </div>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={550}
        isResizable={true} // Enables resizing globally
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
