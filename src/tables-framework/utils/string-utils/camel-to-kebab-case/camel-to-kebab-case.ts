function camelToKebabCase(camel: string): string {
  const kebab = camel.replaceAll(/([a-z])([A-Z])/g, "$1-$2");
  return kebab.toLowerCase();
}

export { camelToKebabCase };
