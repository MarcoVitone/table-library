import { VisibilityOff } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import type { Palette } from "@mui/material/styles";

interface IHideButton {
  handleCollapseColumn: (e: React.MouseEvent<Element, MouseEvent>) => void;
  palette: Palette;
  title: string;
}

const HideButton = ({ handleCollapseColumn, palette, title }: IHideButton) => {
  return (
    <Tooltip title={title} className={"hide-button"}>
      <IconButton
        size="small"
        onClick={handleCollapseColumn}
        sx={{
          padding: "2px",
          marginLeft: "4px",
          opacity: 0.5,
          "&:hover": {
            opacity: 1,
            color: palette.primary.main,
          },
        }}
      >
        <VisibilityOff fontSize="inherit" style={{ fontSize: "1rem" }} />
      </IconButton>
    </Tooltip>
  );
};

export { HideButton };
