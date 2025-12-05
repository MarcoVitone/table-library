import type { FC } from "react";
import { IconButton } from "@mui/material";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import type { TExtendedButtonProps } from "../../table-sub-components/button/button.tsx";
import { useTable } from "../../../hooks/use-table/use-table.ts";

interface IContext {
  isSelected: boolean | undefined;
  isPinned: boolean | undefined;
}

interface IAction {
  icon: TExtendedButtonProps["icon"];
  onAction: (
    item: Record<string, unknown>,
    context: IContext
  ) => void | Promise<unknown>;
  onPrompt?: (
    item: Record<string, unknown>,
    context: IContext
  ) => void | Promise<boolean>;
  onEnd?: (item: Record<string, unknown>, context: IContext) => void;
  variant?: TExtendedButtonProps["variant"];
}

interface IActionsCellProps extends IBaseCellProps {
  actions?: IAction[];
  labelAfter?: boolean;
}

const ActionsCell: FC<IActionsCellProps> = ({
  actions = [],
  data,
  label = "",
  labelAfter = false,
  ...rest
}) => {
  const { rowStatus, setRowStatus } = useTable(data);

  const isLoading = !!rowStatus && rowStatus.state === "pending";

  return (
    <BaseCell data={data} {...rest}>
      <span
        style={{
          display: "flex",
          gap: 4,
        }}
      >
        {actions.map(({ icon, onAction, onPrompt, onEnd }, index) => {
          return (
            <IconButton
              key={index + index}
              disabled={isLoading}
              onClick={async () => {
                const context = {
                  isSelected: rowStatus?.isSelected,
                  isPinned: rowStatus?.isPinned,
                };

                const res = onPrompt
                  ? await onPrompt(data.row.source.full, context)
                  : true;

                if (!res) {
                  return;
                }

                const val = onAction(data.row.source.full, context);

                if (val instanceof Promise) {
                  setRowStatus({ state: "pending" });

                  await val;

                  setRowStatus({ state: "ready" });
                }

                if (onEnd) {
                  onEnd(data.row.source.full, context);
                }
              }}
            >
              {labelAfter ? (
                <>
                  {icon}
                  {label}
                </>
              ) : (
                <>
                  {label}
                  {icon}
                </>
              )}
            </IconButton>
          );
        })}
      </span>
    </BaseCell>
  );
};

export type { IAction, IActionsCellProps };
export { ActionsCell };
