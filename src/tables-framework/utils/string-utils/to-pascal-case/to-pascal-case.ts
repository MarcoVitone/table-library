function toPascalCase(str: string): string {
  if (/^[a-z\d]+$/i.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str
    .replaceAll(
      /([a-z\d])([a-z\d]*)/gi,
      (_g0, g1: string, g2: string) => g1.toUpperCase() + g2.toLowerCase()
    )
    .replaceAll(/[^a-z\d]/gi, "");
}

export { toPascalCase };
