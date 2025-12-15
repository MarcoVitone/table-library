import type { FC, ReactNode } from "react";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import { TableStatusChip } from "../../table-sub-components/chip/chip.tsx";
import { type IStatusStyle, type TStatusConfig } from "./status-constants.ts";

interface IStatusCellProps extends IBaseCellProps {
  statusConfig?: TStatusConfig;
  labelKey?: string;
  getLabel?: (value: unknown, rowData: Record<string, unknown>) => string;
  getStatusKey?: (
    value: unknown,
    rowData: Record<string, unknown>
  ) => string | number;
  fallbackStyle?: IStatusStyle;
}

const getNestedValue = (
  obj: Record<string, unknown>,
  path: string
): string | undefined => {
  if (!path) return undefined;
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  // Ritorna undefined se il valore è null/undefined, altrimenti lo converte in stringa
  return current !== undefined && current !== null
    ? String(current)
    : undefined;
};

const StatusCell: FC<IStatusCellProps> = ({
  data,
  statusConfig,
  labelKey,
  getLabel,
  getStatusKey,
  fallbackStyle,
  ...rest
}) => {
  const rawValue = data.value;
  const rowData = data.row.source.full as Record<string, unknown>;

  let lookupKey: string | number;

  if (getStatusKey) {
    // Logica custom definita dall'utente
    lookupKey = getStatusKey(rawValue, rowData);
  } else {
    // Default: usa il valore della cella come stringa o numero
    lookupKey = (rawValue as string | number) ?? "unknown";
  }

  const style = statusConfig?.[lookupKey];
  const activeStyle = style || fallbackStyle;

  // 3. Determina cosa renderizzare
  let content: ReactNode;

  let label: string | undefined;

  if (getLabel) {
    // A. Calcolata via funzione
    label = getLabel(rawValue, rowData);
  } else if (labelKey) {
    // B. Estratta da un campo specifico della riga
    // Supporta anche nested keys se necessario usando una utility come lodash.get,
    // ma qui facciamo accesso diretto per semplicità
    label = getNestedValue(rowData, labelKey ?? "") ?? "";
  } else if (activeStyle?.label) {
    // C. Presa dalla configurazione statica
    label = activeStyle.label;
  } else {
    // D. Fallback sul valore grezzo
    label = String(rawValue ?? "");
  }

  if (style) {
    // Caso A: Abbiamo trovato una configurazione per questo stato
    content = (
      <TableStatusChip
        label={label}
        backgroundColor={style.backgroundColor}
        textColor={style.textColor}
        iconColor={style.iconColor}
        iconChip={style.iconChip}
        style={style.style}
      />
    );
  } else if (fallbackStyle) {
    // Caso B: Valore non trovato, uso il fallback
    content = (
      <TableStatusChip
        label={label}
        backgroundColor={fallbackStyle.backgroundColor}
        textColor={fallbackStyle.textColor}
        iconColor={fallbackStyle.iconColor}
      />
    );
  } else {
    // Caso C: Nessuna config, mostro solo il valore (o un chip grigio standard)
    content = label;
  }

  return (
    <BaseCell data={data} {...rest}>
      {content}
    </BaseCell>
  );
};

export { StatusCell };
