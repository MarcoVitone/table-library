import type { FC } from "react";
import { Check } from "@/tables-framework/ui/icons";
import type { CheckboxProps as NativeCheckboxProps } from "@/tables-framework/ui/controls";
import { Checkbox } from "./check-box.styles.ts";

type TTableCheckboxState = "default" | "output";

interface ICustomProps {
  state?: TTableCheckboxState;
  checked?: boolean;
}

type TTableCheckboxProps = NativeCheckboxProps & ICustomProps;

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
