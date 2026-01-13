import type { FC } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ViewColumn, RestartAlt } from "@mui/icons-material";
import { FlexBox } from "@/tables-framework/components/table-sub-components/flex-box/flex-box";

interface ITableToolbarProps {
  onOpenConfig: () => void;
  onResetLayout?: () => void;
  showConfigButton?: boolean;
}

const TableToolbar: FC<ITableToolbarProps> = ({
  onOpenConfig,
  onResetLayout,
  showConfigButton = false,
}) => {
  if (!showConfigButton && !onResetLayout) return null;

  return (
    <FlexBox
      justifyContent="flex-end"
      alignItems="center"
      padding="0.5rem"
      gap="0.5rem"
      style={{ marginBottom: "0.5rem" }}
    >
      {onResetLayout && (
        <Tooltip title="Ripristina vista di default">
          <IconButton onClick={onResetLayout} size="small">
            <RestartAlt />
          </IconButton>
        </Tooltip>
      )}
      {showConfigButton && (
        <Tooltip title="Configura colonne">
          <IconButton onClick={onOpenConfig} size="small">
            <ViewColumn />
          </IconButton>
        </Tooltip>
      )}
    </FlexBox>
  );
};

export { TableToolbar };
