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
    // FLATTEN INPUT DATA OBJECTS

    return data.map((full) => {
      const flat = ObjectUtils.flatten(full, true) as IFlatDatum;

      let id = "void";

      if (flat[idKey]) {
        id = StringUtils.serialize(flat[idKey]);
      } else {
        console.warn(`RECEIVED DATUM WITHOUT A VALID ID`);
      }

      return {
        id,
        flat,
        full,
      };
    });
  }, [data, idKey]);

  const filtered = useMemo<IDataSource[]>(() => {
    // FILTER DATA

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
              // Continue to next switch for other operations
              break;
          }

          if (typeof content === "undefined" || content === null) {
            return true;
          }

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
              if (val instanceof RegExp) {
                return val.test(StringUtils.serialize(content));
              } else {
                console.warn(`INVALID REGEXP IN FILTER`);
                return false;
              }
            case "match":
              if (typeof val === "string") {
                const contentLower =
                  StringUtils.serialize(content).toLowerCase();
                return contentLower.includes(val);
              } else {
                console.warn(`INVALID STRING IN FILTER`);
                return false;
              }
            default:
              console.warn(`UNRECOGNIZED OPERATION IN FILTER`);
              return true;
          }
        });
      });
    } else {
      return sources;
    }
  }, [sources, tableLayout.filtering]);

  const sorted = useMemo<IDataSource[]>(() => {
    // SORT DATA

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
    // LOAD DATA INTO COLUMNS

    return columns.map((c) => {
      c.data = sorted.map(({ id, flat, full }) => ({
        value: flat[c.dataKey],
        source: {
          id,
          flat,
          full,
        },
      }));

      return c;
    });
  }, [columns, sorted]);
}

export { useData };
