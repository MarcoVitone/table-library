import { useMemo } from "react";
import type {
  IOutput,
  TDef,
  TSrc,
} from "@/tables-framework/utils/resolve-multiple-elements/resolve-multiple-elements.ts";
import { resolveMultipleElements } from "@/tables-framework/utils/resolve-multiple-elements/resolve-multiple-elements.ts";

function useCustomElements(elems: TSrc, def: TDef): IOutput {
  const { header, body, footer } = useMemo(() => {
    return resolveMultipleElements(elems, def);
  }, [elems, def]);

  return {
    header,
    body,
    footer,
    // header: useMemoElement(header),
    // body: useMemoElement(body),
    // footer: useMemoElement(footer)
  };
}

export { useCustomElements };
