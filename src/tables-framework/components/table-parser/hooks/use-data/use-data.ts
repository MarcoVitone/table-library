import { useMemo } from "react";
import type {
  IColumn,
  ITableLayout,
  IDatum,
  IDataSource,
  IFlatDatum,
} from "../../../../defines/common.types";
import { ObjectUtils, StringUtils, FilterUtils } from "../../../../utils";

interface IProps {
  columns: IColumn[];
  tableLayout: ITableLayout;
  data: IDatum[];
  idKey: string;
}

function useData({ columns, tableLayout, data, idKey }: IProps): IColumn[] {
  const sources = useMemo<IDataSource[]>(() => {
    return data.map((full) => {
      const flat = ObjectUtils.flatten(full, true) as IFlatDatum;
      let id = "void";
      if (flat[idKey]) {
        id = StringUtils.serialize(flat[idKey]);
      } else {
        console.warn(`RECEIVED DATUM WITHOUT A VALID ID`);
      }
      return { id, flat, full };
    });
  }, [data, idKey]);

  const filtered = useMemo<IDataSource[]>(() => {
    if (tableLayout.filtering?.length) {
      const filters = tableLayout.filtering;
      return sources.filter(({ flat }) => {
        return filters.every(({ key, op, val: value }) => {
          const _content = flat[key];
          const val = typeof value == "boolean" ? value.toString() : value;
          const content =
            typeof _content == "boolean" ? _content.toString() : _content;

          switch (op) {
            case "eq":
              return content === val;
            case "ne":
              return content !== val;
            case "exists":
              return !!content;
            default:
              break;
          }
          if (content === undefined || content === null) return true;
          switch (op) {
            case "gt":
              return content > val;
            case "lt":
              return content < val;
            case "gte":
              return content >= val;
            case "lte":
              return content <= val;
            case "regexp":
              if (val instanceof RegExp)
                return val.test(StringUtils.serialize(content));
              return false;
            case "match":
              if (typeof val === "string")
                return StringUtils.serialize(content)
                  .toLowerCase()
                  .includes(val);
              return false;
            case "in":
              if (Array.isArray(val)) {
                return (
                  (typeof content === "string" ||
                    typeof content === "number" ||
                    typeof content === "boolean") &&
                  val.includes(content)
                );
              }
              return false;
            default:
              return true;
          }
        });
      });
    } else {
      return sources;
    }
  }, [sources, tableLayout.filtering]);

  const sorted = useMemo<IDataSource[]>(() => {
    if (
      tableLayout.sorting?.length &&
      !tableLayout.sorting.some((i) => i.isServerSide)
    ) {
      return [...filtered].sort(
        FilterUtils.multiSorter(tableLayout.sorting, (o) => o.flat)
      );
    } else {
      return filtered;
    }
  }, [filtered, tableLayout.sorting]);

  return useMemo<IColumn[]>(() => {
    return columns.map((c) => {
      c.data = sorted.map(({ id, flat, full }) => {
        // 1. Prova a prendere il valore dalla versione piatta (veloce)
        let value = flat[c.dataKey];

        // 2. Se è undefined, prova a risolvere il percorso annidato (es. "status.label") nell'oggetto completo
        if (value === undefined && c.dataKey) {
          const keys = ObjectUtils.parseToken(c.dataKey);
          let current: unknown = full;
          let found = true;

          for (const key of keys) {
            if (
              current &&
              typeof current === "object" &&
              key in (current as Record<string, unknown>)
            ) {
              current = (current as Record<string, unknown>)[key];
            } else {
              found = false;
              break;
            }
          }
          if (found) {
            value = current as React.ReactNode;
          }
        }

        return {
          value,
          source: { id, flat, full },
        };
      });
      return c;
    });
  }, [columns, sorted]);
}

export { useData };
