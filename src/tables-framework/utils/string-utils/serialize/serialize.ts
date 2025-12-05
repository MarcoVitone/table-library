function serialize(input: unknown): string {
  if (typeof input === "string") {
    return input;
  } else if (input === null) {
    return "null";
  } else if (typeof input === "undefined") {
    return "undefined";
  } else if (
    (typeof input === "object" && "toString" in input) ||
    "toString" in Object.getPrototypeOf(input)
  ) {
    return JSON.stringify(input);
  } else {
    return "";
  }
}

export { serialize };
