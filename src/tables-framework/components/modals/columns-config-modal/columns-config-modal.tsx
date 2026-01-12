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
  Stack,
  Box,
} from "@mui/material";
import { Close, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import type { IColumnConfig } from "../../dynamic-table/dynamic-table";
import { useTable } from "../../../hooks/use-table/use-table";
import { useMemo } from "react";

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
  const { columnsLayout, setColumnsLayout, resetLayout } = useTable();

  // La lista delle colonne segue l'ordine passato come prop (già ordinato dal DynamicTable)
  const orderedCols = useMemo(() => {
    return columns.filter((c) => c.type !== "checkbox");
  }, [columns]);

  // Funzione per commutare la visibilità
  const handleToggleColumn = (columnId: string) => {
    if (!setColumnsLayout) return;

    setColumnsLayout((prevLayout) => {
      const existingColIndex = prevLayout.findIndex((c) => c.id === columnId);
      const newLayout = [...prevLayout];

      if (existingColIndex >= 0) {
        newLayout[existingColIndex] = {
          ...newLayout[existingColIndex],
          props: {
            ...newLayout[existingColIndex].props,
            isHidden: !newLayout[existingColIndex].props.isHidden,
          },
        };
      } else {
        newLayout.push({
          id: columnId,
          props: { isHidden: true, width: undefined },
        });
      }

      return newLayout;
    });
  };

  // Funzione per spostare una colonna
  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    if (!setColumnsLayout) return;

    const newOrder = [...orderedCols];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    // Scambio
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    setColumnsLayout((prev) => {
      // Preserviamo le colonne che NON sono mostrate in questa modale (es. checkbox)
      const managedIds = new Set(orderedCols.map((oc) => oc.id));
      const unmanaged = prev.filter((p) => !managedIds.has(p.id));

      const prevMap = new Map(prev.map((p) => [p.id, p]));
      const managedLayout = newOrder.map((col) => {
        const existing = prevMap.get(col.id);
        return (
          existing || {
            id: col.id,
            props: { isHidden: false, width: undefined },
          }
        );
      });

      // Manteniamo le colonne non gestite all'inizio (come la checkbox)
      return [...unmanaged, ...managedLayout];
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
          {orderedCols.map((col, index) => {
            const layoutCol = columnsLayout?.find((c) => c.id === col.id);
            const isVisible = !layoutCol?.props?.isHidden;

            return (
              <ListItem
                key={col.id}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                  py: 1,
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => handleMoveColumn(index, "up")}
                      disabled={index === 0}
                      title="Sposta su"
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveColumn(index, "down")}
                      disabled={index === orderedCols.length - 1}
                      title="Sposta giù"
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                    <Box
                      sx={{
                        ml: 1,
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        pl: 1,
                      }}
                    >
                      <Switch
                        edge="end"
                        checked={isVisible}
                        onChange={() => handleToggleColumn(col.id)}
                        disabled={col.hideable === false}
                        size="small"
                      />
                    </Box>
                  </Stack>
                }
              >
                <ListItemText
                  primary={col.label}
                  secondary={col.id}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      fontWeight: 600,
                    },
                    secondary: {
                      variant: "caption",
                      sx: { color: "text.disabled", fontSize: "0.7rem" },
                    },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Button onClick={resetLayout} color="inherit" size="small">
          Ripristina Default
        </Button>
        <Button onClick={onClose} color="primary" variant="contained">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { ColumnsConfigModal };
