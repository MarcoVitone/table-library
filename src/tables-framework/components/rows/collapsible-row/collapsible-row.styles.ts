import { createElement, type ComponentProps } from "react";
import { BaseRow } from "../base-row/base-row";
export function ColBaseRow(props: ComponentProps<typeof BaseRow>) {
  return createElement(BaseRow, {
    ...props,
    style: {
      boxShadow: '0 1px 3px #0003',
      ...props.style
    }
  });
}
