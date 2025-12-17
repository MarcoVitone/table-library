import type { FC } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ViewColumn } from "@mui/icons-material";
import { FlexBox } from "../flex-box/flex-box";

interface ITableToolbarProps {
  onOpenConfig: () => void;
  showConfigButton?: boolean;
}

const TableToolbar: FC<ITableToolbarProps> = ({
  onOpenConfig,
  showConfigButton = false,
}) => {
  if (!showConfigButton) return null;

  return (
    <FlexBox
      justifyContent="flex-end"
      alignItems="center"
      padding="0.5rem"
      gap="0.5rem"
      // Opzionale: aggiungi un bordo o background se vuoi staccarla visivamente
      style={{ marginBottom: "0.5rem" }}
    >
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
