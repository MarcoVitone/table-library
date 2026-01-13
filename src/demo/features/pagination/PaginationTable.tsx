import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/tables-framework/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const PaginationTable = () => {
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
    ],
    []
  );

  const paginationConfig = useMemo(
    () => ({
      enabled: true,
      position: "bottom" as const,
      alignment: "center" as const,
      limitOptions: [5, 10, 20, 50],
      onPaginationChange: ({
        limit,
        offset,
      }: {
        limit: number;
        offset: number;
      }) => {
        console.log("Pagination changed:", { limit, offset });
      },
      visibility: {
        showGoToPage: true,
        showPageNumbers: true,
        showFirstLast: true,
        showPrevNext: true,
        showPageSizeSelector: true,
        showInfo: true,
      },
    }),
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
      <DynamicTable
        data={MOCK_USERS}
        columns={columns}
        maxHeight={550}
        pagination={paginationConfig}
        headerBorder={headerBorder}
        bodyBorder={bodyBorder}
      />
    </div>
  );
};
