import { useMemo, useId, type ReactElement, type Dispatch, type SetStateAction } from "react";
import { Button, IconButton, Checkbox } from "@/tables-framework/ui/controls";
import { NativeDialog } from "@/tables-framework/ui/dialog";
import { Close, ArrowUpward, ArrowDownward } from "@/tables-framework/ui/icons";
import type { IColumnLayout } from "@/tables-framework/defines/common.types";
import type { IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
interface IColumnsConfigModalProps<T> {
  open: boolean;
  onClose: () => void;
  columns: IColumnConfig<T>[];
  layout: IColumnLayout[];
  onLayoutChange: Dispatch<SetStateAction<IColumnLayout[]>>;
  onReset: () => void;
}
const ColumnsConfigModal = <T,>({
  open,
  onClose,
  columns,
  layout: columnsLayout,
  onLayoutChange: setColumnsLayout,
  onReset: resetLayout
}: IColumnsConfigModalProps<T>): ReactElement => {
  // La lista delle colonne segue l'ordine passato come prop (già ordinato dal DynamicTable)
  const orderedCols = useMemo(() => {
    return columns.filter(c => c.type !== "checkbox");
  }, [columns]);

  // Funzione per commutare la visibilità
  const handleToggleColumn = (columnId: string) => {
    if (!setColumnsLayout) return;
    setColumnsLayout(prevLayout => {
      const existingColIndex = prevLayout.findIndex(c => c.id === columnId);
      const newLayout = [...prevLayout];
      if (existingColIndex >= 0) {
        newLayout[existingColIndex] = {
          ...newLayout[existingColIndex],
          props: {
            ...newLayout[existingColIndex].props,
            isHidden: !newLayout[existingColIndex].props.isHidden
          }
        };
      } else {
        newLayout.push({
          id: columnId,
          props: {
            isHidden: true,
            width: undefined
          }
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
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setColumnsLayout(prev => {
      // Preserviamo le colonne che NON sono mostrate in questa modale (es. checkbox)
      const managedIds = new Set(orderedCols.map(oc => oc.id));
      const unmanaged = prev.filter(p => !managedIds.has(p.id));
      const prevMap = new Map(prev.map(p => [p.id, p]));
      const managedLayout = newOrder.map(col => {
        const existing = prevMap.get(col.id);
        return existing || {
          id: col.id,
          props: {
            isHidden: false,
            width: undefined
          }
        };
      });

      // Manteniamo le colonne non gestite all'inizio (come la checkbox)
      return [...unmanaged, ...managedLayout];
    });
  };
  const id = useId();
  return <NativeDialog open={open} onClose={onClose} title="Configura Colonne">
    <IconButton aria-label="Chiudi configurazione" title="Chiudi configurazione" onClick={onClose} size="small" style={{
      position: 'absolute',
      right: 12,
      top: 12
    }}><Close /></IconButton>
    <div className="tbl-dialog-content"><ul className="tbl-config-list">
      {orderedCols.map((col, index) => {
          const layoutCol = columnsLayout?.find(column => column.id === col.id);
          return <li key={col.id} className="tbl-config-item">
          <label htmlFor={id + col.id} className="tbl-config-label">{col.label}<small>{col.id}</small></label>
          <div className="tbl-config-controls">
            <IconButton title="Sposta su" aria-label="Sposta su" size="small" onClick={() => handleMoveColumn(index, 'up')} disabled={index === 0}><ArrowUpward fontSize="small" /></IconButton>
            <IconButton title="Sposta giù" aria-label="Sposta giù" size="small" onClick={() => handleMoveColumn(index, 'down')} disabled={index === orderedCols.length - 1}><ArrowDownward fontSize="small" /></IconButton>
            <Checkbox id={id + col.id} role="switch" className="tbl-switch" checked={!layoutCol?.props?.isHidden} onChange={() => handleToggleColumn(col.id)} disabled={col.hideable === false} size="small" />
          </div>
        </li>;
        })}
    </ul></div>
    <div className="tbl-dialog-actions"><Button onClick={resetLayout} color="inherit" size="small">Ripristina Default</Button><Button onClick={onClose} variant="contained">Chiudi</Button></div>
  </NativeDialog>;
};
export { ColumnsConfigModal };
