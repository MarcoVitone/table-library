import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useMemo } from "react";
import { useTheme } from "@mui/material";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { SortingBaseCell } from "./sorting-cell.styles.ts";
import type { TAlignment, TDirection } from "../../../defines/common.types.ts";
import { ArrowUpward } from "@mui/icons-material";
import { animated } from "@react-spring/web";
import { useTable } from "../../../hooks/use-table/use-table.ts";
import { useSpring } from "../../../hooks/use-spring/use-spring.ts";

type TSortDirection = "ASC" | "DESC";

interface ISortingCellProps extends IBaseCellProps {
  icon?: ReactNode;
  disabled?: boolean;
  direction?: TDirection;
  textAlignment?: TAlignment;
  padding?: string;
  onClick?: (dataKey: string, dir: TSortDirection) => void;
  isServerSide?: boolean;
}

const SortingCell: FC<ISortingCellProps> = ({
  icon = <ArrowUpward style={{ width: "1rem", height: "1rem" }} />,
  disabled = false,
  direction = "row",
  textAlignment = "center",
  padding,
  data,
  onClick,
  isServerSide = true,
  ...rest
}) => {
  const { palette } = useTheme();

  const { sorting, setSorting } = useTable();

  const dataKey = useMemo(() => {
    return data.column.dataKey;
  }, [data.column.dataKey]);

  const dir = useMemo<-1 | 0 | 1>(() => {
    if (sorting) {
      for (const sort of sorting) {
        if (sort.key === dataKey) {
          return sort.dir === "asc" ? 1 : -1;
        }
      }
    }

    return 0;
  }, [dataKey, sorting]);

  const angle = useMemo(() => {
    switch (dir) {
      case -1:
        return 180;
      case 0:
        return 90;
      case 1:
        return 0;
      default:
        return 0;
    }
  }, [dir]);

  const [rotation, api] = useSpring({
    rotate: angle,
  });

  const handleClick = useCallback(() => {
    if (!setSorting || disabled) {
      return;
    }

    if (dir === -1 || dir === 0) {
      setSorting([{ key: dataKey, dir: "asc", isServerSide: isServerSide }]);
      onClick?.(dataKey, "ASC");
    } else {
      setSorting([{ key: dataKey, dir: "desc", isServerSide: isServerSide }]);
      onClick?.(dataKey, "DESC");
    }
  }, [dataKey, dir, disabled, setSorting]);

  useEffect(() => {
    api.start({ rotate: angle });
  }, [angle, api]);

  return (
    <SortingBaseCell
      data={data}
      direction={direction}
      disabled={disabled}
      textAlignment={textAlignment}
      padding={padding}
      {...rest}
    >
      <span onClick={handleClick} tabIndex={1}>
        {data.column.label}
        <animated.span style={rotation}>
          <span style={{ color: palette.primary.main }}>{icon}</span>
        </animated.span>
      </span>
    </SortingBaseCell>
  );
};

export type { ISortingCellProps, TSortDirection };
export { SortingCell };
