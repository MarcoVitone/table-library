import {
  useRef,
  useMemo,
  Children,
  isValidElement,
  type ReactElement,
} from "react";
import { Fragment } from "react/jsx-runtime";
import type {
  IColumnGroup,
  TJSX,
  IColumn,
} from "@/tables-framework/defines/common.types";
import { ObjectUtils } from "@/tables-framework/utils";
import {
  ColumnGroup,
  type IColumnGroupProps,
} from "@/tables-framework/components/table-parser/components/column-group/column-group";
import {
  Column,
  type IColumnProps,
} from "@/tables-framework/components/table-parser/components/column/column";
import { parseColumn } from "@/tables-framework/components/table-parser/utils/parse-column/parse-column";

interface IRecursionCtx {
  groups: IColumnGroup[];
  ids: Set<string>;
}

interface IProps {
  src: TJSX;
  freeze: boolean;
}

function useParser({ src, freeze }: IProps) {
  const srcRef = useRef(src);

  const memoized = useMemo(() => {
    if (freeze) {
      return srcRef.current;
    }

    return (srcRef.current = src);
  }, [freeze, src]);

  return useMemo(() => {
    // PARSE JSX STRUCTURE AND CREATE COLUMN DESCRIPTORS

    const output: IColumn[] = [];

    if (!memoized) {
      return output;
    }

    ObjectUtils.forEach(
      Children.toArray(memoized),
      ({ value, skip }, ctx: IRecursionCtx) => {
        if (!isValidElement(value)) {
          return;
        }

        switch (true) {
          case value.type === ColumnGroup: {
            const elem = value as ReactElement<IColumnGroupProps>;

            return {
              ...ctx,
              groups: [
                ...ctx.groups,
                // ADD GROUP TO RECURSION CONTEXT
                {
                  groupKey: elem.props.groupKey,
                  label: elem.props.label,
                },
              ],
            };
          }

          case value.type === Column: {
            skip(); // SKIP THIS BRANCH RECURSION

            const elem = value as ReactElement<IColumnProps>;

            const column = parseColumn(
              elem,
              ctx.groups,
              ctx.ids,
              output.length
            );

            if (!column.id) {
              break;
            }

            // ADD ROOT GROUP (FOR MAIN HEADER ROW)
            column.groups.unshift({
              label: column.label,
              groupKey: "root",
            } as IColumnGroup);

            // ADD COLUMN TO OUTPUT
            output.push(column);

            break;
          }

          default: {
            if (value.type !== Fragment) {
              skip(); // SKIP THIS BRANCH RECURSION

              console.warn(
                `UNEXPECTED TABLE CHILDREN ELEMENT. ONLY Column AND ColumnGroup ARE ACCEPTED. SKIPPING.`
              );
            }

            break;
          }
        }
      },
      {
        only: ["children", "props", /[\d]*$/],
        context: {
          groups: [],
          ids: new Set<string>(),
        },
      }
    );

    return output;
  }, [memoized]);
}

export { useParser };
