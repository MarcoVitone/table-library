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

    columns.forEach((column) => {
      const match = columnsLayout.find((l) => l.id === column.id);

      if (match) {
        if (typeof match.props.isHidden !== "undefined") {
          column.props.isHidden = match.props.isHidden;
        }

        if (typeof match.props.width !== "undefined") {
          column.props.width = match.props.width;
        }
      } else {
        console.warn(`COLUMN ${column.id} NOT FOUND IN RECEIVED LAYOUT.`);
      }
    });

    const getPos = (c: IColumn): number => {
      return columnsLayout.findIndex((l) => l.id === c.id);
    };

    return columns
      .filter((c) => !c.props.isHidden)
      .sort((a, b) => {
        return getPos(a) - getPos(b);
      })
      .map((c, newIndex) => {
        c.posX = newIndex;

        return c;
      });
  }, [columns, tableLayout.columnsLayout]);
}

export { useColumns };
