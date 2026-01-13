import { useMemo } from "react";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { MOCK_USERS, type IMockUser } from "@/tables-framework/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

export const SortingFilteringTable = () => {
  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        filterConfig: { type: "text", placeholder: "Cerca nome..." },
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
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
        filterConfig: { type: "text", placeholder: "Cerca cognome..." },
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
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
        filterConfig: {
          type: "select",
          options: [
            { label: "Admin", value: "Admin" },
            { label: "Manager", value: "Manager" },
            { label: "Editor", value: "Editor" },
            { label: "User", value: "User" },
          ],
        },
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
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
        filterConfig: { type: "number", placeholder: "Età..." },
        headerProps: {
          textAlignment: "center",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
          fontColor: defaultTheme.palette.neutral.main,
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
        },
        bodyProps: {
          textAlignment: "center",
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
    <DynamicTable
      data={MOCK_USERS}
      columns={columns}
      maxHeight={600}
      enableColumnFilters={true} // IMPORTANT: Enable filters globally
      headerBorder={headerBorder}
      bodyBorder={bodyBorder}
    />
  );
};
