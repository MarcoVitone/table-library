import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/demo/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const BasicTable = () => {
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
          backgroundColor: "#f5f5f5",
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
          backgroundColor: "#f5f5f5",
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
          backgroundColor: "#f5f5f5",
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
        id: "department",
        label: "Dipartimento",
        dataKey: "department",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
        id: "city",
        label: "Città",
        dataKey: "city",
        type: "text",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
        id: "salary",
        label: "Stipendio",
        dataKey: "salary",
        type: "currency",
        currencySymbol: "€",
        symbolPosition: "right",
        decimals: 2,
        width: "8rem",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
        id: "age",
        label: "Età",
        dataKey: "age",
        type: "number",
        width: "5rem",
        filterConfig: { type: "number", placeholder: "Filtra età..." },
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
        id: "lastLogin",
        label: "Ultimo accesso",
        dataKey: "lastLogin",
        type: "date",
        width: "9rem",
        filterConfig: { type: "date", filterLabel: "Data accesso" },
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
        id: "createdAt",
        label: "Creato il",
        dataKey: "createdAt",
        type: "date",
        width: "9rem",
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
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
    <div style={{ height: "500px", width: "100%", border: "1px solid #ddd" }}>
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={500}
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
