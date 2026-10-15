import { type SyntheticEvent, type FC, useState } from "react";
import { Autocomplete } from "@/tables-framework/ui/autocomplete";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { InputContainer } from "./autocomplete-cell.styles.tsx";
import type { ICell } from "@/tables-framework/defines/common.types.ts";

// Definiamo un tipo generico per le opzioni (stringa o oggetto)
export type TAutocompleteOption = string | Record<string, unknown>;

export interface IAutocompleteCellProps extends IBaseCellProps {
  options?: TAutocompleteOption[];
  getOptionLabel?: (option: TAutocompleteOption) => string;
  isOptionEqualToValue?: (
    option: TAutocompleteOption,
    value: TAutocompleteOption
  ) => boolean;
  onCellChange?: (value: TAutocompleteOption | null, cellData: ICell) => void;
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
  ...rest
}) => {
  const sourceValue = (data?.value as TAutocompleteOption) ?? null;
  const [value, setValue] = useState<TAutocompleteOption | null>(sourceValue);
  const [previousSourceValue, setPreviousSourceValue] = useState(sourceValue);

  if (!Object.is(sourceValue, previousSourceValue)) {
    setPreviousSourceValue(sourceValue);
    setValue(sourceValue);
  }

  const handleChange = (
    _event: SyntheticEvent,
    newValue: TAutocompleteOption | null
  ) => {
    setValue(newValue);
    if (data && onCellChange) {
      onCellChange(newValue, data);
    }
  };

  return (
    <BaseCell data={data} {...rest} overFlow="visible">
      <InputContainer>
        <Autocomplete
          value={value}
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
    </BaseCell>
  );
};
export { AutocompleteCell };
