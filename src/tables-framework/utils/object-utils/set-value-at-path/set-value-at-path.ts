import { parseToken } from "../parse-token/parse-token";

/** Copies only the objects and arrays along the updated path. */
function setValueAtPath<T extends object>(target: T, token: string, value: unknown): T {
  const keys = Object.hasOwn(target, token) ? [token] : parseToken(token);
  if (!keys.length) return target;

  const update = (current: unknown, index: number): object => {
    const key = keys[index];
    const source =
      current !== null && typeof current === "object" ? current : undefined;
    const copy = Array.isArray(source)
      ? source.slice()
      : source
        ? { ...source }
        : typeof key === "number"
          ? []
          : {};
    const previous =
      source && Object.hasOwn(source, key)
        ? (source as Record<string | number, unknown>)[key]
        : undefined;
    const next =
      index === keys.length - 1 ? value : update(previous, index + 1);

    Object.defineProperty(copy, key, {
      value: next,
      enumerable: true,
      writable: true,
      configurable: true,
    });
    return copy;
  };

  return update(target, 0) as T;
}

export { setValueAtPath };
