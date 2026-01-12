import { useMemo } from "react";
import type { IColumn, ITableLayout } from "../../../../defines/common.types";

interface IProps {
  columns: IColumn[];
  tableLayout: ITableLayout;
}

function useColumns({ columns, tableLayout }: IProps): IColumn[] {
  return useMemo(() => {
    if (!tableLayout.columnsLayout?.length) {
      return columns.filter((c) => !c.props.isHidden);
    }

    const columnsLayout = tableLayout.columnsLayout;

    const getPos = (id: string): number => {
      return columnsLayout.findIndex((l) => l.id === id);
    };

    return columns
      .filter((c) => {
        // Controlla se è nascosta nel layout
        const layoutCol = columnsLayout.find((l) => l.id === c.id);
        if (layoutCol && layoutCol.props.isHidden !== undefined) {
          return !layoutCol.props.isHidden;
        }
        return !c.props.isHidden;
      })
      .sort((a, b) => {
        return getPos(a.id) - getPos(b.id);
      })
      .map((c, newIndex) => {
        // --- FIX: CLONE E MAPPA COMPLETA ---
        // Cloniamo la colonna per evitare mutazioni e garantire il refresh
        const newCol: IColumn = {
          ...c,
          posX: newIndex,
          props: { ...c.props }, // Clona anche props
        };

        const match = columnsLayout.find((l) => l.id === c.id);

        if (match) {
          // Sovrascrivi width se presente nel layout
          if (match.props.width !== undefined) {
            newCol.props.width = match.props.width;
          }
          // Sovrascrivi isHidden se presente
          if (match.props.isHidden !== undefined) {
            newCol.props.isHidden = match.props.isHidden;
          }

          // --- FIX SALVATAGGIO ---
          // Copia savedWidth dal layout alla colonna renderizzata
          if (match.props.savedWidth !== undefined) {
            newCol.props.savedWidth = match.props.savedWidth;
          }
        }

        return newCol;
      });
  }, [columns, tableLayout.columnsLayout]);
}

export { useColumns };
