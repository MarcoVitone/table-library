import type { TFunction } from "i18next";
import type {
  TColumnsLayout,
  TSorting,
  TFiltering,
  IPagination,
  ITableLayout,
  TRowsStatus,
  ISource,
  IColumnLayout,
  IRowStatus,
  IRow,
} from "./common.types";

type TChanger<T> = T | ((prevState: T) => T);
type TPartialChanger<T> = Partial<T> | ((prevState: T) => Partial<T>);

// *** LAYOUT API ***

type TSetColumnsLayout = (changer: TChanger<TColumnsLayout>) => void;
type TSetSorting = (changer: TChanger<TSorting>) => void;
type TSetFiltering = (changer: TChanger<TFiltering>) => void;
type TSetPagination = (changer: TChanger<IPagination>) => void;
type TResetLayout = () => void;

interface ILayoutAPI {
  tableLayout: ITableLayout | null;
  columnsLayout: TColumnsLayout | null;
  setColumnsLayout: TSetColumnsLayout | null;
  sorting: TSorting | null;
  setSorting: TSetSorting | null;
  filtering: TFiltering | null;
  setFiltering: TSetFiltering | null;
  pagination: IPagination | null;
  setPagination: TSetPagination | null;
  resetLayout: TResetLayout | null;
  stickyHeader?: boolean;
  enableColumnFilters?: boolean;
}

// *** EXPORT API ***

type TExportTranslation = TFunction<"export", undefined>;

type TExportCSV = (
  isSimpleExport?: boolean,
  translation?: TExportTranslation
) => boolean;
type TExportJSON = () => boolean;

interface IExportAPI {
  exportCSV: TExportCSV | null;
  exportJSON: TExportJSON | null;
}

// *** STATUS API ***

type TSetRowsStatus = (changer: TChanger<TRowsStatus>) => void;

interface IStatusAPI {
  rowsStatus: TRowsStatus | null;
  setRowsStatus: TSetRowsStatus | null;
}

// *** SOURCE API ***

interface ISourceAPI {
  source: ISource | null;
}

// *** HOOK API ***

type TSetColumnLayout = (
  changer: TPartialChanger<IColumnLayout>,
  columnID?: string
) => void;

type TSetRowStatus = (
  changer: TPartialChanger<IRowStatus>,
  rowID?: string
) => void;

type TClearSelectedRows = () => void;

type TSelectAllRows = () => void;

interface IHookAPI {
  columnLayout: IColumnLayout | null;
  setColumnLayout: TSetColumnLayout;
  rowStatus: IRowStatus | null;
  setRowStatus: TSetRowStatus;
  selectedRows: IRow[] | null;
  clearSelectedRows: TClearSelectedRows;
  selectAllRows: TSelectAllRows;
  resetLayout: TResetLayout;
  stickyHeader?: boolean;
  enableColumnFilters?: boolean;
}

// *** FULL API ***
type TTableParserAPI = ILayoutAPI & IExportAPI;
type TTableRendererAPI = TTableParserAPI & IStatusAPI & ISourceAPI;
type TFullTableAPI = TTableRendererAPI & IHookAPI;

export type {
  IExportAPI,
  IHookAPI,
  ILayoutAPI,
  IStatusAPI,
  TChanger,
  TClearSelectedRows,
  TExportCSV,
  TExportJSON,
  TExportTranslation,
  TFullTableAPI,
  TPartialChanger,
  TSelectAllRows,
  TSetColumnLayout,
  TSetColumnsLayout,
  TSetFiltering,
  TSetPagination,
  TSetRowStatus,
  TSetRowsStatus,
  TSetSorting,
  TResetLayout,
  TTableParserAPI,
  TTableRendererAPI,
};
