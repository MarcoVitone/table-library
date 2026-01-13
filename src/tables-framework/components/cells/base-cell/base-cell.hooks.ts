import { useCallback, useMemo } from "react";
import type { RefObject } from "react";
import type { ICellProps } from "@/tables-framework/defines/common.types.ts";
import type {
  TSetColumnLayout,
  TSetSorting,
} from "@/tables-framework/defines/api.types.ts";

export const COLLAPSED_WIDTH = 10;

type TSortDirection = "ASC" | "DESC";

interface IUseCellCollapseProps {
  data: ICellProps["data"];
  setColumnLayout: TSetColumnLayout;
  currentWidth?: number | string;
  savedWidth?: number | string;
  innerRef: RefObject<HTMLTableCellElement | null>;
}

export const useCellCollapse = ({
  data,
  setColumnLayout,
  currentWidth,
  savedWidth,
  innerRef,
}: IUseCellCollapseProps) => {
  const isCollapsed = currentWidth === COLLAPSED_WIDTH;

  const handleCollapseColumn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (data?.column?.id && setColumnLayout) {
        let widthToSave = savedWidth;

        if (currentWidth !== COLLAPSED_WIDTH) {
          if (currentWidth) {
            widthToSave = currentWidth;
          } else if (innerRef.current) {
            widthToSave = innerRef.current.getBoundingClientRect().width;
          }
        }

        setColumnLayout(
          {
            props: {
              width: COLLAPSED_WIDTH,
              isHidden: data.column.props.isHidden,
              savedWidth: widthToSave,
            },
          },
          data.column.id
        );
      }
    },
    [data, setColumnLayout, currentWidth, savedWidth, innerRef]
  );

  const handleExpandColumn = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (data?.column?.id && setColumnLayout) {
        setColumnLayout(
          {
            props: {
              width: savedWidth || undefined,
              isHidden: data.column.props.isHidden,
              savedWidth: undefined,
            },
          },
          data.column.id
        );
      }
    },
    [data, setColumnLayout, savedWidth]
  );

  return { isCollapsed, handleCollapseColumn, handleExpandColumn };
};

interface IUseCellSortingProps {
  data: ICellProps["data"];
  setSorting: TSetSorting | null;
  sortable: boolean;
  isServerSideSort: boolean;
  sortParam?: string;
  onSortClick?: (dataKey: string, dir: TSortDirection) => void;
  dir: -1 | 0 | 1;
}

export const useCellSorting = ({
  data,
  setSorting,
  sortable,
  isServerSideSort,
  sortParam,
  onSortClick,
  dir,
}: IUseCellSortingProps) => {
  const dataKey = useMemo(() => {
    return data?.column?.dataKey;
  }, [data?.column?.dataKey]);

  const handleSortClick = useCallback(() => {
    if (!sortable || !setSorting || !dataKey) return;
    if (dir === 0) {
      setSorting([
        {
          key: sortParam ?? dataKey,
          dir: "asc",
          isServerSide: isServerSideSort,
        },
      ]);
      onSortClick?.(dataKey, "ASC");
    } else if (dir === 1) {
      setSorting([
        {
          key: sortParam ?? dataKey,
          dir: "desc",
          isServerSide: isServerSideSort,
        },
      ]);
      onSortClick?.(dataKey, "DESC");
    } else {
      setSorting([]);
    }
  }, [
    dataKey,
    dir,
    sortable,
    setSorting,
    isServerSideSort,
    onSortClick,
    sortParam,
  ]);

  return { dir, handleSortClick };
};
