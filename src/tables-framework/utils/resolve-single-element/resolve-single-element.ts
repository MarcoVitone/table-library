import type {
  TElementCombo,
  TSingleElement,
} from "@/tables-framework/defines/common.types.ts";

function resolveSingleElement(
  src: TSingleElement | undefined
): TElementCombo | null {
  if (!src) {
    return null;
  }

  if (Array.isArray(src)) {
    return src;
  } else {
    return [src, {}];
  }
}

export { resolveSingleElement };
