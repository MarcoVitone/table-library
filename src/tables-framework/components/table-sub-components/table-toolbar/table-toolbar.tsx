import { useTableLocalization } from "@/tables-framework/localization/use-table-localization";
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
  const t = useTableLocalization();
  if (!showConfigButton && !onResetLayout) return null;
  return <FlexBox justifyContent="flex-end" alignItems="center" padding=".5rem" gap=".5rem" style={{
    marginBottom: '.5rem'
  }}>
 {onResetLayout && <IconButton accessibilitySlot="resetLayoutButton" title={t("a11y.reset")} aria-label={t("a11y.reset")} onClick={onResetLayout} size="small"><RestartAlt /></IconButton>}
 {showConfigButton && <IconButton accessibilitySlot="configureColumnsButton" title={t("a11y.configure")} aria-label={t("a11y.configure")} onClick={onOpenConfig} size="small"><ViewColumn /></IconButton>}
 </FlexBox>;
};
export { TableToolbar };
