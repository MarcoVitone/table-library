import type { ReactElement } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Switch,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { IColumnConfig } from "../../dynamic-table/dynamic-table";
import { useTable } from "../../../hooks/use-table/use-table";

interface IColumnsConfigModalProps<T> {
  open: boolean;
  onClose: () => void;
  columns: IColumnConfig<T>[]; // Tutte le definizioni delle colonne
}

// Rimuovi 'FC' e usa la sintassi per arrow function generica: <T,>
const ColumnsConfigModal = <T,>({
  open,
  onClose,
  columns,
}: IColumnsConfigModalProps<T>): ReactElement => {
  const { columnsLayout, setColumnsLayout } = useTable();

  // Funzione per commutare la visibilità
  const handleToggleColumn = (columnId: string) => {
    if (!setColumnsLayout) return;

    setColumnsLayout((prevLayout) => {
      // Troviamo se esiste già una config per questa colonna
      const existingColIndex = prevLayout.findIndex((c) => c.id === columnId);
      const newLayout = [...prevLayout];

      if (existingColIndex >= 0) {
        // Se esiste, invertiamo isHidden
        const currentIsHidden = newLayout[existingColIndex].props.isHidden;
        newLayout[existingColIndex] = {
          ...newLayout[existingColIndex],
          props: {
            ...newLayout[existingColIndex].props,
            isHidden: !currentIsHidden, // Toggle
          },
        };
      } else {
        // Se non esiste nel layout (è visibile di default), la aggiungiamo come nascosta
        newLayout.push({
          id: columnId,
          props: { isHidden: true, width: undefined },
        });
      }

      return newLayout;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Configura Colonne</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List dense>
          {columns.map((col) => {
            // Verifica lo stato attuale nel layout
            const layoutCol = columnsLayout?.find((c) => c.id === col.id);
            // Se non c'è nel layout, assumiamo sia visibile (isHidden = undefined/false)
            // Se c'è, controlliamo isHidden
            const isVisible = !layoutCol?.props?.isHidden;

            return (
              <ListItem key={col.id}>
                <ListItemText primary={col.label} />
                <Switch
                  edge="end"
                  checked={isVisible}
                  onChange={() => handleToggleColumn(col.id)}
                  // Disabilita se la colonna non è nascondibile per configurazione
                  disabled={col.hideable === false}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { ColumnsConfigModal };
