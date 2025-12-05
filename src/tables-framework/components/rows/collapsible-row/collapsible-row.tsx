import type { FC, JSX } from "react";
import React, { useCallback, useMemo } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import type { AccordionProps } from "@mui/material";
import { AccordionDetails, useTheme } from "@mui/material";
import type { IRowProps } from "../../../defines/common.types.ts";
import { ColBaseRow } from "./collapsible-row.styles.ts";
import { CustomAccordion } from "./styles/accordion/accordion.styles.ts";
import {
  CustomAccordionSummary,
  CustomBar,
} from "./styles/accordion-summary/accordion-summary.styles.ts";
import { FlexBox } from "../../table-sub-components/flex-box/flex-box.tsx";

interface ICollapsibleRowProps extends IRowProps {
  onClick?: AccordionProps["onChange"];
  selectedRowId?: string;
  newCreatedRowid?: string;
  onSelectRow?: (id: string, expanded: boolean) => void;
}

type TChildProps = Record<string, unknown> & {
  width: string | number | null;
};

type TChild = JSX.Element & {
  props: TChildProps;
};

const CollapsibleRow: FC<ICollapsibleRowProps> = ({
  onSelectRow,
  selectedRowId,
  newCreatedRowid,
  data,
  children,
  ...rest
}) => {
  const isOpen = useMemo(() => {
    return data.source.id === selectedRowId;
  }, [selectedRowId, data.source.id]);

  const { palette } = useTheme();

  const childArray: TChild[] = React.Children.toArray(
    children
  ) as unknown as TChild[];

  const getLastCellWidth = useCallback((colWidth: number | string | null) => {
    if (typeof colWidth === "string" && colWidth.includes("%")) {
      const indexOfLast = colWidth.indexOf("%");
      const colWidthNum = Number.parseInt(colWidth.slice(0, indexOfLast)) - 1;
      return `${colWidthNum}%`;
    } else {
      return colWidth;
    }
  }, []);

  return (
    <ColBaseRow {...rest} data={data}>
      <td colSpan={data.size}>
        <CustomAccordion
          isNewRow={newCreatedRowid === data.source.id}
          expanded={isOpen}
          onChange={() => {
            if (onSelectRow) {
              onSelectRow(data.source.id, !isOpen);
            }
          }}
          isSalesManager={data.source.full.isSalesManager as boolean}
        >
          <CustomAccordionSummary
            expandIcon={
              <KeyboardArrowDown sx={{ fill: palette.primary.main }} />
            }
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  {childArray.map((child, index) => {
                    if (index === childArray.length - 1) {
                      const newChild = {
                        ...child,
                        props: {
                          ...child.props,
                          width: getLastCellWidth(
                            (child.props as TChildProps).width
                          ),
                        } as TChildProps,
                      };
                      return newChild;
                    }
                    return child;
                  })}
                </tr>
              </tbody>
            </table>
          </CustomAccordionSummary>
          <AccordionDetails>
            <FlexBox>
              <CustomBar />
              {children}
            </FlexBox>
          </AccordionDetails>
        </CustomAccordion>
      </td>
    </ColBaseRow>
  );
};
export type { ICollapsibleRowProps };
export { CollapsibleRow };
