import { useCallback } from "react";
import type {
  TExportTranslation,
  IExportAPI,
  TExportCSV,
  TExportJSON,
} from "../../../../defines/api.types";
import type {
  ISource,
  TNonNullable,
  ICell,
  IRow,
  IDatum,
} from "../../../../defines/common.types";
import { StringUtils, ObjectUtils } from "../../../../utils";

type TGetCSV = (
  lt?: "\r\n" | "\n",
  isSimpleExport?: boolean,
  translation?: TExportTranslation
) => string;

type TGetJSON = () => string;

interface IProps {
  source: ISource;
}

function useExport({ source }: IProps): TNonNullable<IExportAPI> {
  const getDownloadUrl = useCallback(
    (content: string, type: "text/csv" | "application/json") => {
      const blob = new Blob([content], { type });
      const url = globalThis.URL.createObjectURL(blob);
      return {
        url,
        revoke() {
          globalThis.URL.revokeObjectURL(url);
        },
      };
    },
    []
  );

  const download = useCallback(
    (content: string, type: "text/csv" | "application/json") => {
      const { url } = getDownloadUrl(content, type);
      globalThis.open(url);
    },
    [getDownloadUrl]
  );

  const formatCell = (
    cellData: ICell,
    translation?: TExportTranslation
  ): ICell => {
    let cellValue =
      cellData.value === undefined || cellData.value === null
        ? ""
        : cellData.value;

    // Doing this because \n and % break the rows and ; add another column on the Excel file
    if (typeof cellValue === "string") {
      cellValue = cellValue.replace(/\n|%/g, " \\ ").replace(/;/g, ",");
    }

    // In order to have a correct translations for boolean and "Y/N" values.
    // Will enter here on if translation function is not undefined.
    if (translation) {
      const typeOfCellValue = typeof cellValue;
      const trueLabel = translation("true");
      const falseLabel = translation("false");
      const yesLabel = translation("yes");
      const noLabel = translation("no");

      // Checking the translations' labels too in order to avoid showing "undefined".
      if (typeOfCellValue === "boolean" && trueLabel && falseLabel) {
        cellValue = cellValue ? trueLabel : falseLabel;
      }

      // Same here
      if (
        typeOfCellValue === "string" &&
        (cellValue === "Y" || cellValue === "N") &&
        yesLabel &&
        noLabel
      ) {
        cellValue = cellValue === "Y" ? yesLabel : noLabel;
      }
    }

    return {
      ...cellData,
      ...{
        value: cellValue,
      },
    };
  };

  const getCSV = useCallback<TGetCSV>(
    (lt = "\r\n", isSimpleExport = false, translation) => {
      let rows: IRow[] = [];
      if (isSimpleExport) {
        // Fist we remove all empty columns' titles
        const headerRows = [
          {
            ...source.header.rows[0],
            ...{
              cells: source.header.rows[0].cells
                .filter((cellValue: ICell) => !!cellValue.value)
                .map((cellData: ICell) => formatCell(cellData, translation)),
            },
          },
        ];

        const bodyRows = source.body.rows.map((singleRow: IRow) => {
          return {
            ...singleRow,
            ...{
              cells: singleRow.cells.map((cellData: ICell) =>
                formatCell(cellData, translation)
              ),
            },
          };
        });
        // Removing nullable values in footer
        const footerRows = [
          {
            ...source.footer.rows[0],
            ...{
              cells: source.footer.rows[0].cells.filter(
                (cellValue: ICell) => !!cellValue.value
              ),
            },
          },
        ];
        rows = [...headerRows, ...bodyRows, ...footerRows];
      } else {
        rows = [
          ...source.header.rows,
          ...source.body.rows,
          ...source.footer.rows,
        ];
      }

      return rows
        .map((r) => {
          const output: string[] = [];

          r.cells.forEach((c) => {
            for (let i = 0; i < c.colSpan; i++) {
              output.push(StringUtils.serialize(c.value));
            }
          });

          return output.join(isSimpleExport ? ";" : ",");
        })
        .join(lt);
    },
    [source.header.rows, source.body.rows, source.footer.rows]
  );

  const getJSON = useCallback<TGetJSON>(() => {
    const data: IDatum[] = source.body.rows.map((row) => {
      const item: IDatum = {};

      const mem = new Set<string>();

      row.cells.forEach((cell) => {
        const { dataKey } = cell.column;

        if (!mem.has(dataKey)) {
          mem.add(dataKey);

          ObjectUtils.assign(item, dataKey, cell.value);
        }
      });

      return item;
    });

    return JSON.stringify(data, null, 2);
  }, [source.body.rows]);

  const exportCSV = useCallback<TExportCSV>(
    (isSimpleExport = false, translation) => {
      const content = getCSV("\r\n", isSimpleExport, translation);
      try {
        download(content, "text/csv");
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    [download, getCSV]
  );

  const exportJSON = useCallback<TExportJSON>(() => {
    const content = getJSON();

    try {
      download(content, "application/json");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [download, getJSON]);

  return {
    exportCSV,
    exportJSON,
  };
}

export { useExport };
