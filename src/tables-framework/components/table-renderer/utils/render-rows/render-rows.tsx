import React from "react";
import { AccessibilityElement, AccessibilityScope } from "../../../../accessibility";
import type {
  ILinkObject,
  IRow,
  IRowNavigationConfig,
  IRowStyling,
} from "@/tables-framework/defines/common.types";
import { LinkWrapper } from "@/tables-framework/components/link-wrapper/link-wrapper";

interface IRenderRowsOptions<T> extends IRowStyling<T> {
  startIndex?: number;
  virtualRowHeight?: number;
  rowIndexOffset?: number;
}

function renderRows<T>(
  rows: IRow[],
  onRowDoubleClick?: IRowNavigationConfig<T>,
  { stripedRows = false, getRowStyle, startIndex = 0, virtualRowHeight, rowIndexOffset = 0 }: IRenderRowsOptions<T> = {}
): (React.ReactElement | null)[] {
  return rows.map((row, indexInWindow) => {
    const rowIndex = indexInWindow + startIndex;
    if (!row.component) {
      return null;
    }

    const [Row, props] = row.component;
    let rowStyle = props.style as React.CSSProperties | undefined;
    if (row.area === "body" && (stripedRows || getRowStyle)) {
      const colors = typeof stripedRows === "object" ? stripedRows : {};
      rowStyle = {
        ...(stripedRows ? {
          backgroundColor: rowIndex % 2 === 0
            ? colors.oddColor ?? "#ffffff"
            : colors.evenColor ?? "#f5f7fa",
        } : {}),
        ...rowStyle,
        ...getRowStyle?.(row.source.full as unknown as T, rowIndex),
      };
    }

    let isEmptyRow = true;
    if (virtualRowHeight !== undefined) rowStyle = { height: virtualRowHeight, ...rowStyle };
    const virtualProps = virtualRowHeight === undefined ? {} : {
      "data-virtual-row": row.id,
      "data-virtual-index": rowIndex,
      "aria-rowindex": rowIndexOffset + rowIndex + 1,
    };
    const isFirstBodyRow = row.area === "body" && rowIndex === 0; // <-- Calcola se è la prima riga del body

    const children = row.cells.map((cell, index) => {
      if (!cell.component) {
        return null;
      }

      const [Cell, props] = cell.component;

      if (isEmptyRow && cell.value !== null) {
        isEmptyRow = false;
      }

      if (typeof Cell === "string") {
        return (
          <AccessibilityElement as={Cell as "td"} slot="cell" context={{ cell, row, column: cell.column, area: row.area, index }} key={cell.id} colSpan={cell.colSpan} {...props}>
            {cell.value}
          </AccessibilityElement>
        );
      } else {
        return (
          <AccessibilityScope key={cell.id} context={{ cell, row, column: cell.column, area: row.area, index }}><Cell
            {...props}
            {...(rowStyle?.backgroundColor !== undefined && {
              rowBackgroundColor: rowStyle.backgroundColor,
            })}
            {...(rowStyle?.color !== undefined && {
              fontColor: props.fontColor ?? rowStyle.color,
            })}
            key={cell.id}
            colSpan={cell.colSpan}
            width={cell.column.props.width}
            data={cell}
            area={row.area}
            index={index}
            noTop={isFirstBodyRow}
          >
            <LinkWrapper
              config={row.area === "body" ? cell.column.link : undefined}
              row={row.source?.full as unknown as ILinkObject}
            >
              {cell.value}
            </LinkWrapper>
          </Cell></AccessibilityScope>
        );
      }
    });

    if (isEmptyRow && row.area === "footer") {
      return null;
    }

    const handleDoubleClick = () => {
      if (row.area !== "body" || !onRowDoubleClick) return;

      const {
        baseUrl,
        targetKey = "id",
        onNavigate,
        target = "_self",
      } = onRowDoubleClick;

      const rowData = row.source?.full as Record<string, unknown>;
      const id = rowData?.[targetKey as string];

      if (id === undefined || id === null) {
        console.warn(
          `Row double click: target key '${String(
            targetKey
          )}' not found in row data.`
        );
        return;
      }

      const path = `${baseUrl}/${id}`;

      if (onNavigate) {
        onNavigate(path);
      } else {
        window.open(path, target);
      }
    };

    if (typeof Row === "string") {
      return (
        <AccessibilityElement as={Row as "tr"} slot="row" context={{ row, area: row.area, index: rowIndex }} {...props} {...virtualProps} key={row.id} style={rowStyle} onDoubleClick={handleDoubleClick}>
          {children}
        </AccessibilityElement>
      );
    } else {
      return (
        <AccessibilityScope key={row.id} context={{ row, area: row.area, index: rowIndex }}><Row
          {...props}
          {...virtualProps}
          style={rowStyle}
          key={row.id}
          data={row}
          onDoubleClick={handleDoubleClick}
        >
          {children}
        </Row></AccessibilityScope>
      );
    }
  });
}

export { renderRows };
