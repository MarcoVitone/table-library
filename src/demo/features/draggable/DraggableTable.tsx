import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/demo/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const DraggableTable = () => {
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome (Drag Me)",
        dataKey: "firstName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e3f2fd",
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
        label: "Cognome",
        dataKey: "lastName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e3f2fd",
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
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e3f2fd",
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
        id: "role",
        label: "Ruolo",
        dataKey: "role",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e3f2fd",
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
          Trascina le colonne dall'intestazione per riordinarle.
        </p>
      </div>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={550}
        enableColumnReorder={true} // Enables Drag & Drop for columns
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
