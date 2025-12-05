import { type ReactElement, Children, isValidElement } from "react";
import type { IColumnGroup, IColumn } from "../../../../defines/common.types";
import { resolveSingleElement } from "../../../../utils/resolve-single-element/resolve-single-element";
import {
  BodyCell,
  type IBodyCellProps,
} from "../../components/body-cell/body-cell";
import type { IColumnProps } from "../../components/column/column";
import {
  FooterCell,
  type IFooterCellProps,
} from "../../components/footer-cell/footer-cell";
import {
  HeaderCell,
  type IHeaderCellProps,
} from "../../components/header-cell/header-cell";

function resolve<T>(val: T | undefined, def: T): T {
  if (typeof val !== "undefined") {
    return val;
  } else {
    return def;
  }
}

function parseColumn(
  elem: ReactElement<IColumnProps>,
  groups: IColumnGroup[],
  ids: Set<string>,
  index: number
): IColumn {
  const { props } = elem;

  const output: IColumn = {
    id: "",
    label: "",
    dataKey: "",
    posX: index,
    cells: {
      header: null,
      body: null,
      footer: null,
    },
    rows: {
      header: null,
      body: null,
      footer: null,
    },
    aggregator: null,
    groups: [...groups],
    data: [],
    props: {
      isHidden: resolve(props.isHidden, false),
      isResizable: resolve(props.isResizable, true),
      width: resolve(props.width, null),
    },
  };

  Children.toArray(props.children).forEach((c) => {
    if (isValidElement(c)) {
      switch (true) {
        case c.type === HeaderCell: {
          const { cell, label } = c.props as IHeaderCellProps;

          output.cells.header = resolveSingleElement(cell);

          output.label = label;

          break;
        }

        case c.type === BodyCell: {
          const { cell, dataKey } = c.props as IBodyCellProps;

          output.cells.body = resolveSingleElement(cell);

          output.dataKey = dataKey;

          break;
        }

        case c.type === FooterCell: {
          const { cell, aggregator } = c.props as IFooterCellProps;

          output.cells.footer = resolveSingleElement(cell);

          output.aggregator = aggregator || null;

          break;
        }

        default: {
          console.warn(
            `UNEXPECTED COLUMN CHILDREN ELEMENT. ONLY HeaderCell, BodyCell AND FooterCell ARE ACCEPTED. SKIPPING.`
          );
          break;
        }
      }
    }
  });

  const prefix = [...groups.map((g) => g.groupKey), output.dataKey].join(".");

  const id = prefix + (props.suffix ? `.${props.suffix}` : "");

  if (ids.has(prefix) && !props.suffix) {
    console.warn(
      `FOUND REPEATED COLUMN AT SAME LEVEL. IF THIS IS INTENDED, SPECIFY A UNIQUE suffix TO DIFFERENTIATE THEM. SKIPPING COLUMN`
    );
  } else if (ids.has(id)) {
    console.warn(
      `COLUMN ID CONFLICT. MAKE SURE suffix IS UNIQUE FOR EACH REPEATED COLUMN AT A SAME LEVEL. SKIPPING COLUMN`
    );
  } else {
    ids.add(prefix);
    ids.add(id);

    output.id = id;
  }

  return output;
}

export { parseColumn };
