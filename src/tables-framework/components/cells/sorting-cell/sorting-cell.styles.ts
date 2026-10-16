import { createElement, type CSSProperties } from "react";
import { BaseCell, type IBaseCellProps } from "../base-cell/base-cell";
import type { TDirection } from "@/tables-framework/defines/common.types";
export function SortingBaseCell({
  direction,
  disabled,
  textAlignment,
  padding,
  ...props
}: IBaseCellProps & {
  direction: TDirection;
  disabled: boolean;
}) {
  return createElement(BaseCell, {
    ...props,
    textAlignment,
    padding: padding || '.5rem',
    className: ['tbl-sorting-cell', props.className].filter(Boolean).join(' '),
    style: {
      '--sort-direction': direction,
      '--sort-align': textAlignment === 'left' ? 'flex-start' : textAlignment === 'right' ? 'flex-end' : 'center',
      '--sort-cursor': disabled ? 'not-allowed' : 'pointer'
    } as CSSProperties
  });
}
