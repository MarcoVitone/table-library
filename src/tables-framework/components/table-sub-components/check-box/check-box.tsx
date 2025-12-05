import type { FC } from "react";
import { Check } from "@mui/icons-material";
import type { CheckboxProps as MUICheckboxProps } from "@mui/material";
import { Checkbox } from "./check-box.styles.ts";

type TTableCheckboxState = "default" | "output";

interface ICustomProps {
  state?: TTableCheckboxState;
  checked?: boolean;
}

type TTableCheckboxProps = MUICheckboxProps & ICustomProps;

const TableCheckbox: FC<TTableCheckboxProps> = ({
  state = "default",
  checked = false,
  ...props
}) => {
  return (
    <>
      {state === "default" ? (
        <Checkbox {...props} checked={checked} />
      ) : (
        <Check color={"primary"} />
      )}
    </>
  );
};

export type { TTableCheckboxProps, TTableCheckboxState };
export { TableCheckbox };
