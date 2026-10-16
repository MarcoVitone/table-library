import { VisibilityOff } from "@/tables-framework/ui/icons";
import { IconButton } from "@/tables-framework/ui/controls";
import type { Palette } from "@/tables-framework/theme/theme";
interface IHideButton {
  handleCollapseColumn: (event: React.MouseEvent<Element, MouseEvent>) => void;
  palette: Palette;
  title: string;
}
export function HideButton({
  handleCollapseColumn,
  palette,
  title
}: IHideButton) {
  return <IconButton className="hide-button" title={title} aria-label={title} size="small" onClick={handleCollapseColumn} style={{
    padding: 2,
    marginLeft: 4,
    color: palette.primary.main
  }}><VisibilityOff fontSize="inherit" style={{
      fontSize: '1rem'
    }} /></IconButton>;
}
