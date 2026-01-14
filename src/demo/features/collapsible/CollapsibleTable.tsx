import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/demo/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const CollapsibleTable = () => {
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        enableHiding: true, // Use global prop? Or local? Let's assume global enables it for all unless disabled?
        // BaseCell checks: enableHiding && !isCollapsed
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f3e5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
        },
      },
      {
        id: "lastName",
        label: "Cognome",
        dataKey: "lastName",
        type: "text",
        enableHiding: true, // Explicitly enable hiding
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f3e5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
        },
      },
      {
        id: "email",
        label: "Email",
        dataKey: "email",
        type: "text",
        enableHiding: true,
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f3e5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
        },
        bodyProps: {
          textAlignment: "left",
          padding: "0.5rem",
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
          Usa l'icona "-" per collassare le colonne. Clicca sulla colonna
          collassata per espanderla.
        </p>
      </div>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={550}
        enableColumnHiding={true} // Enables collapsing
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
