import { type SyntheticEvent, type FC, useState } from "react";
import { Autocomplete, TextField, type InputProps } from "@mui/material";
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
  const [value, setValue] = useState<TAutocompleteOption | null>(
    (data?.value as TAutocompleteOption) ?? null
  );

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
          disablePortal={false}
          fullWidth
          size="small"
          disableClearable={disableClearable}
          renderInput={(params) => {
            const { InputProps, ...restParams } = params;
            return (
              <TextField
                {...restParams}
                variant="standard"
                placeholder={placeholder}
                slotProps={{
                  input: {
                    ...InputProps,
                    disableUnderline: true,
                    style: { fontSize: "0.8125rem", padding: "0 0.5rem" },
                  } as Partial<InputProps>,
                }}
              />
            );
          }}
          sx={{
            width: "100%",
            minWidth: "100px",
            flex: 1,
            "& .MuiAutocomplete-inputRoot": {
              padding: "0 !important",
              height: "100%",
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </InputContainer>
    </BaseCell>
  );
};

export { AutocompleteCell };
