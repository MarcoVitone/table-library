import type { Palette } from "@mui/material/styles";
import { IconButton } from "@mui/material"; // Importa IconButton
import type { ReactNode } from "react";

interface ISortIcon {
  children?: ReactNode;
  draggable?: boolean;
  type?: "header" | "body" | "footer";
  area?: "header" | "body" | "footer";
  handleSortClick?: () => void;
  angle?: 0 | 90 | 180;
  palette: Palette;
  sortIcon?: ReactNode;
  justifyContent?: string;
}

const SortIcon = ({
  children,
  draggable,
  type,
  area,
  handleSortClick,
  angle = 0, // Valore di default
  palette,
  sortIcon,
  justifyContent,
}: ISortIcon) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent,
        gap: "4px",
        flex: 1,
        paddingRight:
          draggable && (type === "header" || area === "header") ? "24px" : "0",
      }}
    >
      {children}

      <IconButton
        className="sort-icon"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleSortClick?.();
        }}
        style={{
          color: palette.primary.main,
          transform: `rotate(${angle}deg)`,
          transition: "transform 0.2s ease-in-out",
          padding: "2px",
        }}
      >
        {sortIcon}
      </IconButton>
    </div>
  );
};

export default SortIcon;
