import type { FC, MouseEventHandler, ReactNode } from "react";
import { ArrowBackIosNewOutlined, ArrowForwardIos } from "@mui/icons-material";
import type { ButtonProps as MUIButtonProps } from "@mui/material";
import { Button, IconButton } from "./button.styles.ts";

type TButtonStatus = "default" | "disabled";
type TButtonVariation =
  | "default"
  | "default-icon-left"
  | "default-icon-right"
  | "icon-only"
  | "chip-style"
  | "chip-filters-style";

interface IButtonProps {
  label?: string;
  status?: TButtonStatus;
  icon?: ReactNode;
  variation?: TButtonVariation;
}

type TDefaultButtonProps = IButtonProps & {
  variation?: "default" | "default-icon-left" | "default-icon-right";
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type TDefaultIconButtonProps = IButtonProps & {
  variation?: "default-icon-left" | "default-icon-right";
  icon: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type TIconButtonProps = IButtonProps & {
  variation?: "icon-only";
  icon: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type TChipButtonProps = IButtonProps & {
  variation?: "chip-style";
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type TChipFiltersButtonProps = IButtonProps & {
  variation: "chip-filters-style";
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type TButtonProps =
  | TDefaultButtonProps
  | TDefaultIconButtonProps
  | TIconButtonProps
  | TChipButtonProps
  | TChipFiltersButtonProps;

type TExtendedButtonProps = MUIButtonProps & TButtonProps;

const TableButton: FC<TExtendedButtonProps> = ({
  label,
  status = "default",
  variation = "default",
  onClick,
  icon,
  ...props
}) => {
  return (
    <>
      {variation === "icon-only" ? (
        <IconButton
          disabled={status === "disabled"}
          status={"default"}
          variation={"default"}
          onClick={onClick}
        >
          {icon}
        </IconButton>
      ) : (
        <Button
          status={status}
          variation={variation}
          {...props}
          disabled={!!(status === "disabled" && variation !== "chip-style")}
          startIcon={
            variation === "default-icon-left" ? (
              <ArrowBackIosNewOutlined />
            ) : (
              props.startIcon
            )
          }
          endIcon={
            variation === "default-icon-right" ? (
              <ArrowForwardIos />
            ) : (
              props.endIcon
            )
          }
          onClick={onClick}
        >
          {label}
        </Button>
      )}
    </>
  );
};

export type { TButtonProps, TExtendedButtonProps };
export { TableButton };
