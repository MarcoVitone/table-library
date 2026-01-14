import { useMemo, type FC } from "react";
import { Check } from "@mui/icons-material";
import { DynamicTable } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { type IBaseCellProps } from "@/tables-framework/components";
import type { TStatusConfig } from "@/tables-framework/components/cells/status-cell/status-constants";
import { MOCK_USERS, type IMockUser } from "@/demo/mock-data";
import { defaultTheme } from "@/tables-framework/theme/theme";

// Custom Component for Department
const DepartmentCustomCell: FC<IBaseCellProps> = ({ data }) => {
  return (
    <div
      style={{ color: defaultTheme.palette.primary.main, fontWeight: "bold" }}
    >
      🏢 {String(data.row.source.flat.department)}
    </div>
  );
};

// Custom Component for City with Action
const CityActionCell: FC<IBaseCellProps> = ({ data }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span>📍 {String(data.value)}</span>
      <button
        type="button"
        onClick={() => alert(`Visiting ${data.value}`)}
        style={{
          padding: "0.2rem 0.5rem",
          fontSize: "0.7rem",
          cursor: "pointer",
          backgroundColor: "#eee",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        View
      </button>
    </div>
  );
};

export const CustomCellsTable = () => {
  const STATUS_CONFIG: TStatusConfig = useMemo(
    () => ({
      1: {
        backgroundColor: "rgba(0, 128, 0, 0.1)",
        textColor: "green",
        iconColor: "green",
        label: "Attivo",
      },
      2: {
        backgroundColor: "rgba(255, 165, 0, 0.1)",
        textColor: "orange",
        iconColor: "orange",
        label: "In Attesa",
      },
      3: {
        backgroundColor: "rgba(0, 247, 255, 0.1)",
        textColor: "blue",
        iconColor: "blue",
        iconChip: <Check />,
        label: "Verificato",
      },
    }),
    []
  );

  const columns = useMemo<IColumnConfig<IMockUser>[]>(
    () => [
      {
        id: "department",
        label: "Custom: Dipartimento",
        dataKey: "department",
        type: "custom",
        component: DepartmentCustomCell,
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
      },
      {
        id: "city",
        label: "Custom: Città",
        dataKey: "city",
        type: "custom",
        component: CityActionCell,
        headerProps: {
          textAlignment: "left",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
      },
      {
        id: "status",
        label: "Status Chip",
        dataKey: "status.id",
        type: "status",
        statusConfig: STATUS_CONFIG,
        width: "10rem",
        headerProps: {
          textAlignment: "center",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: {
          textAlignment: "center",
          labelKey: "status.label",
        },
      },
      {
        id: "salary",
        label: "Currency",
        dataKey: "salary",
        type: "currency",
        currencySymbol: "€",
        decimals: 2,
        width: "8rem",
        headerProps: {
          textAlignment: "right",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: {
          textAlignment: "right",
        },
      },
      {
        id: "lastLogin",
        label: "Date Format",
        dataKey: "lastLogin",
        type: "date",
        width: "9rem",
        headerProps: {
          textAlignment: "center",
          backgroundColor: "#f5f5f5",
          padding: "0.5rem",
        },
        bodyProps: {
          textAlignment: "center",
        },
      },
    ],
    [STATUS_CONFIG]
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
      headerBorder={headerBorder}
      bodyBorder={bodyBorder}
    />
  );
};
