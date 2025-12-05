import { getEntries } from "../get-entries/get-entries.js";

interface IObj {
  [key: string | number | symbol]: unknown;
}

interface IArr {
  [index: number]: unknown;
}

type TItem = IObj | IArr | object;

interface ICbArgs {
  item: TItem;
  key: string | number;
  value: unknown;
  token: string;
  depth: number;
  isIterable: boolean;
  terminate: () => void;
  skip: () => void;
}

type TCb<TCtx> = (args: ICbArgs, context: TCtx) => TCtx | void;

type TPattern = string | number | RegExp;

interface IForEachOptions<TCtx> {
  backwards?: boolean;
  ignore?: TPattern | TPattern[];
  only?: TPattern | TPattern[];
  maxDepth?: number;
  iterateStrings?: boolean;
  context?: TCtx;
}

function forEach<TInput extends TItem, TCtx>(
  input: TInput,
  cb: TCb<TCtx>,
  options: IForEachOptions<TCtx> = {}
): TInput {
  const state = {
    terminate: false,
    skip: false,
  };

  const referenceSet = new WeakSet<TItem>([input]);
  const circularSet = new WeakSet<TItem>([input]);

  const arr = <T = unknown>(v: T | T[]): T[] => {
    return Array.isArray(v) ? v : [v];
  };

  const check = (
    pattern: TPattern,
    key: string | number,
    vToken: string
  ): boolean => {
    if (typeof pattern === "string") {
      if (typeof key === "string") {
        return pattern === key;
      }
    } else if (typeof pattern === "number") {
      if (typeof key === "number") {
        return pattern === key;
      }
    } else {
      return pattern.test(vToken);
    }

    return false;
  };

  const getFilteredEntries = (value: unknown): [string | number, unknown][] => {
    if (typeof value === "string") {
      if (options.iterateStrings) {
        return getEntries(value);
      } else {
        return [];
      }
    } else {
      return getEntries(value);
    }
  };

  const getNextToken = (prefix: string, key: string | number): string => {
    if (typeof key === "string") {
      return prefix + (prefix ? "." : "") + key;
    } else {
      return prefix + `[${key}]`;
    }
  };

  const dispatch = (args: ICbArgs, context: TCtx): 0 | 1 | 2 | TCtx => {
    const acc = cb(args, context) || context;

    if (state.terminate) {
      return 2;
    } else if (state.skip) {
      state.skip = false;
      return 1;
    } else {
      return acc;
    }
  };

  const recurse = (
    item: TItem,
    entries: [string | number, unknown][],
    token: string,
    depth: number,
    context: TCtx
  ) => {
    for (const element of entries) {
      if (state.terminate) {
        return;
      }

      const [key, value] = element;

      const vToken = getNextToken(token, key);
      const vEntries = getFilteredEntries(value);
      const vIsIterable = !!vEntries.length;
      const vDepth = depth + 1;

      if (options.ignore) {
        const ignore = arr(options.ignore);
        const skip = ignore.some((p) => check(p, key, vToken));

        if (skip) {
          continue;
        }
      }

      if (options.only) {
        const only = arr(options.only);
        const skip = !only.some((p) => check(p, key, vToken));

        if (skip) {
          continue;
        }
      }

      const args = {
        item,
        key,
        value,
        token: vToken,
        depth,
        isIterable: vIsIterable,
        terminate() {
          state.terminate = true;
        },
        skip() {
          state.skip = true;
        },
      };

      let vContext = context;

      if (!options.backwards) {
        const result = dispatch(args, context);

        if (result === 1) {
          continue;
        } else if (result === 2) {
          return;
        } else if (result && result !== context) {
          vContext = result;
        }
      }

      if (vIsIterable) {
        if (!options.maxDepth || depth < options.maxDepth) {
          const entry = value as TItem;

          if (referenceSet.has(entry)) {
            continue;
          }

          if (circularSet.has(entry)) {
            continue;
          }

          referenceSet.add(entry);
          circularSet.add(entry);

          recurse(entry, vEntries, vToken, vDepth, vContext);

          circularSet.delete(entry);
        }
      }

      if (options.backwards) {
        const result = dispatch(args, context);

        if (result === 1) {
          console.warn("CANNOT SKIP BRANCH RECURSION IN BACKWARDS MODE");
        } else if (result === 2) {
          return;
        } else if (result && result !== context) {
          console.warn("CANNOT USE CONTEXT IN BACKWARDS MODE");
        }
      }
    }
  };

  recurse(
    input,
    getFilteredEntries(input),
    "",
    0,
    options.context ?? ({} as TCtx)
  );

  return input;
}

export type { ICbArgs, IForEachOptions };
export { forEach };
