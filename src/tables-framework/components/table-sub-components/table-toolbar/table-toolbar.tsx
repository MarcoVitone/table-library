import type { FC } from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  ViewColumn,
  RestartAlt,
  DensityLarge,
  DensityMedium,
  DensitySmall,
} from "@mui/icons-material";
import { FlexBox } from "../flex-box/flex-box";
import { useTable } from "../../../hooks/use-table/use-table";

interface ITableToolbarProps {
  onOpenConfig: () => void;
  onResetLayout?: () => void;
  showConfigButton?: boolean;
  enableDensity?: boolean;
}

const TableToolbar: FC<ITableToolbarProps> = ({
  onOpenConfig,
  onResetLayout,
  showConfigButton = false,
  enableDensity = false,
}) => {
  const { density, setDensity } = useTable();
  if (!showConfigButton && !enableDensity && !onResetLayout) return null;

  return (
    <FlexBox
      justifyContent="flex-end"
      alignItems="center"
      padding="0.5rem"
      gap="0.5rem"
      style={{ marginBottom: "0.5rem" }}
    >
      {enableDensity && (
        <FlexBox
          gap="0.25rem"
          alignItems="center"
          style={{ marginRight: "auto" }}
        >
          <Tooltip title="Compatta">
            <IconButton
              onClick={() => setDensity("compact")}
              size="small"
              color={density === "compact" ? "primary" : "default"}
            >
              <DensitySmall fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Standard">
            <IconButton
              onClick={() => setDensity("standard")}
              size="small"
              color={density === "standard" ? "primary" : "default"}
            >
              <DensityMedium fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ampia">
            <IconButton
              onClick={() => setDensity("comfortable")}
              size="small"
              color={density === "comfortable" ? "primary" : "default"}
            >
              <DensityLarge fontSize="small" />
            </IconButton>
          </Tooltip>
        </FlexBox>
      )}

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
