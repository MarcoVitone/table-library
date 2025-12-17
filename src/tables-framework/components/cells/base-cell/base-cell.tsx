import type { DragEvent, ElementType, FC, ReactNode, Ref } from "react";
import { useCallback, useMemo, useEffect } from "react";
import { ArrowUpward, VisibilityOff } from "@mui/icons-material";
import { IconButton, useTheme } from "@mui/material";
import { animated } from "@react-spring/web";
import type {
  IBorderConfig,
  ICellProps,
  TAlignment,
  TtextTransform,
} from "../../../defines/common.types.ts";
import { useSpring } from "../../../hooks/use-spring/use-spring.ts";
import { useTable } from "../../../hooks/use-table/use-table.ts";
import { BaseCellComponent } from "./base-cell.styles.ts";
import { ColumnResizer } from "../../table-sub-components/column-resizer/column-resizer.tsx";
import { useColumnDrag } from "../../../hooks/use-column-drag/use-column-drag.ts";

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
  borderRight?: IBorderConfig;
  borderBottom?: IBorderConfig;
  borderTop?: IBorderConfig;
  borderLeft?: IBorderConfig;
  stickyLeft?: string;
  measuredRef?: Ref<HTMLTableCellElement>;
  isResizable?: boolean;
  // Hiding
  enableHiding?: boolean;
  onHide?: () => void;

  // Drag & Drop
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLTableCellElement>) => void;
  onDragOver?: (e: DragEvent<HTMLTableCellElement>) => void;
  onDrop?: (e: DragEvent<HTMLTableCellElement>) => void;
  onDragEnter?: (e: DragEvent<HTMLTableCellElement>) => void;
  onDragLeave?: (e: DragEvent<HTMLTableCellElement>) => void;
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
  borderTop,
  borderLeft,
  stickyLeft,
  measuredRef,
  isResizable,
  enableHiding,
  onHide,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  ...rest
}) => {
  const type = variant || area;

  const { palette } = useTheme();
  const { sorting, setSorting, stickyHeader, rowStatus, setColumnLayout } =
    useTable(data);

  const {
    dragProps,
    isDragging: isDraggingColumn,
    isOver,
  } = useColumnDrag({
    columnId: data?.column?.id || "",
    enabled: (draggable && (type === "header" || area === "header")) || false, // Abilita solo se header
  });

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

  const handleResizeEnd = useCallback(
    (newWidth: number) => {
      if (data?.column?.id && setColumnLayout) {
        // Aggiorna lo stato globale della tabella con la nuova larghezza
        setColumnLayout(
          {
            props: {
              width: newWidth, // Salva la larghezza in pixel
              isHidden: data.column.props.isHidden,
            },
          },
          data.column.id
        );
      }
    },
    [data?.column?.id, data?.column?.props?.isHidden, setColumnLayout]
  );

  const handleHideColumn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Evita di triggerare il sort o il drag

      if (data?.column?.id && setColumnLayout) {
        // Aggiorna lo stato globale impostando isHidden a true
        setColumnLayout(
          {
            props: { isHidden: true, width: data.column.props.width },
          },
          data.column.id
        );
      }

      if (onHide) onHide();
    },
    [data?.column?.id, setColumnLayout, onHide]
  );

  const justifyContent = useMemo(() => {
    if (textAlignment === "center") return "center";
    if (textAlignment === "right") return "flex-end";
    return "flex-start";
  }, [textAlignment]);

  return (
    <BaseCellComponent
      ref={measuredRef}
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
        opacity: isDraggingColumn ? 0.5 : 1,
        backgroundColor: isDraggingColumn ? "#f0f0f0" : undefined,
        border: isDraggingColumn
          ? `2px dashed ${palette.neutral?.light || "#999"}`
          : undefined,
        borderLeft:
          isOver && !isDraggingColumn
            ? `3px solid ${palette.primary.main}`
            : undefined,
        ...(onHeaderClick ? { cursor: "pointer" } : {}),
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
      borderTop={borderTop}
      borderLeft={borderLeft}
      stickyLeft={stickyLeft}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      {...dragProps}
      {...rest}
    >
      {sortable ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent,
            gap: "4px",
            width: "100%",
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
      {(type === "header" || area === "header") && enableHiding && (
        <IconButton
          size="small"
          onClick={handleHideColumn}
          sx={{
            padding: "2px",
            marginLeft: "4px",
            opacity: 0.5, // Leggermente trasparente di default
            "&:hover": { opacity: 1, color: palette.error.main },
          }}
          title="Nascondi colonna"
        >
          <VisibilityOff fontSize="inherit" style={{ fontSize: "1rem" }} />
        </IconButton>
      )}
      {(type === "header" || area === "header") && isResizable && (
        <ColumnResizer onResizeEnd={handleResizeEnd} />
      )}
    </BaseCellComponent>
  );
};

export type { IBaseCellProps, TVariant };
export { BaseCell };
