import { useCallback } from "react";
import type {
  TExportTranslation,
  IExportAPI,
  TExportCSV,
  TExportJSON,
} from "@/tables-framework/defines/api.types";
import type {
  ISource,
  TNonNullable,
  ICell,
  IDatum,
} from "@/tables-framework/defines/common.types";
import { StringUtils, ObjectUtils } from "@/tables-framework/utils";

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
    let cellValue = cellData.value ?? "";

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
      const delimiter = isSimpleExport ? ";" : ",";
      const rows = [
        ...(isSimpleExport ? source.header.rows.slice(0, 1) : source.header.rows),
        ...source.body.rows,
        ...(isSimpleExport ? source.footer.rows.slice(0, 1) : source.footer.rows),
      ];
      // Omit untitled columns consistently from every row in simple exports.
      const included = new Set<number>();
      let position = 0;
      const header = source.header.rows[0];
      if (isSimpleExport && header) {
        header.cells.forEach(cell => {
          for (let i = 0; i < cell.colSpan; i++) {
            if (cell.value !== null && cell.value !== undefined && cell.value !== "") included.add(position);
            position++;
          }
        });
      }
      return rows.map(row => {
        const output: string[] = [];
        let position = 0;
        row.cells.forEach(cell => {
          const value = isSimpleExport ? formatCell(cell, translation).value : cell.value;
          const text = value == null ? "" : StringUtils.serialize(value);
          const escaped = text.includes(delimiter) || /["\r\n]/.test(text)
            ? '"' + text.replaceAll('"', '""') + '"' : text;
          for (let i = 0; i < cell.colSpan; i++) {
            if (!isSimpleExport || !header || included.has(position)) output.push(escaped);
            position++;
          }
        });
        return output.join(delimiter);
      }).join(lt);
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
