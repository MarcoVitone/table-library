import type { ElementType, FC, ReactNode } from "react";
import { useCallback, useMemo, useEffect } from "react";
import { ArrowUpward } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { animated } from "@react-spring/web";
import type {
  ICellProps,
  TAlignment,
  TtextTransform,
} from "../../../defines/common.types.ts";
import { useSpring } from "../../../hooks/use-spring/use-spring.ts";
import { useTable } from "../../../hooks/use-table/use-table.ts";
import { BaseCellComponent } from "./base-cell.styles.ts";

type TVariant = "header" | "body" | "footer";

type TSortDirection = "ASC" | "DESC";

interface IBaseCellProps extends ICellProps {
  component?: ElementType;
  variant?: TVariant;
  noLeftBorder?: boolean;
  noRightBorder?: boolean;
  noTopBorder?: boolean;
  noBorder?: boolean;
  borderColor?: string;
  selected?: boolean;
  textAlignment?: TAlignment;
  textTransform?: TtextTransform;
  label?: string;
  fontColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  bold?: string;
  padding?: string;
  overFlow?: string;
  textOverflow?: string;
  sortable?: boolean;
  sortIcon?: ReactNode;
  isServerSideSort?: boolean;
  queryParam?: string;
  sortParam?: string;
  backgroundColorSort?: string;
  onSortClick?: (dataKey: string, dir: TSortDirection) => void;
  showHeaderCheckbox?: boolean;
  onHeaderClick?: (e: React.MouseEvent) => void;
  isStickyCheckbox?: boolean;
  isFirstRow?: boolean;
  fixed?: boolean;
  wrapText?: boolean;
  ellipsis?: boolean;
  maxWidth?: string | number;
  borderRight?: import("../../../defines/common.types.ts").IBorderConfig;
  borderBottom?: import("../../../defines/common.types.ts").IBorderConfig;
}

const BaseCell: FC<IBaseCellProps> = ({
  variant,
  noLeftBorder,
  noRightBorder,
  noTopBorder,
  noBorder,
  borderColor,
  fontColor,
  backgroundColor,
  fontSize,
  bold,
  padding,
  area,
  colSpan,
  textAlignment = "start",
  textTransform = "none",
  children,
  overFlow,
  textOverflow,
  sortable = false,
  sortIcon = <ArrowUpward style={{ width: "1rem", height: "1rem" }} />,
  isServerSideSort = true,
  sortParam,
  backgroundColorSort,
  onSortClick,
  data,
  onHeaderClick,
  queryParam,
  isStickyCheckbox,
  wrapText,
  ellipsis,
  maxWidth,
  borderRight,
  borderBottom,
  ...rest
}) => {
  const type = variant || area;

  const { palette } = useTheme();
  const { sorting, setSorting, stickyHeader, rowStatus } = useTable(data);

  const isSelected = !!rowStatus && rowStatus.isSelected;

  const dataKey = useMemo(() => {
    return data?.column?.dataKey;
  }, [data?.column?.dataKey]);

  const dir = useMemo<-1 | 0 | 1>(() => {
    if (sorting && sortable) {
      for (const sort of sorting) {
        if (sort.key === dataKey) {
          return sort.dir === "asc" ? 1 : -1;
        }
      }
    }
    return 0;
  }, [dataKey, sorting, sortable]);

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

  useEffect(() => {
    if (sortable) {
      api.start({ rotate: angle });
    }
  }, [angle, api, sortable]);

  const handleSortClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!sortable || !setSorting || !dataKey) {
        return;
      }

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
    },
    [
      dataKey,
      dir,
      sortable,
      setSorting,
      isServerSideSort,
      onSortClick,
      sortParam,
    ]
  );

  const justifyContent = useMemo(() => {
    if (textAlignment === "center") return "center";
    if (textAlignment === "right") return "flex-end";
    return "flex-start";
  }, [textAlignment]);

  return (
    <BaseCellComponent
      colSpan={colSpan}
      noLeft={!!noLeftBorder}
      noRight={!!noRightBorder}
      noTop={!!noTopBorder}
      noBorder={noBorder}
      borderColor={borderColor}
      bold={!!bold || type === "header"}
      textPosition={textAlignment as TAlignment}
      textTransform={textTransform}
      fontColor={fontColor}
      backgroundColor={backgroundColor}
      fontSize={fontSize}
      padding={padding}
      overFlow={overFlow}
      textOverflow={textOverflow}
      isSorted={dir !== 0 && !!backgroundColorSort}
      backgroundColorSort={backgroundColorSort}
      isSortActive={dir !== 0}
      onClick={onHeaderClick}
      style={{
        cursor: onHeaderClick ? "pointer" : "default",
      }}
      data-query-param={queryParam}
      isSticky={
        (type === "header" || area === "header") &&
        (isStickyCheckbox || stickyHeader)
      }
      isSelected={isSelected}
      wrapText={wrapText}
      ellipsis={ellipsis}
      maxWidth={maxWidth}
      borderRight={borderRight}
      borderBottom={borderBottom}
      {...rest}
    >
      {sortable ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent,
            gap: "4px",
          }}
        >
          {children}
          <animated.span
            className="sort-icon"
            style={rotation}
            onClick={handleSortClick}
          >
            <span
              style={{
                color: palette.primary.main,
                display: "flex",
                cursor: "pointer",
              }}
            >
              {sortIcon}
            </span>
          </animated.span>
        </div>
      ) : (
        children
      )}
    </BaseCellComponent>
  );
};

export type { IBaseCellProps, TVariant };
export { BaseCell };
