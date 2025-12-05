import type { FC, ReactNode } from "react";
import type { IBaseBodyProps } from "../base-body/base-body.tsx";
import { BaseBody } from "../base-body/base-body.jsx";
import { TableData, TableRow } from "./empty-body.style.js";

type TBase = Omit<IBaseBodyProps, "children">;

interface IEmptyBodyProps extends TBase {
  content: ReactNode;
  height?: string;
}

const EmptyBody: FC<IEmptyBodyProps> = ({ content, ...rest }) => {
  return (
    <BaseBody {...rest}>
      <TableRow>
        <TableData>{content}</TableData>
      </TableRow>
    </BaseBody>
  );
};

export type { IEmptyBodyProps };
export { EmptyBody };
