function kebabToCamelCase(kebabStr: string): string {
  return kebabStr.replaceAll(/-([a-z])/g, function (_match, letter: string) {
    return letter.toUpperCase();
  });
}

export { kebabToCamelCase };
