import type { ChangeEvent, FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Delete, Edit, Visibility } from "@mui/icons-material";

import type { IColumnConfig } from "./tables-framework/components/dynamic-table/dynamic-table";
import { DynamicTable } from "./tables-framework/components/dynamic-table/dynamic-table";
import {
  EmptyBody,
  useTable,
  type IBaseCellProps,
} from "./tables-framework/components";
import { MOCK_USERS, type IMockUser } from "./tables-framework/mock-data";
import { defaultTheme } from "./tables-framework/theme/theme";
import type { IFilter } from "./tables-framework/defines/common.types";
import type { TStatusConfig } from "./tables-framework/components/cells/status-cell/status-constants";

type TFilterState = {
  search: string;
  role: "all" | IMockUser["role"];
  status: "all" | IMockUser["status"];
  remoteOnly: boolean;
};

interface ITableControlsProps {
  filters: TFilterState;
  onFiltersChange: (filters: TFilterState) => void;
}

const TableControls: FC<ITableControlsProps> = ({
  filters,
  onFiltersChange,
}) => {
  const {
    setFiltering,
    setSorting,
    exportCSV,
    exportJSON,
    clearSelectedRows,
    selectAllRows,
  } = useTable();

  useEffect(() => {
    const activeFilters: IFilter[] = [];

    if (filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      activeFilters.push({ key: "firstName", op: "match", val: term });
      activeFilters.push({ key: "lastName", op: "match", val: term });
      activeFilters.push({ key: "email", op: "match", val: term });
    }

    if (filters.role !== "all") {
      activeFilters.push({ key: "role", op: "eq", val: filters.role });
    }

    if (filters.status !== "all") {
      activeFilters.push({ key: "status", op: "eq", val: filters.status.id });
    }

    if (filters.remoteOnly) {
      activeFilters.push({ key: "isRemote", op: "eq", val: true });
    }

    setFiltering?.(() => activeFilters);
  }, [filters, setFiltering]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: "0.5rem 0",
        alignItems: "center",
      }}
    >
      <input
        type="search"
        placeholder="Cerca nome, cognome o email"
        value={filters.search}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFiltersChange({ ...filters, search: event.target.value })
        }
        style={{ padding: "0.35rem 0.5rem", minWidth: "14rem" }}
      />
      <select
        value={filters.role}
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            role: event.target.value as TFilterState["role"],
          })
        }
      >
        <option value="all">Tutti i ruoli</option>
        <option value="Admin">Admin</option>
        <option value="Manager">Manager</option>
        <option value="Editor">Editor</option>
        <option value="User">User</option>
      </select>
      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <input
          type="checkbox"
          checked={filters.remoteOnly}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              remoteOnly: event.target.checked,
            })
          }
        />
        Solo remoto
      </label>
      <button
        type="button"
        onClick={() => setSorting?.([])}
        style={{ padding: "0.35rem 0.75rem" }}
      >
        Reset ordinamento
      </button>
      <button
        type="button"
        onClick={() => selectAllRows?.()}
        style={{ padding: "0.35rem 0.75rem" }}
      >
        Seleziona tutti
      </button>
      <button
        type="button"
        onClick={() => clearSelectedRows?.()}
        style={{ padding: "0.35rem 0.75rem" }}
      >
        Deseleziona
      </button>
      <button
        type="button"
        onClick={() => exportCSV?.()}
        style={{ padding: "0.35rem 0.75rem" }}
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => exportJSON?.()}
        style={{ padding: "0.35rem 0.75rem" }}
      >
        Export JSON
      </button>
    </div>
  );
};

const ProvaTabella = () => {
  const [filters, setFilters] = useState<TFilterState>({
    search: "",
    role: "all",
    status: "all",
    remoteOnly: false,
  });
  const [visibleUsers, setVisibleUsers] = useState<IMockUser[]>(
    MOCK_USERS.slice(0, 10)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasMore = visibleUsers.length < MOCK_USERS.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    // Simula una chiamata async per mostrare il loader dell'infinite scroll
    setTimeout(() => {
      setVisibleUsers((prev) => {
        const nextLength = Math.min(prev.length + 5, MOCK_USERS.length);
        return MOCK_USERS.slice(0, nextLength);
      });
      setIsLoadingMore(false);
    }, 350);
  }, [hasMore, isLoadingMore]);

  // Esempio di componente custom semplice
  const Peppe: FC<IBaseCellProps> = ({ data }) => {
    return (
      <div style={{ color: "blue", fontWeight: "bold" }}>
        {String(data.row.source.flat.department)} (Custom)
      </div>
    );
  };

  const CityWithButton: FC<IBaseCellProps> = ({ data }) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>{String(data.value)}</span>
        <button
          type="button"
          onClick={() => {
            console.log(data.row.source.full);
          }}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          Log Info
        </button>
      </div>
    );
  };

  const MY_USER_STATUS_CONFIG: TStatusConfig = {
    1: {
      backgroundColor: "rgba(0, 128, 0, 0.1)",
      textColor: "green",
      iconColor: "green",
    },
    2: {
      backgroundColor: "rgba(255, 165, 0, 0.1)",
      textColor: "orange",
      iconColor: "orange",
    },
    3: {
      backgroundColor: "rgba(0, 247, 255, 0.1)",
      textColor: "blue",
      iconColor: "blue",
      iconChip: <Check />,
    },
  };

  const columns: IColumnConfig<IMockUser>[] = useMemo(
    () => [
      {
        id: "checkbox",
        label: "",
        type: "checkbox",
        fixed: true,
        // headerProps abilita il checkbox master e lo stile dell'intestazione
        headerProps: {
          textAlignment: "left",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          showHeaderCheckbox: true,
        },
        // bodyProps gestisce lo stile dei checkbox per le singole righe
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "firstName",
        label: "Nome",
        dataKey: "firstName",
        type: "text",
        fixed: true,
        // headerProps abilita l'ordinamento client-side e lo sfondo per la colonna attiva
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
        // link rende cliccabile il valore e usa il router "native"
        link: {
          types: "native",
          to: (row: IMockUser) => `/users/${row.id}`,
          target: "_self",
        },
        // bodyProps applica lo stile del testo nelle celle del corpo
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "lastName",
        label: "Cognome",
        dataKey: "lastName",
        type: "text",
        // headerProps controlla aspetto e spaziature dell'intestazione
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
        // bodyProps applica uno stile coerente alle celle di corpo
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "email",
        label: "Email",
        dataKey: "email",
        type: "text",
        // headerProps definisce il layout dell'header
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
        // bodyProps gestisce stile testo e dimensione
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "role",
        label: "Ruolo",
        dataKey: "role",
        type: "autocomplete",
        autocompleteOptions: MOCK_USERS.map((user) => user.role).filter(
          (value, index, self) => self.indexOf(value) === index
        ),
        getOptionLabel: (option) => String(option),
        isOptionEqualToValue: (option, value) => option === value,
        disableClearable: true,
        // headerProps mostra label in maiuscolo e margini
        headerProps: {
          textAlignment: "left",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
        },
        // bodyProps mantiene allineamento testuale
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "status",
        label: "Stato",
        dataKey: "status.id",
        type: "status",
        isResizable: false,
        // headerProps configura l'intestazione per la colonna badge
        headerProps: {
          textAlignment: "left",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
        },
        // bodyProps definisce lo stile dei chip di stato
        bodyProps: {
          labelKey: "status.label",
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
          textTransform: "capitalize",
        },
        statusConfig: MY_USER_STATUS_CONFIG,
      },
      {
        id: "department",
        label: "Dipartimento",
        dataKey: "department",
        type: "custom", // Changed to custom
        component: Peppe, // Added component
        // headerProps controlla allineamento e casing header
        headerProps: {
          textAlignment: "left",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
        },
        // bodyProps applica stile uniforme alle celle di testo
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "city",
        label: "Città",
        dataKey: "city",
        type: "custom",
        component: CityWithButton,
        // headerProps per controllare estetica dell'intestazione
        headerProps: {
          textAlignment: "left",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
        },
        // bodyProps mantiene stile e dimensione font
        bodyProps: {
          textAlignment: "left",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
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
        // headerProps aggiunge allineamento e abilita sort numerico
        headerProps: {
          textAlignment: "right",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
        },
        // bodyProps allinea i valori numerici a destra
        bodyProps: {
          textAlignment: "right",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "projects",
        label: "Progetti",
        dataKey: "projects",
        type: "number",
        width: "6rem",
        // headerProps gestisce l'allineamento per i conteggi
        headerProps: {
          textAlignment: "center",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
          // VERIFICATION: Add a specific TOP border to verify 4-side control
          borderTop: {
            show: true,
            color: "red",
            width: "3px",
            style: "solid",
          },
        },
        // bodyProps centra i numeri per leggibilità
        bodyProps: {
          textAlignment: "center",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "age",
        label: "Età",
        dataKey: "age",
        type: "number",
        width: "5rem",
        // headerProps abilita l'ordinamento e definisce padding dell'intestazione
        headerProps: {
          textAlignment: "center",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
          // VERIFICATION: Override global border to hide it for this column header
          borderBottom: { show: false },
        },
        // bodyProps mostra numeri centrati
        bodyProps: {
          textAlignment: "center",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
          // VERIFICATION: Override global border to hide it for this column body
          borderBottom: { show: false },
        },
      },
      {
        id: "lastLogin",
        label: "Ultimo accesso",
        dataKey: "lastLogin",
        type: "date",
        width: "9rem",
        // headerProps definisce stile e abilita sort per le date
        headerProps: {
          textAlignment: "center",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
        },
        // bodyProps allinea e formatta le date del corpo
        bodyProps: {
          textAlignment: "center",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "createdAt",
        label: "Creato il",
        dataKey: "createdAt",
        type: "date",
        width: "9rem",
        // headerProps abilita sort e imposta il layout dell'intestazione
        headerProps: {
          textAlignment: "center",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
          sortable: true,
          backgroundColorSort: defaultTheme.palette.primary.light,
        },
        // bodyProps mantiene un aspetto coerente per le date di creazione
        bodyProps: {
          textAlignment: "center",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
        },
      },
      {
        id: "actions",
        label: "Azioni",
        type: "action",
        width: "10rem",
        // headerProps centra la label ed applica lo stile dell'intestazione
        headerProps: {
          textAlignment: "center",
          textTransform: "uppercase",
          backgroundColor: "#EFEFEF",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.625rem",
          padding: "0.3125rem 0.5rem",
        },
        // bodyProps definisce le action disponibili e l'allineamento dei pulsanti
        bodyProps: {
          textAlignment: "center",
          fontColor: defaultTheme.palette.neutral.main,
          fontSize: "0.6875rem",
          actions: [
            {
              icon: <Visibility fontSize="small" />,
              onAction: (item: IMockUser) => {
                console.log("Preview utente", item);
              },
            },
            {
              icon: <Edit fontSize="small" />,
              onAction: (item: IMockUser) => {
                console.log("Modifica utente", item);
              },
            },
            {
              icon: <Delete fontSize="small" />,
              component: "button",
              label: "Elimina",
              color: "error",
              variant: "contained",
              onPrompt: () =>
                Promise.resolve(
                  window.confirm("Confermi l'eliminazione dell'utente?")
                ),
              onAction: (item: IMockUser) => {
                console.log("Eliminazione utente", item);
              },
              onEnd: (item: IMockUser) => {
                console.log("Azione completata per", item.id);
              },
            },
          ],
        },
      },
    ],
    []
  );

  return (
    <DynamicTable
      data={visibleUsers}
      columns={columns}
      before={<TableControls filters={filters} onFiltersChange={setFilters} />}
      empty={<EmptyBody content="Nessun utente trovato" />}
      maxHeight={500}
      headerBorder={{
        show: true,
        color: defaultTheme.palette.secondary.dark,
        width: "1px",
        style: "solid",
      }}
      bodyBorder={{
        show: true,
        color: "#e0e0e0",
        width: "1px",
        style: "solid",
      }}
      onDataChange={(newData, updatedRow) => {
        console.log("Data changed:", newData, updatedRow);
        setVisibleUsers(newData);
      }}
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
        position: "top",
        alignment: "right",
        limitOptions: [5, 10, 15, 25, 50],
        onPaginationChange: ({ limit, offset }) => {
          console.log({ limit, offset });
        },
        persistence: {
          enabled: true,
          key: "users-table",
          storage: "localStorage",
          persistLimit: true,
          persistPage: true,
        },
        visibility: {
          showGoToPage: true,
          showPageNumbers: true,
          showFirstLast: true,
          showPrevNext: true,
          showPageSizeSelector: true,
          showInfo: true,
        },
      }}
      infiniteScroll={{
        enabled: true,
        hasMore,
        loadMore,
        isLoading: isLoadingMore,
        threshold: 120,
        endMessage: "Hai caricato tutti gli utenti disponibili.",
      }}
      rowSelectedColor={"#FF0000"}
      isResizable={true}
    />
  );
};

export default ProvaTabella;
