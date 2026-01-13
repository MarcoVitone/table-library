import { flatten } from "@/tables-framework/utils/object-utils/flatten/flatten.js";
import { shallowEqual } from "@/tables-framework/utils/object-utils/shallow-equal/shallow-equal.js";

function deepEqual(obj1: object, obj2: object): boolean {
  const flat1 = flatten(obj1);
  const flat2 = flatten(obj2);

  return shallowEqual(flat1, flat2);
}

export { deepEqual };
