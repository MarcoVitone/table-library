import { useTableLocalization } from "@/tables-framework/localization/use-table-localization";
import { AccessibilityElement, useTableAccessibility } from "@/tables-framework/accessibility";
import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { useId, useRef } from "react";
import { useCellEditor } from "@/tables-framework/hooks/use-cell-editor/use-cell-editor";
import type { ICellEditing } from "@/tables-framework/defines/editing.types";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { InputComponent, InputContainer } from "./input-cell.styles.ts";
import type { ICell } from "@/tables-framework/defines/common.types.ts";

export type TInputType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "autocomplete"
  | "boolean";

interface IInputCellProps extends IBaseCellProps, ICellEditing<Record<string, unknown>, string | number | boolean> {
  inputType?: TInputType;
  inputHeight?: string;
  inputWidth?: string;
  onCellChange?: (value: string | number | boolean, cellData: ICell) => void | Promise<void>;
}

const InputCell: FC<IInputCellProps> = ({
  data,
  inputType = "text",
  inputHeight,
  inputWidth,
  onCellChange,
  editable,
  validate,
  ...rest
}) => {
  const t = useTableLocalization();
  const { message } = useTableAccessibility();
  const accessibilityContext = { cell: data, row: data?.row, column: data?.column, area: rest.area };
  const sourceValue = (data?.value as string | number) ?? "";
  const editor = useCellEditor<string | number | boolean>({ data, sourceValue, onCellChange, editable, validate });
  const value = editor.value;
  const feedbackId = useId();
  const cancelled = useRef(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    editor.change(inputType === "boolean" ? e.target.checked : e.target.value);
  };

  const handleBlur = (event?: React.FocusEvent<HTMLInputElement>) => {
    if (cancelled.current) { cancelled.current = false; return; }
    if (event?.currentTarget.validity && !event.currentTarget.validity.valid) {
      editor.setError(event.currentTarget.validationMessage);
      return;
    }
    const nextValue =
      inputType === "number" && value !== "" ? Number(value) : value;
    if (typeof nextValue === "number" && !Number.isFinite(nextValue)) {
      if (editor.error !== t("paste.number")) editor.setError(t("paste.number"));
      return;
    }
    editor.commit(nextValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelled.current = true;
      editor.cancel();
      e.currentTarget.blur();
    }
  };

  return (
    <BaseCell data={data} {...rest}>
      <AccessibilityElement as="div" slot="cellEditor" context={accessibilityContext} style={{ width: "100%" }} aria-busy={editor.isSaving || undefined}>
      <InputContainer>
        <InputComponent
          accessibilitySlot="cellInput" accessibilityContext={accessibilityContext}
          aria-label={data?.column?.label}
          type={inputType === "boolean" ? "checkbox" : inputType === "autocomplete" ? "text" : inputType}
          step={inputType === "number" ? "any" : undefined}
          height={inputHeight}
          width={inputWidth}
          value={typeof value === "boolean" ? undefined : value}
          checked={inputType === "boolean" ? Boolean(value) : undefined}
          readOnly={!editor.canEdit}
          disabled={editor.isSaving || (inputType === "boolean" && !editor.canEdit)}
          aria-invalid={!!editor.error || undefined}
          aria-describedby={editor.error || editor.isSaving ? feedbackId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      </InputContainer>
      {editor.error && <AccessibilityElement as="div" slot="cellError" context={accessibilityContext} id={feedbackId} className="tbl-cell-error" role="alert">{editor.error}</AccessibilityElement>}
      {editor.isSaving && <AccessibilityElement as="div" slot="cellSaving" context={accessibilityContext} id={feedbackId} className="tbl-cell-saving" role="status">{message("saving", t("a11y.saving"), accessibilityContext)}</AccessibilityElement>}
      </AccessibilityElement>
    </BaseCell>
  );
};

export type { IInputCellProps };
export { InputCell };
