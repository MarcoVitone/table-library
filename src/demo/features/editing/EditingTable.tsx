import { useMemo, useState } from "react";
import { DynamicTable, type IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import { ThemeProvider } from "@/tables-framework/theme/theme";
interface EditingRow {
  id: number;
  name: string;
  amount: number | string;
  role: Record<string, unknown> | null;
  requiredRole: string;
  level: number;
  active: boolean;
  team: string;
  date: string;
}
const roles = [{
  id: 1,
  label: 'Amministratore'
}, {
  id: 2,
  label: 'Editor'
}, {
  id: 3,
  label: 'Lettore'
}];
const initialRows: EditingRow[] = [{
  id: 0,
  name: 'Anna',
  amount: 0,
  role: roles[0],
  requiredRole: 'Editor',
  level: 0,
  active: false,
  team: 'Design',
  date: '2026-01-10'
}, {
  id: 1,
  name: 'Bruno',
  amount: 12,
  role: roles[1],
  requiredRole: 'Editor',
  level: 1,
  active: true,
  team: 'Sviluppo',
  date: '2026-01-11'
}, {
  id: 2,
  name: 'Carla',
  amount: 25,
  role: roles[2],
  requiredRole: 'Lettore',
  level: 2,
  active: false,
  team: 'Supporto',
  date: '2026-01-12'
}];
export function EditingTable() {
  const [rows, setRows] = useState(initialRows);
  const [lastChange, setLastChange] = useState<EditingRow | null>(null);
  const columns = useMemo<IColumnConfig<EditingRow>[]>(() => [{
    id: 'name',
    label: 'Nome',
    dataKey: 'name',
    type: 'input',
    width: '160px',
    filterConfig: {
      type: 'text'
    },
    headerProps: {
      sortable: true
    }
  }, {
    id: 'amount',
    label: 'Quantità',
    dataKey: 'amount',
    type: 'input',
    inputType: 'number',
    width: '110px',
    filterConfig: {
      type: 'number'
    }
  }, {
    id: 'role',
    label: 'Ruolo',
    dataKey: 'role',
    type: 'autocomplete',
    width: '220px',
    autocompleteOptions: roles,
    getOptionLabel: option => typeof option === 'string' ? option : String(option.label),
    isOptionEqualToValue: (a, b) => typeof a === 'object' && typeof b === 'object' && a.id === b.id
  }, {
    id: 'requiredRole',
    label: 'Ruolo obbligatorio',
    dataKey: 'requiredRole',
    type: 'autocomplete',
    width: '220px',
    autocompleteOptions: ['Amministratore', 'Editor', 'Lettore'],
    disableClearable: true
  }, {
    id: 'level',
    label: 'Livello',
    dataKey: 'level',
    type: 'number',
    filterConfig: {
      type: 'select',
      options: [{
        label: 'Zero',
        value: 0
      }, {
        label: 'Uno',
        value: 1
      }, {
        label: 'Due',
        value: 2
      }]
    }
  }, {
    id: 'active',
    label: 'Attivo',
    dataKey: 'active',
    type: 'status',
    renderStatus: value => value ? 'Sì' : 'No',
    filterConfig: {
      type: 'select',
      options: [{
        label: 'Sì',
        value: true
      }, {
        label: 'No',
        value: false
      }]
    }
  }, {
    id: 'team',
    label: 'Team',
    dataKey: 'team',
    filterConfig: {
      type: 'multi-select',
      options: ['Design', 'Sviluppo', 'Supporto'].map(value => ({
        label: value,
        value
      }))
    }
  }, {
    id: 'date',
    label: 'Data',
    dataKey: 'date',
    type: 'date',
    filterConfig: {
      type: 'date'
    }
  }], []);
  return <ThemeProvider theme={{
    palette: {
      primary: {
        main: '#6b277e',
        dark: '#6b277e'
      }
    }
  }}>
  <p>Modifica i campi o scegli un ruolo. Le modifiche vengono restituite tramite <code>onDataChange</code>.</p>
  <button type="button" onClick={() => {
      setRows(previous => previous.map((row, index) => index === 0 ? {
        ...row,
        name: 'Aggiornata',
        amount: 42,
        role: {
          ...roles[2]
        }
      } : row));
      setLastChange(null);
    }}>Aggiorna dati esterni</button>
  <DynamicTable columns={columns} data={rows} enableColumnFilters enableColumnConfig isResizable maxHeight={420} onDataChange={(next, updated) => {
      setRows(next);
      setLastChange(updated);
    }} />
  <output aria-label="Ultima modifica">{lastChange ? JSON.stringify(lastChange) : 'Nessuna modifica'}</output>
 </ThemeProvider>;
}
