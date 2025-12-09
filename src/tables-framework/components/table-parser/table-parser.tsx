import type { ComponentType } from "react";
import { useMemo } from "react";
import type {
  IDatum,
  ITableLayout,
  TCellCombo,
  TJSX,
  TRowCombo,
} from "../../defines/common.types.ts";
import type { ITableRendererProps } from "../table-renderer/table-renderer.tsx";
import { TableRenderer } from "../table-renderer/table-renderer.tsx";
import { useBody } from "./hooks/use-body/use-body.ts";
import { useColumns } from "./hooks/use-columns/use-columns.ts";
import { useData } from "./hooks/use-data/use-data.ts";
import { useExport } from "./hooks/use-export/use-export.ts";
import { useFooter } from "./hooks/use-footer/use-footer.ts";
import { useHeader } from "./hooks/use-header/use-header.ts";
import { useLayout } from "./hooks/use-layout/use-layout.ts";
import { useParser } from "./hooks/use-parser/use-parser.ts";

type TBase<T> = Omit<ITableRendererProps<T>, "source" | "api">;

interface ITableParserProps<T = unknown> extends TBase<T> {
  data: object[];
  cells: {
    header: TCellCombo;
    body: TCellCombo;
    footer: TCellCombo;
  };
  rows: {
    header: TRowCombo;
    body: TRowCombo;
    footer: TRowCombo;
  };
  idKey?: string;
  layout?: ITableLayout;
  onLayoutChange?: (newLayout: ITableLayout) => void;
  renderer?: ComponentType<ITableRendererProps<T>>;
  freeze?: boolean;
  children?: TJSX;
  onRowSelectionChange?: (data: T[]) => void;
  onRowDoubleClick?: import("../../defines/common.types.ts").IRowNavigationConfig<T>;
}

const TableParser = <T,>({
  data,
  cells,
  rows,
  idKey = "id",
  layout: externalLayout = undefined,
  onLayoutChange = undefined,
  renderer: RendererComponent = TableRenderer,
  freeze = false,
  children = null,
  onRowSelectionChange,
  onRowDoubleClick,
  ...rest
}: ITableParserProps<T>) => {
  const parsedColumns = useParser({
    src: children,
    freeze,
  });

  const {
    tableLayout,
    columnsLayout,
    setColumnsLayout,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination,
  } = useLayout({
    externalLayout,
    onLayoutChange,
    parsedColumns,
  });

  const resolvedColumns = useColumns({
    columns: parsedColumns,
    tableLayout,
  });

  const loadedColumns = useData({
    columns: resolvedColumns,
    tableLayout,
    data: data as IDatum[],
    idKey,
  });

  const header = useHeader({
    columns: loadedColumns,
    cell: cells.header,
    row: rows.header,
  });

  const body = useBody({
    columns: loadedColumns,
    cell: cells.body,
    row: rows.body,
  });

  const footer = useFooter({
    columns: loadedColumns,
    cell: cells.footer,
    row: rows.footer,
  });

  const source = {
    header,
    body,
    footer,
    columns: loadedColumns,
  };

  const { exportCSV, exportJSON } = useExport({
    source,
  });

  const parserAPI = useMemo(() => {
    return {
      tableLayout,
      columnsLayout,
      setColumnsLayout,
      sorting,
      setSorting,
      filtering,
      setFiltering,
      pagination,
      setPagination,
      exportCSV,
      exportJSON,
    };
  }, [
    tableLayout,
    columnsLayout,
    setColumnsLayout,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination,
    exportCSV,
    exportJSON,
  ]);

  return (
    <RendererComponent
      {...rest}
      source={source}
      parserAPI={parserAPI}
      onRowSelectionChange={onRowSelectionChange}
      onRowDoubleClick={onRowDoubleClick}
    />
  );
};

export type { ITableParserProps };
export { TableParser };
