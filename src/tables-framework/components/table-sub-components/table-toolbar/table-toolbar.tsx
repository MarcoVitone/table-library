import type { FC } from "react";
import { IconButton } from "@/tables-framework/ui/controls";
import { ViewColumn, RestartAlt } from "@/tables-framework/ui/icons";
import { FlexBox } from "../flex-box/flex-box";
interface ITableToolbarProps {
  onOpenConfig: () => void;
  onResetLayout?: () => void;
  showConfigButton?: boolean;
}
const TableToolbar: FC<ITableToolbarProps> = ({
  onOpenConfig,
  onResetLayout,
  showConfigButton = false
}) => {
  if (!showConfigButton && !onResetLayout) return null;
  return <FlexBox justifyContent="flex-end" alignItems="center" padding=".5rem" gap=".5rem" style={{
    marginBottom: '.5rem'
  }}>
 {onResetLayout && <IconButton title="Ripristina vista di default" aria-label="Ripristina vista di default" onClick={onResetLayout} size="small"><RestartAlt /></IconButton>}
 {showConfigButton && <IconButton title="Configura colonne" aria-label="Configura colonne" onClick={onOpenConfig} size="small"><ViewColumn /></IconButton>}
 </FlexBox>;
};
export { TableToolbar };
