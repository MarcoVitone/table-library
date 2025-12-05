import { useCallback, useState } from "react";
import type { IStatusAPI } from "../../../../defines/api.types.ts";
import type {
  IDatum,
  IRow,
  IRowStatus,
  TNonNullable,
  TRowsStatus,
} from "../../../../defines/common.types.ts";
import { useChangeEvent } from "../../../../hooks/use-change-event/use-change-event.tsx";

type TRowStatusMapper = (data: IDatum) => Partial<IRowStatus>;

interface IProps {
  rows: IRow[];
  rowStatusMapper: TRowStatusMapper | undefined;
}

function useStatus({
  rows,
  rowStatusMapper,
}: IProps): TNonNullable<IStatusAPI> {
  const getRowsStatus = useCallback(
    (externals: IRow[], stored: TRowsStatus) => {
      const output: TRowsStatus = {};

      const mapper = rowStatusMapper || (() => ({}));

      externals.forEach((external) => {
        const sup = stored[external.id] as IRowStatus | undefined;

        output[external.id] = {
          state: "ready",
          isPinned: false,
          isSelected: false,
          ...(sup || {}),
          ...mapper(external.source.full),
        };
      });

      return output;
    },
    [rowStatusMapper]
  );

  const [rowsStatus, setRowsStatus] = useState<TRowsStatus>(() => {
    return getRowsStatus(rows, {});
  });

  const onRowsChangeHandler = useCallback(
    (e: IRow[]) => {
      setRowsStatus((prevState) => {
        return getRowsStatus(e, prevState);
      });
    },
    [getRowsStatus]
  );

  useChangeEvent(onRowsChangeHandler, rows);

  return {
    rowsStatus,
    setRowsStatus,
  };
}

export type { TRowStatusMapper };
export { useStatus };
