import type { FC } from "react";

type TDemoPage =
  | "basic"
  | "pagination"
  | "sorting-filtering"
  | "custom-cells"
  | "selection"
  | "draggable"
  | "resizable"
  | "collapsible"
  | "column-config";

interface IDemoNavigationProps {
  activePage: TDemoPage;
  onNavigate: (page: TDemoPage) => void;
}

const DemoNavigation: FC<IDemoNavigationProps> = ({
  activePage,
  onNavigate,
}) => {
  const pages: { id: TDemoPage; label: string }[] = [
    { id: "basic", label: "Base" },
    { id: "pagination", label: "Paginazione" },
    { id: "sorting-filtering", label: "Ordina & Filtra" },
    { id: "custom-cells", label: "Celle Custom" },
    { id: "selection", label: "Selezione" },
    { id: "draggable", label: "Drag & Drop" },
    { id: "resizable", label: "Ridimensionabile" },
    { id: "collapsible", label: "Collassabile" },
    { id: "column-config", label: "Config. Colonne" },
  ];

  return (
    <nav
      style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
        padding: "1rem",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onNavigate(page.id)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activePage === page.id ? "#1976d2" : "#fff",
            color: activePage === page.id ? "#fff" : "#1976d2",
            border: "1px solid #1976d2",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: activePage === page.id ? "bold" : "normal",
          }}
        >
          {page.label}
        </button>
      ))}
    </nav>
  );
};

export type { TDemoPage };
export { DemoNavigation };
