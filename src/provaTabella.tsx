import type { IColumnConfig } from "./tables-framework/components/dynamic-table/dynamic-table";
import { DynamicTable } from "./tables-framework/components/dynamic-table/dynamic-table";
import { EmptyBody } from "./tables-framework/components";
import { MOCK_USERS, type IMockUser } from "./tables-framework/mock-data";
import { defaultTheme } from "./tables-framework/theme/theme";

const ProvaTabella = () => {
  const columns: IColumnConfig<IMockUser>[] = [
    {
      id: "checkbox",
      label: "",
      type: "checkbox",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
        showHeaderCheckbox: true,
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "firstName",
      label: "firstName",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
        sortable: true,
        backgroundColorSort: defaultTheme.palette.primary.light,
      },
      link: {
        types: "native",
        to: (row: IMockUser) => `/users/${row.id}`,
        target: "_self",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "lastName",
      label: "lastName",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "email",
      label: "email",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "role",
      label: "role",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "status",
      label: "status",
      type: "status",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "department",
      label: "department",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
    {
      id: "age",
      label: "age",
      type: "text",
      headerProps: {
        textAlignment: "left",
        textTransform: "uppercase",
        backgroundColor: "#EFEFEF",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.625rem",
        padding: "0.3125rem 0.5rem",
      },
      bodyProps: {
        textAlignment: "left",
        fontColor: defaultTheme.palette.neutral.main,
        fontSize: "0.6875rem",
      },
    },
  ];

  return (
    <DynamicTable
      data={MOCK_USERS}
      columns={columns}
      empty={<EmptyBody content="Nessun utente trovato" />}
      showFooter={false}
      onRowSelectionChange={(data) => {
        console.log("Selected Elements:", data);
      }}
      onRowDoubleClick={{
        baseUrl: "/users",
        targetKey: "id",
        onNavigate: (path) => console.log("Navigating to:", path),
      }}
      pagination={{
        enabled: true,
        limit: 10,
        limitOptions: [5, 10, 25, 50],
        onPaginationChange: ({ limit, offset }) => {
          console.log({ limit, offset });
        },
      }}
    />
  );
};

export default ProvaTabella;
