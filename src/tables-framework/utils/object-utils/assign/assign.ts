import { parseToken } from "@/tables-framework/utils/object-utils/parse-token/parse-token.js";

interface IIndexed {
  [k: string | number]: unknown;
}

type TObj = Record<string, unknown>;
type TArr = unknown[];
type TTarget = TObj | TArr;

function assign(target: TTarget, token: string, value: unknown): TTarget {
  const keys = parseToken(token);

  if (!keys.length) {
    return target;
  }

  let output = target;

  if (typeof keys[0] === "string") {
    if (Array.isArray(output) || typeof output !== "object") {
      output = {};
    }
  } else {
    if (!Array.isArray(output)) {
      output = [];
    }
  }

  let ref: unknown = output;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      (ref as IIndexed)[key] = value;
      return;
    }

    const nextKey = keys[index + 1];

    const currentValue = (ref as IIndexed)[key];

    if (typeof nextKey === "string") {
      if (Array.isArray(currentValue) || typeof currentValue !== "object") {
        (ref as IIndexed)[key] = {};
      }
    } else {
      if (!Array.isArray(currentValue)) {
        (ref as IIndexed)[key] = [];
      }
    }

    ref = (ref as IIndexed)[key];
  });

  return output;
}

export { assign };
