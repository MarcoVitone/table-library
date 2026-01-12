import React from "react";
import type {
  ILinkObject,
  IRow,
  IRowNavigationConfig,
} from "../../../../defines/common.types";
import { LinkWrapper } from "../../../link-wrapper/link-wrapper";

function renderSingleRow<T>(
  row: IRow,
  rowIndex: number,
  onRowDoubleClick?: IRowNavigationConfig<T>
): React.ReactElement | null {
  if (!row.component) {
    return null;
  }

  let isEmptyRow = true;
  const isFirstBodyRow = row.area === "body" && rowIndex === 0;

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
        <Cell key={cell.id} colSpan={cell.colSpan}>
          {cell.value}
        </Cell>
      );
    } else {
      return (
        <Cell
          {...props}
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
        </Cell>
      );
    }
  });

  if (isEmptyRow && row.area === "footer") {
    return null;
  }

  const [Row, props] = row.component;

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
      <Row key={row.id} onDoubleClick={handleDoubleClick}>
        {children}
      </Row>
    );
  } else {
    return (
      <Row {...props} key={row.id} data={row} onDoubleClick={handleDoubleClick}>
        {children}
      </Row>
    );
  }
}

function renderRows<T>(
  rows: IRow[],
  onRowDoubleClick?: IRowNavigationConfig<T>
): (React.ReactElement | null)[] {
  return rows.map((row, rowIndex) =>
    renderSingleRow(row, rowIndex, onRowDoubleClick)
  );
}

export { renderRows, renderSingleRow };
