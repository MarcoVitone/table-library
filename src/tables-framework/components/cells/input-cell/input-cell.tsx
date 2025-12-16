import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { useState } from "react";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import { InputComponent, InputContainer } from "./input-cell.styles.ts";
import type { ICell } from "../../../defines/common.types.ts";

export type TInputType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "autocomplete"
  | "boolean";

interface IInputCellProps extends IBaseCellProps {
  inputType?: TInputType;
  inputHeight?: string;
  inputWidth?: string;
  onCellChange?: (value: string | number | boolean, cellData: ICell) => void;
}

const InputCell: FC<IInputCellProps> = ({
  data,
  inputType = "text",
  inputHeight,
  inputWidth,
  onCellChange,
  ...rest
}) => {
  const [value, setValue] = useState<string | number>(
    (data?.value as string | number) ?? ""
  );

  // useEffect(() => {
  //   setValue((data?.value as string | number) ?? "");
  // }, [data?.value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    if (value !== data?.value) {
      if (data) {
        onCellChange?.(value, data);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <BaseCell data={data} {...rest}>
      <InputContainer>
        <InputComponent
          type={inputType}
          height={inputHeight}
          width={inputWidth}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      </InputContainer>
    </BaseCell>
  );
};

export type { IInputCellProps };
export { InputCell };
