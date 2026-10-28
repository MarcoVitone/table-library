import { AccessibilityElement, useTableAccessibility } from "@/tables-framework/accessibility";
import { type SyntheticEvent, type FC, useId } from "react";
import { useCellEditor } from "@/tables-framework/hooks/use-cell-editor/use-cell-editor";
import type { ICellEditing } from "@/tables-framework/defines/editing.types";
import { Autocomplete } from "@/tables-framework/ui/autocomplete";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { InputContainer } from "./autocomplete-cell.styles.tsx";
import type { ICell } from "@/tables-framework/defines/common.types.ts";

// Definiamo un tipo generico per le opzioni (stringa o oggetto)
export type TAutocompleteOption = string | Record<string, unknown>;

export interface IAutocompleteCellProps extends IBaseCellProps, ICellEditing<Record<string, unknown>, TAutocompleteOption | null> {
  options?: TAutocompleteOption[];
  getOptionLabel?: (option: TAutocompleteOption) => string;
  isOptionEqualToValue?: (
    option: TAutocompleteOption,
    value: TAutocompleteOption
  ) => boolean;
  onCellChange?: (value: TAutocompleteOption | null, cellData: ICell) => void | Promise<void>;
  placeholder?: string;
  disableClearable?: boolean;
}

const AutocompleteCell: FC<IAutocompleteCellProps> = ({
  data,
  options = [],
  getOptionLabel,
  isOptionEqualToValue,
  onCellChange,
  placeholder,
  disableClearable = false,
  editable,
  validate,
  ...rest
}) => {
  const { message } = useTableAccessibility();
  const accessibilityContext = { cell: data, row: data?.row, column: data?.column, area: rest.area };
  const sourceValue = (data?.value as TAutocompleteOption) ?? null;
  const editor = useCellEditor<TAutocompleteOption | null>({ data, sourceValue, onCellChange, editable, validate });
  const feedbackId = useId();

  const handleChange = (
    _event: SyntheticEvent,
    newValue: TAutocompleteOption | null
  ) => {
    editor.change(newValue);
    editor.commit(newValue);
  };

  return (
    <BaseCell data={data} {...rest} overFlow="visible">
      <AccessibilityElement as="div" slot="cellEditor" context={accessibilityContext} style={{ width: "100%" }} aria-busy={editor.isSaving || undefined}>
      <InputContainer>
        <Autocomplete
          value={editor.value}
          disabled={!editor.canEdit || editor.isSaving}
          invalid={!!editor.error}
          describedBy={editor.error || editor.isSaving ? feedbackId : undefined}
          onCancel={editor.cancel}
          onChange={handleChange}
          options={options}
          getOptionLabel={
            getOptionLabel ||
            ((option) =>
              typeof option === "string" ? option : String(option?.label))
          }
          isOptionEqualToValue={isOptionEqualToValue}
          disableClearable={disableClearable}
          placeholder={placeholder}
          label={data?.column?.label}
        />
      </InputContainer>
      {editor.error && <AccessibilityElement as="div" slot="cellError" context={accessibilityContext} id={feedbackId} className="tbl-cell-error" role="alert">{editor.error}</AccessibilityElement>}
      {editor.isSaving && <AccessibilityElement as="div" slot="cellSaving" context={accessibilityContext} id={feedbackId} className="tbl-cell-saving" role="status">{message("saving", "Salvataggio…", accessibilityContext)}</AccessibilityElement>}
      </AccessibilityElement>
    </BaseCell>
  );
};
export { AutocompleteCell };
