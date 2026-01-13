import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/tables-framework/mock-data";

export const ColumnConfigTable = () => {
  // We add all columns to show the config feature fully
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e0f2f1",
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
          backgroundColor: "#e0f2f1",
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
          backgroundColor: "#e0f2f1",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "left", padding: "0.5rem" },
      },
      {
        id: "role",
        label: "Ruolo",
        dataKey: "role",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#e0f2f1",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "left", padding: "0.5rem" },
      },
      {
        id: "salary",
        label: "Salary",
        dataKey: "salary",
        type: "currency",
        currencySymbol: "$",
        headerProps: {
          textAlignment: "right",
          backgroundColor: "#e0f2f1",
          padding: "0.5rem",
        },
        bodyProps: { textAlignment: "right", padding: "0.5rem" },
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
          Usa l'ingranaggio in alto a destra (nell'header) per aprire la modale
          di configurazione. Trascina le colonne dall'intestazione per
          riordinarle.
        </p>
      </div>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={500}
        enableColumnConfig={true} // Enables Config Modal
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
