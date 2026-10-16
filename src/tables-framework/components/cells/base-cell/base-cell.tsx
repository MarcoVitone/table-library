import type { ElementType, FC, ReactNode, Ref } from "react";
import { useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { ArrowUpward } from "@/tables-framework/ui/icons";
import { useTheme } from "@/tables-framework/theme/theme";
import type {
  IBorderConfig,
  ICellProps,
  TAlignment,
  TtextTransform,
} from "@/tables-framework/defines/common.types.ts";

import { useTable } from "@/tables-framework/hooks/use-table/use-table.ts";
import { BaseCellComponent } from "./base-cell.styles.ts";
import { useCellCollapse, useCellSorting } from "./base-cell.hooks.ts";
import { ColumnResizer } from "@/tables-framework/components/table-sub-components/column-resizer/column-resizer.tsx";
import { useColumnDrag } from "@/tables-framework/hooks/use-column-drag/use-column-drag.ts";
import { DraggableButton } from "@/tables-framework/components/table-sub-components/draggable-button/draggable-button.tsx";
import { HideButton } from "@/tables-framework/components/table-sub-components/hide-button/hide-button.tsx";
import SortIcon from "@/tables-framework/components/table-sub-components/sort-icon/sort-icon.tsx";
import CollapsedComponent from "@/tables-framework/components/table-sub-components/collapsed-component/collapsed-component.tsx";
import { FilterMenu } from "@/tables-framework/components/table-sub-components/filter-menu/filter-menu.tsx";

type TVariant = "header" | "body" | "footer";

type TSortDirection = "ASC" | "DESC";

interface IBaseCellProps extends ICellProps {
  component?: ElementType;
  className?: string;
  style?: React.CSSProperties;
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
  rowBackgroundColor?: string;
  rowSelectedColor?: string;
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
  minWidth?: string | number;
  // Hiding
  enableHiding?: boolean;
  onHide?: () => void;

  // Drag & Drop
  draggable?: boolean;
  dragHandleVisibility?: "always" | "hover";
}

const BaseCell: FC<IBaseCellProps> = ({
  component,
  variant,
  style: styleProp,
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
  isServerSideSort = false,
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
  minWidth: minWidthProp,
  enableHiding,
  draggable,
  dragHandleVisibility = "always",
  ...rest
}) => {
  const type = variant || area;
  const { palette } = useTheme();
  const innerRef = useRef<HTMLTableCellElement>(null);
  const columnProps = data?.column;
  const currentWidth = columnProps?.props?.width;
  const savedWidth = columnProps?.props?.savedWidth;

  const {
    sorting,
    setSorting,
    stickyHeader,
    rowStatus,
    setColumnLayout,
    setColumnsLayout,
    enableColumnFilters,
  } = useTable(data);

  const {
    dragProps,
    isDragging: isDraggingColumn,
    isOver,
  } = useColumnDrag({
    columnId: data?.column?.id || "",
    enabled: (draggable && (type === "header" || area === "header")) || false,
  });

  const { isCollapsed, handleExpandColumn, handleCollapseColumn } =
    useCellCollapse({
      data,
      setColumnLayout,
      currentWidth: currentWidth ?? undefined,
      savedWidth: savedWidth ?? undefined,
      innerRef,
    });

  const handleHeaderClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isCollapsed && onHeaderClick) {
        onHeaderClick(e);
      }
    },
    [isCollapsed, onHeaderClick]
  );

  const handleHeaderDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) {
        handleExpandColumn(e);
      }
    },
    [isCollapsed, handleExpandColumn]
  );

  useImperativeHandle(measuredRef, () => innerRef.current!);

  const {
    draggable: isDomDraggable,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    ...targetProps
  } = dragProps;

  const handleStyle = useMemo(() => {
    const baseStyle = {
      position: "absolute" as const,
      right: "4px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "grab",
      color: palette.neutral?.light || "#999",
      display: "flex",
      alignItems: "center",
      zIndex: 10,
      transition: "opacity 0.2s ease-in-out",
    };

    if (dragHandleVisibility === "hover") {
      return { ...baseStyle, opacity: 0 };
    }
    return { ...baseStyle, opacity: 1 };
  }, [dragHandleVisibility, palette.neutral?.light]);

  const hideButtonStyle = useMemo(() => {
    const baseStyle = {
      position: "absolute" as const,
      right: draggable ? "30px" : "4px", // Position left of drag handle (if present)
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
    };
    return baseStyle;
  }, [draggable]);

  const contentWrapperStyle = useMemo(() => {
    // Add padding for HideButton if it's visible (header/enabled/!collapsed)
    // SortIcon handles padding for DraggableButton independently.
    const needsHidePadding =
      (type === "header" || area === "header") && enableHiding && !isCollapsed;
    return {
      width: "100%",
      paddingRight: needsHidePadding ? "30px" : "0",
      boxSizing: "border-box" as const,
      display: "flex",
      alignItems: "center",
    };
  }, [type, area, enableHiding, isCollapsed]);

  const isSelected = !!rowStatus && rowStatus.isSelected;

  const dir = useMemo<-1 | 0 | 1>(() => {
    if (sorting && sortable) {
      for (const sort of sorting) {
        if (sort.key === data?.column?.dataKey)
          return sort.dir === "asc" ? 1 : -1;
      }
    }
    return 0;
  }, [data?.column?.dataKey, sorting, sortable]);

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

  const { handleSortClick } = useCellSorting({
    data,
    setSorting,
    sortable,
    isServerSideSort,
    sortParam,
    onSortClick,
    dir,
  });

  const handleResizeEnd = useCallback(
    (newWidth: number, columnWidths?: Record<string, number>) => {
      if (columnWidths && setColumnsLayout) {
        setColumnsLayout((previous) => previous.map((column) => {
          const width = columnWidths[column.id];
          return width === undefined ? column : {
            ...column,
            props: { ...column.props, width },
          };
        }));
      } else if (data?.column?.id && setColumnLayout) {
        setColumnLayout(
          { props: { width: newWidth, isHidden: data.column.props.isHidden } },
          data.column.id
        );
      }
    },
    [data, setColumnLayout, setColumnsLayout]
  );

  const justifyContent = useMemo(() => {
    if (textAlignment === "center") return "center";
    if (textAlignment === "right") return "flex-end";
    return "flex-start";
  }, [textAlignment]);

  const filterMenu = useMemo(() => {
    const config = data?.column?.props?.filterConfig;
    if (
      (type === "header" || area === "header") &&
      enableColumnFilters &&
      config &&
      data?.column?.dataKey &&
      !isCollapsed
    ) {
      return (
        <div style={{ marginLeft: "4px" }}>
          <FilterMenu dataKey={data.column.dataKey} config={config} />
        </div>
      );
    }
    return null;
  }, [type, area, enableColumnFilters, data, isCollapsed]);

  const cellContent = useMemo(() => {
    if (isCollapsed) {
      return <CollapsedComponent />;
    } else if (sortable) {
      return (
        <SortIcon
          draggable={draggable}
          type={type}
          area={area}
          handleSortClick={handleSortClick}
          angle={angle}
          palette={palette}
          sortIcon={sortIcon}
          justifyContent={justifyContent}
        >
          {children}
          {filterMenu}
        </SortIcon>
      );
    } else {
      return (
        <>
          {children}
          {filterMenu}
        </>
      );
    }
  }, [
    isCollapsed,
    sortable,
    draggable,
    type,
    area,
    handleSortClick,
    palette,
    sortIcon,
    justifyContent,
    children,
    angle,
    filterMenu,
  ]);

  let cellBackgroundColor: string | undefined;
  if (isCollapsed) {
    cellBackgroundColor = palette.neutral?.ultraLight || "#999";
  } else if (isDraggingColumn) {
    cellBackgroundColor = "#f0f0f0";
  }

  return (
    <BaseCellComponent
      component={component ?? (area === "header" || type === "header" ? "th" : "td")}
      scope={area === "header" || type === "header" ? (colSpan > 1 ? "colgroup" : "col") : undefined}
      aria-sort={(area === "header" || type === "header") && sortable
        ? dir === 1 ? "ascending" : dir === -1 ? "descending" : "none"
        : undefined}
      tabIndex={isCollapsed && (area === "header" || type === "header") ? 0 : undefined}
      aria-label={isCollapsed && (area === "header" || type === "header")
        ? `${data?.column?.label ?? "Colonna"}: premi Invio per espandere` : undefined}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (isCollapsed && (area === "header" || type === "header") && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleExpandColumn();
        }
      }}
      ref={innerRef}
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
      onClick={handleHeaderClick}
      onDoubleClick={handleHeaderDoubleClick}
      style={{
        boxSizing: "border-box",
        width: currentWidth || "auto",
        minWidth: minWidthProp || currentWidth || "max-content",
        maxWidth: typeof currentWidth === "number"
          ? currentWidth
          : maxWidth ?? (ellipsis ? currentWidth || "auto" : "none"),
        // Only active layout and interaction states override the base styles.
        ...(typeof currentWidth === "number"
          ? { overflow: overFlow ?? "hidden" }
          : {}),
        ...(isDraggingColumn ? {
          opacity: 0.5,
          borderTop: `2px dashed ${palette.neutral?.light || "#999"}`,
          borderRight: `2px dashed ${palette.neutral?.light || "#999"}`,
          borderBottom: `2px dashed ${palette.neutral?.light || "#999"}`,
          borderLeft: `2px dashed ${palette.neutral?.light || "#999"}`,
        } : {}),
        ...(cellBackgroundColor !== undefined
          ? { backgroundColor: cellBackgroundColor }
          : {}),
        ...(isOver && !isDraggingColumn
          ? { borderLeft: `3px solid ${palette.primary.main}` }
          : {}),
        ...(isCollapsed ? { padding: "0" } : {}),
        ...(onHeaderClick ? { cursor: "pointer" } : {}),
        ...styleProp,
      }}
      data-column-id={data?.column?.id}
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
      {...dragProps}
      {...targetProps}
      {...rest}
    >
      <div style={contentWrapperStyle}>{cellContent}</div>
      {(type === "header" || area === "header") &&
        draggable &&
        !isCollapsed && (
          <DraggableButton
            isDomDraggable={isDomDraggable}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleStyle={handleStyle}
          />
        )}
      {(type === "header" || area === "header") &&
        enableHiding &&
        !isCollapsed && (
          <div style={hideButtonStyle}>
            <HideButton
              handleCollapseColumn={handleCollapseColumn}
              palette={palette}
              title="Collassa colonna"
            />
          </div>
        )}

      {(type === "header" || area === "header") &&
        isResizable &&
        !isCollapsed && colSpan === 1 && (
          <ColumnResizer onResizeEnd={handleResizeEnd} minWidth={minWidthProp} width={currentWidth} label={data?.column?.label} />
        )}
    </BaseCellComponent>
  );
};

export type { IBaseCellProps, TVariant };
export { BaseCell };
