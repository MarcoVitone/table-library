import type { ElementType } from "react";
import { isElement } from "@/tables-framework/utils/react-utils/index.js";
import type {
  IMultipleElements,
  TElementCombo,
  TSingleElement,
} from "@/tables-framework/defines/common.types.ts";
import { resolveSingleElement } from "@/tables-framework/utils/resolve-single-element/resolve-single-element.js";

type TSrc = TSingleElement | IMultipleElements | undefined;

type TDef = ElementType;

interface IOutput {
  header: TElementCombo;
  body: TElementCombo;
  footer: TElementCombo;
}

function resolveMultipleElements(src: TSrc, def: TDef): IOutput {
  if (!src) {
    return {
      header: [def, {}],
      body: [def, {}],
      footer: [def, {}],
    };
  }

  if (Array.isArray(src)) {
    return {
      header: src,
      body: src,
      footer: src,
    };
  } else if (isElement(src)) {
    return {
      header: [src as ElementType, {}],
      body: [src as ElementType, {}],
      footer: [src as ElementType, {}],
    };
  } else {
    const { header, body, footer } = src as IMultipleElements;

    return {
      header: resolveSingleElement(header) || [def, {}],
      body: resolveSingleElement(body) || [def, {}],
      footer: resolveSingleElement(footer) || [def, {}],
    };
  }
}

export type { IOutput, TDef, TSrc };
export { resolveMultipleElements };
