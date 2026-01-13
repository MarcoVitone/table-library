import { forEach } from "@/tables-framework/utils/object-utils/for-each/for-each.js";

function flatten(input: object, skipArrays?: boolean): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  forEach(input, ({ value, token, isIterable, skip }) => {
    if (skipArrays && Array.isArray(value)) {
      output[token] = value;
      skip();
    } else if (!isIterable) {
      if (typeof value !== "object" || value === null) {
        output[token] = value;
      }
    }
  });

  return output;
}

export { flatten };
